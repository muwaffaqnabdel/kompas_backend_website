import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Memulai seeding data awal KOMPAS...');

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Buat Akun Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@kompas.id' },
    update: {},
    create: {
      email: 'admin@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Super Admin Pusat KOMPAS',
      phone: '081234567890',
      globalRole: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`[SEED] Super Admin siap: ${superAdmin.email}`);

  // 2. Buat Event LKBB Nasional 2026
  const event = await prisma.event.upsert({
    where: { slug: 'lkbb-nasional-2026' },
    update: {},
    create: {
      name: 'LKBB Nasional Paskibra 2026',
      slug: 'lkbb-nasional-2026',
      description: 'Lomba Kreasi Baris Berbaris Terbuka Tingkat Nasional SMA/SMK Sederajat.',
      eventDate: new Date('2026-11-15T08:00:00Z'),
      location: 'GOR Remaja Jakarta Timur',
      status: 'REGISTRATION_OPEN',
      dpFlowLocked: false,
      scoringLocked: false,
    },
  });
  console.log(`[SEED] Event siap: ${event.name}`);

  // 3. Buat 4 Decision Points Standar (PRD Addendum 1.2)
  const dps = [
    { orderIndex: 1, code: 'DOC_CHECK', name: 'DP 1 - Pengecekan Dokumen & Berkas', capacityLimit: 1, isFinal: false },
    { orderIndex: 2, code: 'PHOTOSHOOT', name: 'DP 2 - Photoshoot Resmi Pasukan', capacityLimit: 1, isFinal: false },
    { orderIndex: 3, code: 'FINAL_PREP', name: 'DP 3 - Persiapan Terakhir & Pemanasan', capacityLimit: 1, isFinal: false },
    { orderIndex: 4, code: 'STAGE_PERFORMANCE', name: 'DP 4 - Penampilan Lapangan Utama', capacityLimit: 1, isFinal: true },
  ];

  const createdDPs = [];
  for (const dp of dps) {
    const existing = await prisma.decisionPoint.findFirst({
      where: { eventId: event.id, orderIndex: dp.orderIndex },
    });
    if (!existing) {
      const created = await prisma.decisionPoint.create({
        data: {
          eventId: event.id,
          orderIndex: dp.orderIndex,
          code: dp.code,
          name: dp.name,
          capacityLimit: dp.capacityLimit,
        },
      });
      createdDPs.push(created);
    } else {
      createdDPs.push(existing);
    }
  }
  console.log(`[SEED] 4 Pos DP Standar siap.`);

  // 4. Buat Akun Admin Panitia & Assign ke Event
  const adminPanitia = await prisma.user.upsert({
    where: { email: 'panitia@kompas.id' },
    update: {},
    create: {
      email: 'panitia@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Rian Pratama (Admin Panitia)',
      phone: '081234567891',
      globalRole: 'USER',
      isActive: true,
    },
  });

  await prisma.userEvent.upsert({
    where: {
      userId_eventId_role: {
        userId: adminPanitia.id,
        eventId: event.id,
        role: 'ADMIN_PANITIA',
      },
    },
    update: {},
    create: {
      userId: adminPanitia.id,
      eventId: event.id,
      role: 'ADMIN_PANITIA',
    },
  });
  console.log(`[SEED] Admin Panitia ditugaskan ke Event.`);

  // 5. Buat Akun Panitia DP 1
  const panitiaDP1 = await prisma.user.upsert({
    where: { email: 'dp1@kompas.id' },
    update: {},
    create: {
      email: 'dp1@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Budi Santoso (Operator DP 1)',
      phone: '081234567892',
      globalRole: 'USER',
      isActive: true,
    },
  });

  await prisma.userEvent.upsert({
    where: {
      userId_eventId_role: {
        userId: panitiaDP1.id,
        eventId: event.id,
        role: 'PANITIA_DP',
      },
    },
    update: { assignedDpId: createdDPs[0].id },
    create: {
      userId: panitiaDP1.id,
      eventId: event.id,
      role: 'PANITIA_DP',
      assignedDpId: createdDPs[0].id,
    },
  });
  console.log(`[SEED] Panitia DP 1 ditugaskan.`);

  // 6. Buat Akun Juri 1
  const juri1 = await prisma.user.upsert({
    where: { email: 'juri1@kompas.id' },
    update: {},
    create: {
      email: 'juri1@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Mayor TNI (Purn) Hendra Wijaya',
      phone: '081234567893',
      globalRole: 'USER',
      isActive: true,
    },
  });

  await prisma.userEvent.upsert({
    where: {
      userId_eventId_role: {
        userId: juri1.id,
        eventId: event.id,
        role: 'JURI',
      },
    },
    update: {},
    create: {
      userId: juri1.id,
      eventId: event.id,
      role: 'JURI',
    },
  });
  console.log(`[SEED] Juri 1 ditugaskan ke Event.`);

  // 7. Buat Kriteria Penilaian Dinamis Awal
  const criteriaData = [
    { name: 'Langkah Tegap & Hormat Kanan', minScore: 50, maxScore: 100, intervalStep: 5, orderIndex: 1 },
    { name: 'Kerapihan Saf, Banjar & Pasukan', minScore: 50, maxScore: 100, intervalStep: 5, orderIndex: 2 },
    { name: 'Variasi Formasi & Kekompakan', minScore: 50, maxScore: 100, intervalStep: 5, orderIndex: 3 },
    { name: 'Artikulasi & Intonasi Danton', minScore: 50, maxScore: 100, intervalStep: 5, orderIndex: 4 },
  ];

  for (const c of criteriaData) {
    const existing = await prisma.scoringCriterion.findFirst({
      where: { eventId: event.id, orderIndex: c.orderIndex },
    });
    if (!existing) {
      const crit = await prisma.scoringCriterion.create({
        data: {
          eventId: event.id,
          name: c.name,
          orderIndex: c.orderIndex,
          minScore: c.minScore,
          maxScore: c.maxScore,
          intervalStep: c.intervalStep,
        },
      });

      // Generate daftar nilai diskrit dinamis
      const options = [];
      for (let s = c.minScore; s <= c.maxScore; s += c.intervalStep) {
        options.push({ criterionId: crit.id, scoreValue: s });
      }
      await prisma.scoreOption.createMany({ data: options });
    }
  }
  console.log(`[SEED] Kriteria penilaian dinamis siap.`);

  // 8. Buat Akun Peserta & Tim Contoh
  const userPeserta = await prisma.user.upsert({
    where: { email: 'peserta@kompas.id' },
    update: {},
    create: {
      email: 'peserta@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Siti Rahmawati (Ketua Tim)',
      phone: '081234567894',
      globalRole: 'USER',
      isActive: true,
    },
  });

  await prisma.userEvent.upsert({
    where: {
      userId_eventId_role: {
        userId: userPeserta.id,
        eventId: event.id,
        role: 'PESERTA',
      },
    },
    update: {},
    create: {
      userId: userPeserta.id,
      eventId: event.id,
      role: 'PESERTA',
    },
  });

  const existingPart = await prisma.participant.findFirst({
    where: { eventId: event.id, userId: userPeserta.id },
  });

  if (!existingPart) {
    await prisma.participant.create({
      data: {
        eventId: event.id,
        userId: userPeserta.id,
        teamName: 'PASKIBRA GARUDA SAKTI',
        schoolName: 'SMAN 1 Jakarta',
        category: 'SMA/SMK Putra-Putri',
        registrationNumber: 'LKBB-2026-001',
        queueNumber: 1,
        status: 'VALIDATED',
      },
    });
  }
  console.log(`[SEED] Tim Peserta contoh siap.`);

  console.log('[SEED] ✅ Seeding data selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('[SEED ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
