import { NextResponse } from 'next/server';
import { getEventBySlugOrId, updateEvent } from '@/lib/data-service';

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
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateEvent(id, body);

    return NextResponse.json({
      success: true,
      message: 'Status event berhasil diperbarui.',
      event: updated,
    });
  } catch (error) {
    console.error('[API UPDATE EVENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui event.', error: error.message },
      { status: 500 }
    );
  }
}
