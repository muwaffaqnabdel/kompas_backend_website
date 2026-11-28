import { NextResponse } from 'next/server';
import { requirePeserta } from '@/lib/auth';
import { savePushSubscription, removePushSubscription } from '@/lib/push-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const subscription = body?.subscription || body;
    const userAgent = request.headers.get('user-agent') || null;
    const result = await savePushSubscription(auth.user.userId, subscription, userAgent);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[API POST PUSH SUBSCRIBE ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menyimpan langganan notifikasi perangkat.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json().catch(() => ({}));
    const endpoint = body?.endpoint;
    const result = await removePushSubscription(auth.user.userId, endpoint);
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[API DELETE PUSH SUBSCRIBE ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus langganan notifikasi perangkat.' },
      { status: 500 }
    );
  }
}

