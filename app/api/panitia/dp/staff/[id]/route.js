import { NextResponse } from 'next/server';
import { updateDPStaff, deleteDPStaff } from '@/lib/data-service';
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

    const updated = await updateDPStaff(id, body);

    return NextResponse.json({
      success: true,
      message: `Data penugasan petugas "${updated.name}" berhasil diperbarui.`,
      staff: updated,
    });
  } catch (error) {
    console.error('[API PATCH DP STAFF ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui data petugas.', error: error.message },
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

    const result = await deleteDPStaff(id);

    return NextResponse.json({
      success: true,
      message: 'Akun petugas berhasil dihapus.',
      ...result,
    });
  } catch (error) {
    console.error('[API DELETE DP STAFF ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus petugas.', error: error.message },
      { status: 500 }
    );
  }
}

