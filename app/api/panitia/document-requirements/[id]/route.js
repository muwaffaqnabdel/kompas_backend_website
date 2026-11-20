import { NextResponse } from 'next/server';
import { updateDocumentRequirement, deleteDocumentRequirement } from '@/lib/data-service';
import { requireAdminPanitia } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const authCheck = await requireAdminPanitia(request, body.eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const updated = await updateDocumentRequirement(id, body);

    return NextResponse.json({
      success: true,
      message: `Persyaratan berkas "${updated.title}" berhasil diperbarui.`,
      requirement: updated,
    });
  } catch (error) {
    console.error('[API PATCH DOCUMENT REQUIREMENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui persyaratan berkas.', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const result = await deleteDocumentRequirement(id);

    return NextResponse.json({
      success: true,
      message: 'Persyaratan berkas berhasil dihapus.',
      ...result,
    });
  } catch (error) {
    console.error('[API DELETE DOCUMENT REQUIREMENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus persyaratan berkas.', error: error.message },
      { status: 500 }
    );
  }
}

