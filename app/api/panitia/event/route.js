import { NextResponse } from 'next/server';
import { getPanitiaEventDetail, updateEvent } from '@/lib/data-service';
import { requireAdminPanitia } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || searchParams.get('slug');

    // Autentikasi & Verifikasi Hak Akses Admin Panitia
    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetId = authCheck.targetEventId || eventId;
    const event = await getPanitiaEventDetail(targetId);

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('[API GET PANITIA EVENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data dashboard event.', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { eventId, ...updateData } = body;

    // Autentikasi & Verifikasi Hak Akses Admin Panitia
    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetId = authCheck.targetEventId || eventId;
    if (!targetId) {
      return NextResponse.json(
        { success: false, message: 'Target Event ID wajib disertakan.' },
        { status: 400 }
      );
    }

    const updated = await updateEvent(targetId, updateData, authCheck.user.userId);

    return NextResponse.json({
      success: true,
      message: `Pengaturan event "${updated.name}" berhasil diperbarui.`,
      event: updated,
    });
  } catch (error) {
    console.error('[API PATCH PANITIA EVENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menyimpan pengaturan event.', error: error.message },
      { status: 500 }
    );
  }
}

