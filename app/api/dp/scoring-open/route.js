import { NextResponse } from 'next/server';
import { setDp4ScoringOpen } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, participantId, isOpen = true, operatorName } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: 'eventId wajib disertakan.' },
        { status: 400 }
      );
    }

    const result = await setDp4ScoringOpen({
      eventId,
      participantId: participantId || null,
      isOpen: Boolean(isOpen),
      operatorName: operatorName || 'Petugas DP 04',
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API DP4 SCORING OPEN ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memperbarui status buka penilaian DP 04.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

