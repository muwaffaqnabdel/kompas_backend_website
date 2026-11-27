import { NextResponse } from 'next/server';
import { transcribeAudioWithWhisper, refineFeedbackWithLlama } from '@/lib/groq';
import { uploadJuriVoiceNote } from '@/lib/supabase';
import { saveAIFeedback, confirmSendAIFeedback } from '@/lib/data-service';
import { requireJuri } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let rawTranscript = '';
    let segments = [];
    let abaAbaMarkers = [];
    let abaAbaNames = [];
    let teamName = '';
    let schoolName = '';
    let judgeCategory = '';
    let requestedEventId = null;
    let participantId = null;
    let audioStorageUrl = null;
    let audioUploadError = null;
    let sttError = null;
    let sttModel = null;
    let confirmSend = false;
    let manualRefinedText = '';

    let uploadedBuffer = null;
    let uploadedMimeType = 'audio/webm';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      teamName = String(formData.get('teamName') || '');
      schoolName = String(formData.get('schoolName') || '');
      judgeCategory = String(formData.get('judgeCategory') || '');
      requestedEventId = formData.get('eventId') ? String(formData.get('eventId')) : null;
      participantId = formData.get('participantId') ? String(formData.get('participantId')) : null;

      const markersRaw = formData.get('abaAbaMarkers');
      if (markersRaw) {
        try {
          const parsed = JSON.parse(String(markersRaw));
          if (Array.isArray(parsed)) abaAbaMarkers = parsed;
        } catch {
          abaAbaMarkers = [];
        }
      }

      const namesRaw = formData.get('abaAbaNames');
      if (namesRaw) {
        try {
          const parsed = JSON.parse(String(namesRaw));
          if (Array.isArray(parsed)) abaAbaNames = parsed.slice(0, 50);
        } catch {
          abaAbaNames = [];
        }
      }

      if (!file || typeof file.arrayBuffer !== 'function') {
        return NextResponse.json(
          { success: false, message: 'File audio rekaman tidak ditemukan dalam request.' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      uploadedBuffer = Buffer.from(arrayBuffer);
      uploadedMimeType = file.type || 'audio/webm';

      if (uploadedBuffer.length === 0) {
        return NextResponse.json(
          { success: false, message: 'File audio kosong. Pastikan mikrofon aktif saat merekam.' },
          { status: 400 }
        );
      }
      if (uploadedBuffer.length > 25 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'Ukuran file audio melebihi batas maksimal 25 MB.' },
          { status: 413 }
        );
      }
    } else {
      const body = await request.json();
      rawTranscript = String(body.rawTranscript || '');
      manualRefinedText = String(body.refinedText || '');
      teamName = String(body.teamName || '');
      schoolName = String(body.schoolName || '');
      judgeCategory = String(body.judgeCategory || '');
      requestedEventId = body.eventId || null;
      participantId = body.participantId || null;
      confirmSend = Boolean(body.confirmSend);
      if (Array.isArray(body.abaAbaMarkers)) {
        abaAbaMarkers = body.abaAbaMarkers;
      }
      if (Array.isArray(body.abaAbaNames)) {
        abaAbaNames = body.abaAbaNames.slice(0, 50);
      }
    }

    const authCheck = await requireJuri(request, requestedEventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const eventId = authCheck.targetEventId || requestedEventId || 'evt-lkbb-2026';
    const juriId = authCheck.user.userId;

    if (!participantId) {
      return NextResponse.json(
        { success: false, message: 'participantId wajib disertakan.' },
        { status: 400 }
      );
    }

    // Mode kirim teks manual langsung (jika juri mengetik catatan manual tanpa rekaman suara)
    if (confirmSend && !uploadedBuffer) {
      const textToSend = (manualRefinedText || rawTranscript).trim();
      if (!textToSend) {
        return NextResponse.json(
          { success: false, message: 'Catatan evaluasi tidak boleh kosong.' },
          { status: 400 }
        );
      }
      const sent = await confirmSendAIFeedback({
        eventId,
        participantId,
        juriId,
        refinedText: textToSend,
        rawTranscript: rawTranscript || textToSend,
      });
      return NextResponse.json({
        success: true,
        feedbackId: sent.id,
        audioStorageUrl: sent.audioStorageUrl || null,
        rawTranscript: sent.rawTranscript,
        refinedText: sent.refinedText,
        status: 'SENT',
        sentAt: sent.sentAt,
      });
    }

    // Jika ada rekaman audio: jalankan upload Supabase Storage & Groq Whisper STT secara paralel!
    if (uploadedBuffer) {
      const [uploadRes, sttRes] = await Promise.all([
        uploadJuriVoiceNote(uploadedBuffer, {
          eventId,
          participantId,
          juriId,
          mimeType: uploadedMimeType,
        }),
        transcribeAudioWithWhisper(uploadedBuffer, uploadedMimeType),
      ]);

      if (uploadRes.success) {
        audioStorageUrl = uploadRes.audioStorageUrl;
      } else {
        audioUploadError = uploadRes.error;
      }

      if (sttRes.aiFailed) {
        sttError = sttRes.error || 'Gagal mentranskrip audio melalui Groq Whisper.';
      } else {
        rawTranscript = sttRes.rawText;
        segments = sttRes.segments || [];
        sttModel = sttRes.model || null;
      }
    }

    // Jika STT gagal atau suara hening: tetap simpan audioStorageUrl (kalau upload sukses) & beri tahu UI tanpa mengarang teks
    if (!rawTranscript || rawTranscript.trim() === '') {
      let savedAudioOnly = null;
      if (audioStorageUrl) {
        savedAudioOnly = await saveAIFeedback({
          eventId,
          participantId,
          juriId,
          audioStorageUrl,
          rawTranscript: '',
          refinedText: '',
          status: 'DRAFT_AI',
        });
      }
      return NextResponse.json(
        {
          success: false,
          aiFailed: true,
          feedbackId: savedAudioOnly?.id || null,
          audioStorageUrl,
          audioUploadError,
          message:
            sttError ||
            'Tidak ada ucapan suara yang terdeteksi pada rekaman. Anda dapat merekam ulang atau mengetik catatan evaluasi secara manual.',
        },
        { status: sttError ? 502 : 422 }
      );
    }

    // Tahap 2: Rapi & ringkas transkrip via Groq LLM aktif (Qwen 3.8 27B + fallback GPT-OSS)
    const aiResult = await refineFeedbackWithLlama(rawTranscript, {
      teamName,
      schoolName,
      judgeCategory,
      segments,
      abaAbaMarkers,
      abaAbaNames,
    });

    // Tahap 3: Simpan sebagai DRAFT_AI ke PostgreSQL (ParticipantFeedback)
    const saved = await saveAIFeedback({
      eventId,
      participantId,
      juriId,
      audioStorageUrl,
      rawTranscript,
      refinedText: aiResult.refinedText,
      status: 'DRAFT_AI',
    });

    return NextResponse.json({
      success: true,
      feedbackId: saved.id,
      audioStorageUrl: saved.audioStorageUrl || audioStorageUrl,
      audioUploadError,
      rawTranscript,
      refinedText: aiResult.refinedText,
      sttModel,
      llmModel: aiResult.model || null,
      usedMarkers: Boolean(aiResult.usedMarkers),
      aiFailed: Boolean(aiResult.aiFailed),
      aiWarning: aiResult.aiFailed
        ? 'Penyempurnaan AI sedang terkendala, transkrip mentah ditampilkan agar dapat Anda tinjau.'
        : null,
      status: 'DRAFT_AI',
    });
  } catch (error) {
    console.error('[API VOICE FEEDBACK ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses suara juri.', error: error.message },
      { status: 500 }
    );
  }
}
