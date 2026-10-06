import { NextResponse } from 'next/server';
import { transcribeAudioWithWhisper, refineFeedbackWithLlama } from '@/lib/groq';
import { saveAIFeedback } from '@/lib/data-service';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let rawTranscript = '';
    let teamName = '';
    let eventId = 'evt-lkbb-2026';
    let participantId = 'part-1';
    let juriId = 'usr-juri1';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      teamName = formData.get('teamName') || '';
      eventId = formData.get('eventId') || eventId;
      participantId = formData.get('participantId') || participantId;
      juriId = formData.get('juriId') || juriId;

      if (!file) {
        return NextResponse.json(
          { success: false, message: 'File audio tidak ditemukan dalam request.' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      // 1. Transkrip suara juri via Groq Whisper STT
      const sttResult = await transcribeAudioWithWhisper(audioBuffer, file.type || 'audio/webm');
      rawTranscript = sttResult.rawText;
    } else {
      // JSON body (jika teks kasar sudah ada dari Web Speech API / input langsung)
      const body = await request.json();
      rawTranscript = body.rawTranscript || '';
      teamName = body.teamName || '';
      eventId = body.eventId || eventId;
      participantId = body.participantId || participantId;
      juriId = body.juriId || juriId;
    }

    if (!rawTranscript || rawTranscript.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Transkrip suara kosong.' },
        { status: 400 }
      );
    }

    // 2. Haluskan teks kasar menggunakan AI Groq (Qwen/Llama) menjadi bahasa baku Paskibra
    const aiResult = await refineFeedbackWithLlama(rawTranscript, { teamName });

    // 3. Simpan feedback ke data store
    const saved = await saveAIFeedback({
      eventId,
      participantId,
      juriId,
      rawTranscript,
      refinedText: aiResult.refinedText,
    });

    return NextResponse.json({
      success: true,
      rawTranscript,
      refinedText: aiResult.refinedText,
      isMock: aiResult.isMock || false,
      feedbackId: saved.id,
    });
  } catch (error) {
    console.error('[API VOICE FEEDBACK ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses suara juri.', error: error.message },
      { status: 500 }
    );
  }
}
