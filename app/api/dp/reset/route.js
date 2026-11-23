import { NextResponse } from 'next/server';
import { resetDPMovement } from '@/lib/data-service';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventId = body?.eventId || 'evt-lkbb-2026';

    const result = await resetDPMovement(eventId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[API RESET DP ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mereset posisi pos DP.', error: error.message },
      { status: 500 }
    );
  }
}

