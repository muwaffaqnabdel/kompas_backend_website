import { NextResponse } from 'next/server';
import { requirePeserta } from '@/lib/auth';
import { getVapidPublicKey, getUserPushSubscriptionCount } from '@/lib/push-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const { configured, publicKey } = getVapidPublicKey();
    const subscriptionCount = configured
      ? await getUserPushSubscriptionCount(auth.user.userId)
      : 0;

    return NextResponse.json({
      success: true,
      configured,
      publicKey,
      subscriptionCount,
    });
  } catch (error) {
    console.error('[API GET PUSH PUBLIC KEY ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat konfigurasi Web Push.', error: error.message },
      { status: 500 }
    );
  }
}

