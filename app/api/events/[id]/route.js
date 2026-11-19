import { NextResponse } from 'next/server';
import { getEventBySlugOrId, updateEvent, deleteEvent } from '@/lib/data-service';
import { requireSuperAdmin } from '@/lib/auth';

const VALID_EVENT_STATUSES = [
  'DRAFT_SETUP',
  'REGISTRATION_OPEN',
  'VALIDATION',
  'TECHNICAL_MEETING',
  'SCHEDULING',
  'LIVE',
  'SCORING_REVIEW',
  'PUBLISHED',
  'ARCHIVED',
];

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const event = await getEventBySlugOrId(id);

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
    console.error('[API GET EVENT DETAIL ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil detail event.', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  // STRICT PROTEKSI ROLE: Hanya Super Admin yang berhak memodifikasi konfigurasi & status event
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Validasi enum status jika ada perubahan status
    if (body.status && !VALID_EVENT_STATUSES.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Status event "${body.status}" tidak valid. Pilihan status: ${VALID_EVENT_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const updated = await updateEvent(id, body, authCheck.user.userId);

    return NextResponse.json({
      success: true,
      message: `Konfigurasi dan status event "${updated.name}" berhasil diperbarui.`,
      event: updated,
    });
  } catch (error) {
    console.error('[API UPDATE EVENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui event.', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  // STRICT PROTEKSI ROLE: Hanya Super Admin yang berhak menghapus event
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;
    const result = await deleteEvent(id, authCheck.user.userId);

    return NextResponse.json({
      success: true,
      message: `Event "${result.name}" berhasil dihapus.`,
      result,
    });
  } catch (error) {
    console.error('[API DELETE EVENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus event.', error: error.message },
      { status: 500 }
    );
  }
}
