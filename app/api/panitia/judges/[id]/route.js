import { NextResponse } from 'next/server';
import { updateJudge, deleteJudge } from '@/lib/data-service';
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

    if (body.pin !== undefined) {
      const cleanPin = String(body.pin || '').trim();
      if (!/^\d{4}$/.test(cleanPin)) {
        return NextResponse.json(
          { success: false, message: 'PIN Akses Tablet Dewan Juri wajib terdiri dari tepat 4 digit angka.' },
          { status: 400 }
        );
      }
      body.pin = cleanPin;
    }

    const updated = await updateJudge(id, body);

    return NextResponse.json({
      success: true,
      message: `Data Dewan Juri "${updated.name}" berhasil diperbarui.`,
      judge: updated,
    });
  } catch (error) {
    console.error('[API PATCH JUDGE ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui data Dewan Juri.', error: error.message },
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

    const result = await deleteJudge(id);

    return NextResponse.json({
      success: true,
      message: 'Dewan Juri berhasil dihapus.',
      ...result,
    });
  } catch (error) {
    console.error('[API DELETE JUDGE ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus Dewan Juri.', error: error.message },
      { status: 500 }
    );
  }
}

