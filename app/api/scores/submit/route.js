import { NextResponse } from 'next/server';
import { submitJuriScore } from '@/lib/data-service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, participantId, juriId, scores, penaltySeconds } = body;

    if (!participantId || !scores) {
      return NextResponse.json(
        { success: false, message: 'participantId dan data scores wajib disertakan.' },
        { status: 400 }
      );
    }

    const result = await submitJuriScore({
      eventId,
      participantId,
      juriId: juriId || 'usr-juri1',
      scores,
      penaltySeconds: Number(penaltySeconds) || 0,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      submission: result.submission,
    });
  } catch (error) {
    console.error('[API SUBMIT SCORES ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan nilai juri.', error: error.message },
      { status: 500 }
    );
  }
}
