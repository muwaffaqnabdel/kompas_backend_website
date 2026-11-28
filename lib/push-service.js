import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import webpush from 'web-push';
import prisma from '@/lib/prisma';

let vapidConfigured = false;
let tableChecked = false;

function readEnvFileFallback() {
  const result = {};
  try {
    const candidates = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), 'backend', '.env'),
    ];
    for (const filePath of candidates) {
      if (!fs.existsSync(filePath)) continue;
      const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (!match) continue;
        const key = match[1];
        const val = match[2].trim().replace(/^["']|["']$/g, '');
        if (!result[key]) result[key] = val;
      }
      break;
    }
  } catch {}
  return result;
}

function getVapidConfig() {
  let publicKey = process.env.VAPID_PUBLIC_KEY || '';
  let privateKey = process.env.VAPID_PRIVATE_KEY || '';
  let subject = process.env.VAPID_SUBJECT || 'mailto:admin@kompas.id';

  if (!publicKey || !privateKey) {
    const fallback = readEnvFileFallback();
    publicKey = publicKey || fallback.VAPID_PUBLIC_KEY || '';
    privateKey = privateKey || fallback.VAPID_PRIVATE_KEY || '';
    subject = fallback.VAPID_SUBJECT || subject;
  }

  return { publicKey, privateKey, subject };
}

function ensureVapidConfigured() {
  const { publicKey, privateKey, subject } = getVapidConfig();
  if (!publicKey || !privateKey) {
    return { configured: false, publicKey: '' };
  }
  if (!vapidConfigured) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
  }
  return { configured: true, publicKey };
}

async function ensurePushSubscriptionTable() {
  if (tableChecked) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PushSubscription" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "endpoint" TEXT NOT NULL,
        "p256dh" TEXT NOT NULL,
        "auth" TEXT NOT NULL,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PushSubscription_userId_idx" ON "PushSubscription"("userId");
    `);
    tableChecked = true;
  } catch (err) {
    console.warn('[PUSH TABLE CHECK WARNING]', err?.message);
  }
}

export function getVapidPublicKey() {
  const { configured, publicKey } = ensureVapidConfigured();
  return { configured, publicKey };
}

export async function getUserPushSubscriptionCount(userId) {
  if (!userId) return 0;
  await ensurePushSubscriptionTable();
  const rows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count FROM "PushSubscription" WHERE "userId" = ${userId}
  `;
  return Number(rows?.[0]?.count || 0);
}

export async function savePushSubscription(userId, subscription, userAgent = null) {
  if (!userId) throw new Error('User tidak terautentikasi.');
  const endpoint = String(subscription?.endpoint || '').trim();
  const p256dh = String(subscription?.keys?.p256dh || '').trim();
  const auth = String(subscription?.keys?.auth || '').trim();

  if (!endpoint || !p256dh || !auth) {
    throw new Error('Data langganan push perangkat tidak lengkap.');
  }

  await ensurePushSubscriptionTable();

  const id = crypto.randomUUID();
  const ua = userAgent ? String(userAgent).slice(0, 250) : null;

  await prisma.$executeRaw`
    INSERT INTO "PushSubscription" ("id", "userId", "endpoint", "p256dh", "auth", "userAgent", "createdAt", "updatedAt")
    VALUES (${id}, ${userId}, ${endpoint}, ${p256dh}, ${auth}, ${ua}, NOW(), NOW())
    ON CONFLICT ("endpoint")
    DO UPDATE SET
      "userId" = EXCLUDED."userId",
      "p256dh" = EXCLUDED."p256dh",
      "auth" = EXCLUDED."auth",
      "userAgent" = EXCLUDED."userAgent",
      "updatedAt" = NOW()
  `;

  const count = await getUserPushSubscriptionCount(userId);
  return { saved: true, subscriptionCount: count };
}

export async function removePushSubscription(userId, endpoint) {
  if (!userId || !endpoint) return { removed: false };
  await ensurePushSubscriptionTable();
  await prisma.$executeRaw`
    DELETE FROM "PushSubscription" WHERE "userId" = ${userId} AND "endpoint" = ${String(endpoint)}
  `;
  const count = await getUserPushSubscriptionCount(userId);
  return { removed: true, subscriptionCount: count };
}

export async function sendPushToUser(userId, payload = {}) {
  const { configured } = ensureVapidConfigured();
  if (!configured) {
    return { sent: 0, failed: 0, removed: 0, total: 0, reason: 'VAPID_NOT_CONFIGURED' };
  }
  if (!userId) {
    return { sent: 0, failed: 0, removed: 0, total: 0, reason: 'MISSING_USER_ID' };
  }

  await ensurePushSubscriptionTable();

  const subscriptions = await prisma.$queryRaw`
    SELECT "id", "endpoint", "p256dh", "auth"
    FROM "PushSubscription"
    WHERE "userId" = ${userId}
  `;

  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return { sent: 0, failed: 0, removed: 0, total: 0, reason: 'NO_SUBSCRIPTIONS' };
  }

  const bodyStr = JSON.stringify({
    title: payload.title || 'Notifikasi KOMPAS',
    body: payload.body || '',
    tag: payload.tag || `kompas-push-${Date.now()}`,
    url: payload.url || '/dashboard',
    dpOrder: payload.dpOrder ?? null,
    participantId: payload.participantId || null,
    teamName: payload.teamName || '',
    schoolName: payload.schoolName || '',
    eventName: payload.eventName || '',
    queueNumber: payload.queueNumber ?? null,
    forceShow: Boolean(payload.forceShow),
    requireInteraction: Boolean(payload.requireInteraction),
    sentAt: new Date().toISOString(),
  });

  let sent = 0;
  let failed = 0;
  let removed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          bodyStr,
          { TTL: 180, urgency: payload.dpOrder === 1 ? 'high' : 'normal' }
        );
        sent += 1;
      } catch (err) {
        const statusCode = err?.statusCode || err?.status;
        if (statusCode === 404 || statusCode === 410) {
          removed += 1;
          try {
            await prisma.$executeRaw`
              DELETE FROM "PushSubscription" WHERE "id" = ${sub.id}
            `;
          } catch {}
        } else {
          failed += 1;
          console.warn('[WEB PUSH SEND ERROR]', statusCode, err?.message);
        }
      }
    })
  );

  return { sent, failed, removed, total: subscriptions.length };
}

export async function notifyParticipantDPMove(participant, targetIndex, targetDpName = '') {
  try {
    if (!participant?.userId) return;

    const teamLabel = participant.teamName || 'Tim Anda';
    let title = '';
    let body = '';
    let dpOrder = targetIndex;

    if (targetIndex === 1) {
      title = `Panggilan Masuk Pos DP 1 — ${teamLabel}`;
      body = 'Panitia memanggil pasukan Anda masuk ke Pos DP 1 (Pengecekan Dokumen). Segera merapat bersama danton & berkas fisik.';
    } else if (targetIndex === 2) {
      title = `${teamLabel} Masuk Pos DP 2 (Photoshoot)`;
      body = 'Pasukan diarahkan ke studio photoshoot resmi. Rapikan atribut dan ikuti arahan petugas.';
    } else if (targetIndex === 3) {
      title = `${teamLabel} Masuk Pos DP 3 (Persiapan)`;
      body = 'Pasukan masuk ruang pemanasan akhir sebelum tampil di Arena Utama.';
    } else if (targetIndex === 4) {
      title = `${teamLabel} Masuk Pos DP 4 (Arena Utama)`;
      body = 'Saatnya tampil di Arena Utama di hadapan Dewan Juri. Tampilkan performa terbaik!';
    } else if (targetIndex > 4) {
      dpOrder = 5;
      title = `${teamLabel} — Penampilan Selesai`;
      body = 'Seluruh tahapan DP 1–4 telah selesai. Pantau nilai & evaluasi di portal KOMPAS.';
    } else {
      return;
    }

    await sendPushToUser(participant.userId, {
      title,
      body,
      tag: `kompas-dp-${participant.id}-${dpOrder}`,
      url: '/dashboard',
      dpOrder,
      participantId: participant.id,
      teamName: participant.teamName,
      schoolName: participant.schoolName,
      queueNumber: participant.queueNumber,
      dpName: targetDpName,
      forceShow: false,
      requireInteraction: targetIndex === 1,
    });
  } catch (err) {
    console.warn('[NOTIFY DP MOVE PUSH WARNING]', err?.message);
  }
}

