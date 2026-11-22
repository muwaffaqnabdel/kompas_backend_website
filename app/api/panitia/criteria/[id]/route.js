import { NextResponse } from 'next/server';
import { updateCriterion, deleteCriterion } from '@/lib/data-service';
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

    const updated = await updateCriterion(id, body);

    return NextResponse.json({
      success: true,
      message: `Aba-aba "${updated.name}" berhasil diperbarui.`,
      criterion: updated,
    });
  } catch (error) {
    console.error('[API PATCH CRITERION ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui kriteria penilaian.', error: error.message },
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

    const result = await deleteCriterion(id);

    return NextResponse.json({
      success: true,
      message: 'Kriteria aba-aba berhasil dihapus.',
      ...result,
    });
  } catch (error) {
    console.error('[API DELETE CRITERION ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus kriteria penilaian.', error: error.message },
      { status: 500 }
    );
  }
}

