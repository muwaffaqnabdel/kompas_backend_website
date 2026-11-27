import { NextResponse } from 'next/server';
import { requirePeserta } from '@/lib/auth';
import {
  getPesertaRegistrationDetail,
  upsertRegistrationDocument,
  deleteRegistrationDocument,
} from '@/lib/peserta-service';
import { uploadParticipantDocument } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export async function POST(request, context) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const params = await context.params;
    const participantId = params?.id;
    const detail = await getPesertaRegistrationDetail(auth.user.userId, participantId);
    if (!detail) {
      return NextResponse.json(
        { success: false, message: 'Data pendaftaran tidak ditemukan atau bukan milik akun Anda.' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const requirementId = formData.get('requirementId') ? String(formData.get('requirementId')) : null;
    const docType = String(formData.get('docType') || 'DOKUMEN_EVENT').trim();

    if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
      return NextResponse.json(
        { success: false, message: 'File berkas wajib dipilih.' },
        { status: 400 }
      );
    }
    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Ukuran berkas melebihi batas maksimal 12 MB.' },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadParticipantDocument(buffer, {
      eventId: detail.eventId,
      participantId,
      docKey: requirementId || docType,
      originalName: file.name || 'berkas.pdf',
      mimeType: file.type || 'application/pdf',
    });

    if (!uploaded.success) {
      return NextResponse.json(
        { success: false, message: uploaded.error || 'Gagal mengunggah berkas ke storage.' },
        { status: 502 }
      );
    }

    const updated = await upsertRegistrationDocument(auth.user.userId, participantId, {
      requirementId,
      docType,
      fileName: file.name || 'berkas.pdf',
      fileSize: formatBytes(file.size),
      fileUrl: uploaded.fileUrl,
      storagePath: uploaded.storagePath,
    });

    return NextResponse.json({
      success: true,
      message: `Berkas "${file.name}" berhasil diunggah.`,
      registration: updated,
    });
  } catch (error) {
    console.error('[API POST REGISTRATION DOCUMENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengunggah berkas.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request, context) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const params = await context.params;
    const participantId = params?.id;
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    if (!documentId) {
      return NextResponse.json(
        { success: false, message: 'documentId wajib disertakan.' },
        { status: 400 }
      );
    }

    const updated = await deleteRegistrationDocument(auth.user.userId, participantId, documentId);
    return NextResponse.json({
      success: true,
      message: 'Berkas berhasil dihapus.',
      registration: updated,
    });
  } catch (error) {
    console.error('[API DELETE REGISTRATION DOCUMENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus berkas.' },
      { status: 400 }
    );
  }
}

