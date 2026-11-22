import { NextResponse } from 'next/server';
import { deleteTechnicalMeetingDocument } from '@/lib/data-service';
import { requireAdminPanitia } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'evt-lkbb-2026';

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId;
    const result = await deleteTechnicalMeetingDocument(targetEventId, id);

    return NextResponse.json({
      success: true,
      message: 'Dokumen Technical Meeting berhasil dihapus.',
      ...result,
    });
  } catch (error) {
    console.error('[API DELETE TM DOCUMENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus dokumen Technical Meeting.', error: error.message },
      { status: 500 }
    );
  }
}

