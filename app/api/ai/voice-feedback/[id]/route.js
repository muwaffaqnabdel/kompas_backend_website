import { NextResponse } from 'next/server';
import { confirmSendAIFeedback } from '@/lib/data-service';
import { requireJuri } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * PATCH /api/ai/voice-feedback/[id]
 * Mengonfirmasi & mengirim hasil review/editan Draft AI Dewan Juri (status DRAFT_AI -> SENT).
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { eventId, participantId, refinedText, rawTranscript, audioStorageUrl } = body;

    const authCheck = await requireJuri(request, eventId || null);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    if (!refinedText || !String(refinedText).trim()) {
      return NextResponse.json(
        { success: false, message: 'Teks evaluasi akhir tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const updated = await confirmSendAIFeedback({
      feedbackId: id,
      eventId: authCheck.targetEventId || eventId,
      participantId,
      juriId: authCheck.user.userId,
      refinedText: String(refinedText).trim(),
      rawTranscript: rawTranscript || '',
      audioStorageUrl: audioStorageUrl || null,
    });

    return NextResponse.json({
      success: true,
      message: 'Evaluasi & rekaman suara Dewan Juri berhasil dikirim ke peserta.',
      feedback: updated,
    });
  } catch (error) {
    console.error('[API PATCH VOICE FEEDBACK ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengirim evaluasi Dewan Juri.', error: error.message },
      { status: 500 }
    );
  }
}

