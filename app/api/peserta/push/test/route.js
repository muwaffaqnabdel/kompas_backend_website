import { NextResponse } from 'next/server';
import { requirePeserta } from '@/lib/auth';
import { sendPushToUser, getUserPushSubscriptionCount } from '@/lib/push-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const teamName = String(body?.teamName || 'Tim Anda').trim();
    const schoolName = String(body?.schoolName || '').trim();
    const delaySeconds = Math.min(Math.max(Number(body?.delaySeconds || 0), 0), 15);
    const forceShow = body?.forceShow !== false;

    const count = await getUserPushSubscriptionCount(auth.user.userId);
    if (count === 0) {
      return NextResponse.json(
        {
          success: false,
          code: 'NO_SUBSCRIPTIONS',
          message: 'Perangkat ini belum mengaktifkan Notifikasi HP. Klik "Aktifkan Notifikasi HP" terlebih dahulu.',
        },
        { status: 400 }
      );
    }

    const pushPayload = {
      title: `[Simulasi] Panggilan Masuk Pos DP 1 — ${teamName}`,
      body: 'Panitia memanggil pasukan Anda masuk ke Pos DP 1 (Pengecekan Dokumen). Segera merapat bersama danton & berkas fisik.',
      tag: `kompas-sim-dp1-${Date.now()}`,
      url: '/dashboard',
      dpOrder: 1,
      teamName,
      schoolName,
      forceShow,
      requireInteraction: true,
    };

    if (delaySeconds > 0) {
      setTimeout(() => {
        sendPushToUser(auth.user.userId, {
          ...pushPayload,
          // Saat tes tunda (misal 5 detik untuk keluar browser / kunci layar), tetap paksa tampil agar pasti terlihat
          forceShow: true,
        }).catch((err) => console.warn('[DELAYED PUSH TEST ERROR]', err?.message));
      }, delaySeconds * 1000);

      return NextResponse.json({
        success: true,
        scheduled: true,
        delaySeconds,
        message: `Simulasi Web Push dijadwalkan dalam ${delaySeconds} detik. Anda bisa meminimalkan browser / mematikan layar HP sekarang.`,
      });
    }

    const result = await sendPushToUser(auth.user.userId, pushPayload);
    return NextResponse.json({
      success: result.sent > 0,
      ...result,
      message:
        result.sent > 0
          ? `Notifikasi simulasi berhasil dikirim ke ${result.sent} perangkat terdaftar.`
          : 'Gagal mengirim notifikasi ke perangkat. Coba aktifkan ulang Notifikasi HP.',
    });
  } catch (error) {
    console.error('[API POST PUSH TEST ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menjalankan simulasi Web Push.' },
      { status: 500 }
    );
  }
}

