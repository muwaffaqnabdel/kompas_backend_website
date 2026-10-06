import { NextResponse } from 'next/server';
import { executeAtomicDPMove } from '@/lib/data-service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, participantId, toDpIndex, operatorName } = body;

    if (!participantId || !toDpIndex) {
      return NextResponse.json(
        { success: false, message: 'participantId dan toDpIndex wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await executeAtomicDPMove({
      eventId,
      participantId,
      toDpIndex: Number(toDpIndex),
      operatorName,
    });

    if (result.blocked) {
      return NextResponse.json(
        {
          success: false,
          blocked: true,
          message: result.message,
          targetDp: result.targetDp,
        },
        { status: 409 } // Conflict: Kapasitas penuh (1 tim)
      );
    }

    return NextResponse.json({
      success: true,
      blocked: false,
      message: result.message,
      participant: result.participant,
      targetDp: result.targetDp,
    });
  } catch (error) {
    console.error('[API ATOMIC DP MOVE ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal melakukan pemindahan pos DP.', error: error.message },
      { status: 500 }
    );
  }
}
