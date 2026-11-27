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
const PESERTA_ASSETS_BUCKET = process.env.SUPABASE_PESERTA_BUCKET || 'peserta-assets';

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

async function ensureUploadToBucket(bucketName, storagePath, fileBuffer, contentType, maxLimitBytes = 15728640) {
  const tryUpload = async () =>
    supabaseAdmin.storage.from(bucketName).upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  let { error: uploadError } = await tryUpload();

  if (uploadError && /not found|does not exist/i.test(uploadError.message || '')) {
    await supabaseAdmin.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: maxLimitBytes,
    });
    const retry = await tryUpload();
    uploadError = retry.error;
  }

  if (uploadError) throw uploadError;

  const { data: pubData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(storagePath);
  return pubData?.publicUrl || null;
}

/**
 * Unggah pas foto anggota ke bucket publik `peserta-assets`.
 * Menggunakan path deterministik per memberId dengan upsert agar penggantian foto tidak menyisakan file sampah.
 */
export async function uploadMemberPhoto(
  fileBuffer,
  { userId = 'user', memberId = 'member', mimeType = 'image/webp' }
) {
  if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
    return { success: false, photoUrl: null, storagePath: null, error: 'Konfigurasi Supabase Storage belum lengkap.' };
  }

  const cleanMime = String(mimeType || 'image/webp').split(';')[0].trim().toLowerCase();
  const ext = cleanMime.includes('png') ? 'png' : cleanMime.includes('jpeg') || cleanMime.includes('jpg') ? 'jpg' : 'webp';
  const safeUser = String(userId).replace(/[^a-zA-Z0-9_-]/g, '');
  const safeMember = String(memberId).replace(/[^a-zA-Z0-9_-]/g, '');
  const storagePath = `member-photos/${safeUser}/${safeMember}.${ext}`;

  try {
    const publicUrl = await ensureUploadToBucket(PESERTA_ASSETS_BUCKET, storagePath, fileBuffer, cleanMime, 15728640);
    return {
      success: true,
      photoUrl: publicUrl ? `${publicUrl}?v=${Date.now()}` : null,
      storagePath,
    };
  } catch (error) {
    console.error('[SUPABASE MEMBER PHOTO UPLOAD ERROR]', error);
    return {
      success: false,
      photoUrl: null,
      storagePath: null,
      error: error.message || 'Gagal mengunggah pas foto ke Supabase Storage.',
    };
  }
}

/**
 * Unggah berkas persyaratan khusus event milik peserta (PDF, DOC, DOCX, gambar) ke `peserta-assets`.
 */
export async function uploadParticipantDocument(
  fileBuffer,
  { eventId = 'event', participantId = 'part', docKey = 'doc', originalName = 'document.pdf', mimeType = 'application/pdf' }
) {
  if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
    return { success: false, fileUrl: null, storagePath: null, error: 'Konfigurasi Supabase Storage belum lengkap.' };
  }

  const cleanMime = String(mimeType || 'application/octet-stream').split(';')[0].trim();
  const rawExt = String(originalName || '').includes('.')
    ? String(originalName).split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')
    : 'pdf';
  const ext = rawExt || 'pdf';
  const safeEvent = String(eventId).replace(/[^a-zA-Z0-9_-]/g, '');
  const safeParticipant = String(participantId).replace(/[^a-zA-Z0-9_-]/g, '');
  const safeKey = String(docKey).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'doc';
  const storagePath = `participant-docs/${safeEvent}/${safeParticipant}/${safeKey}_${Date.now()}.${ext}`;

  try {
    const publicUrl = await ensureUploadToBucket(PESERTA_ASSETS_BUCKET, storagePath, fileBuffer, cleanMime, 15728640);
    return {
      success: true,
      fileUrl: publicUrl,
      storagePath,
    };
  } catch (error) {
    console.error('[SUPABASE PARTICIPANT DOC UPLOAD ERROR]', error);
    return {
      success: false,
      fileUrl: null,
      storagePath: null,
      error: error.message || 'Gagal mengunggah berkas pendaftaran ke Supabase Storage.',
    };
  }
}

export async function deletePesertaStorageFile(storagePath) {
  if (!storagePath) return;
  try {
    await supabaseAdmin.storage.from(PESERTA_ASSETS_BUCKET).remove([storagePath]);
  } catch (err) {
    console.warn('[SUPABASE DELETE FILE WARN]', err?.message);
  }
}

export default supabase;
