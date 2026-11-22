import { NextResponse } from 'next/server';
import { addTechnicalMeetingDocument } from '@/lib/data-service';
import { requireAdminPanitia } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, document } = body;

    if (!document || !document.name) {
      return NextResponse.json(
        { success: false, message: 'Data dokumen tidak valid.' },
        { status: 400 }
      );
    }

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId || 'evt-lkbb-2026';
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

