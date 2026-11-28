import { NextResponse } from 'next/server';
import { addTechnicalMeetingDocument } from '@/lib/data-service';
import { uploadParticipantDocument } from '@/lib/supabase';
import { requireAdminPanitia } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const eventId = formData.get('eventId') ? String(formData.get('eventId')) : null;
      const file = formData.get('file');

      const authCheck = await requireAdminPanitia(request, eventId);
      if (!authCheck.authorized) return authCheck.response;

      if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
        return NextResponse.json(
          { success: false, message: 'File dokumen TM wajib dipilih.' },
          { status: 400 }
        );
      }
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'Ukuran dokumen TM maksimal 15 MB.' },
          { status: 413 }
        );
      }

      const targetEventId = authCheck.targetEventId || eventId;
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadParticipantDocument(buffer, {
        eventId: targetEventId,
        participantId: 'technical-meeting',
        docKey: 'tm-doc',
        originalName: file.name || 'Dokumen_TM.pdf',
        mimeType: file.type || 'application/pdf',
      });

      if (!uploaded.success) {
        return NextResponse.json(
          { success: false, message: uploaded.error || 'Gagal mengunggah dokumen TM ke Storage.' },
          { status: 502 }
        );
      }

      const ext = String(file.name || '').includes('.')
        ? String(file.name).split('.').pop().toLowerCase()
        : 'pdf';

      const createdDoc = await addTechnicalMeetingDocument(targetEventId, {
        name: file.name || 'Dokumen_TM.pdf',
        ext,
        size: formatBytes(file.size),
        uploader: authCheck.user?.fullName || 'Admin Panitia',
        isPublished: true,
        fileUrl: uploaded.fileUrl,
        storagePath: uploaded.storagePath,
      });

      return NextResponse.json({
        success: true,
        message: `Dokumen "${createdDoc.name}" berhasil diunggah dan tersimpan.`,
        document: createdDoc,
      });
    }

    // Fallback JSON payload
    const body = await request.json();
    const { eventId, document } = body;

    if (!document || !document.name) {
      return NextResponse.json(
        { success: false, message: 'Data dokumen tidak valid.' },
        { status: 400 }
      );
    }

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) return authCheck.response;

    const targetEventId = authCheck.targetEventId || eventId;
    const createdDoc = await addTechnicalMeetingDocument(targetEventId, document);

    return NextResponse.json({
      success: true,
      message: `Dokumen "${createdDoc.name}" berhasil ditambahkan.`,
      document: createdDoc,
    });
  } catch (error) {
    console.error('[API POST TM DOCUMENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan dokumen Technical Meeting.', error: error.message },
      { status: 500 }
    );
  }
}
