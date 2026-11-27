import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qvuqdeloxrsaggseijhz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Public client for anonymous/client-side access
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with full privileges (service role) - only use on server side
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

const VOICE_NOTES_BUCKET = process.env.SUPABASE_VOICE_BUCKET || 'juri-voice-notes';

/**
 * Mengunggah file audio rekaman asli Dewan Juri ke Supabase Storage (bucket publik `juri-voice-notes`).
 * Otomatis membuat bucket jika belum ada agar peserta & pelatih dapat memutar ulang audio asli.
 */
export async function uploadJuriVoiceNote(
  audioBuffer,
  { eventId = 'event', participantId = 'participant', juriId = 'juri', mimeType = 'audio/webm' }
) {
  if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
    return {
      success: false,
      audioStorageUrl: null,
      error: 'Konfigurasi Supabase Storage belum lengkap.',
    };
  }

  const cleanMime = String(mimeType || 'audio/webm').split(';')[0].trim();
  const ext = cleanMime.includes('ogg')
    ? 'ogg'
    : cleanMime.includes('mp4') || cleanMime.includes('m4a')
    ? 'm4a'
    : cleanMime.includes('mpeg') || cleanMime.includes('mp3')
    ? 'mp3'
    : cleanMime.includes('wav')
    ? 'wav'
    : 'webm';

  const safeEvent = String(eventId).replace(/[^a-zA-Z0-9_-]/g, '');
  const safeParticipant = String(participantId).replace(/[^a-zA-Z0-9_-]/g, '');
  const safeJuri = String(juriId).replace(/[^a-zA-Z0-9_-]/g, '');
  const storagePath = `${safeEvent}/${safeParticipant}/${safeJuri}_${Date.now()}.${ext}`;

  const tryUpload = async () =>
    supabaseAdmin.storage.from(VOICE_NOTES_BUCKET).upload(storagePath, audioBuffer, {
      contentType: cleanMime,
      upsert: true,
    });

  try {
    let { error: uploadError } = await tryUpload();

    if (uploadError && /not found|does not exist/i.test(uploadError.message || '')) {
      await supabaseAdmin.storage.createBucket(VOICE_NOTES_BUCKET, {
        public: true,
        fileSizeLimit: 26214400, // 25 MB
      });
      const retry = await tryUpload();
      uploadError = retry.error;
    }

    if (uploadError) {
      throw uploadError;
    }

    const { data: pubData } = supabaseAdmin.storage
      .from(VOICE_NOTES_BUCKET)
      .getPublicUrl(storagePath);

    return {
      success: true,
      audioStorageUrl: pubData?.publicUrl || null,
      storagePath,
    };
  } catch (error) {
    console.error('[SUPABASE VOICE UPLOAD ERROR]', error);
    return {
      success: false,
      audioStorageUrl: null,
      error: error.message || 'Gagal mengunggah audio ke Supabase Storage.',
    };
  }
}

export default supabase;
