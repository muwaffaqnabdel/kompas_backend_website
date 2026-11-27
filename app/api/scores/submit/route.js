import { NextResponse } from 'next/server';
import { submitJuriScore } from '@/lib/data-service';
import { requireJuri } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, participantId, scores, penaltySeconds } = body;

    if (!participantId || !scores || typeof scores !== 'object') {
      return NextResponse.json(
        { success: false, message: 'participantId dan data scores wajib disertakan.' },
        { status: 400 }
      );
    }

    const authCheck = await requireJuri(request, eventId || null);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const result = await submitJuriScore({
      eventId: authCheck.targetEventId || eventId,
      participantId,
      juriId: authCheck.user.userId,
      scores,
      penaltySeconds: Number(penaltySeconds) || 0,
      // Juri tidak boleh menimpa nilai setelah submit; hanya Super Admin (atau endpoint khusus Admin Panitia)
      allowOverwrite: Boolean(authCheck.isSuperAdmin),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          locked: Boolean(result.locked),
          message: result.message,
        },
        { status: result.status || 400 }
      );
    }

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
