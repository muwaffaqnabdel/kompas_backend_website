import { NextResponse } from 'next/server';
import { getEventsList, createNewEvent } from '@/lib/data-service';

export async function GET() {
  try {
    const events = await getEventsList();
    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('[API GET EVENTS ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil daftar event.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, location, eventDate, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Nama event wajib diisi.' },
        { status: 400 }
      );
    }

    const newEvent = await createNewEvent({
      name,
      location,
      eventDate,
      description,
    });

    return NextResponse.json({
      success: true,
      message: 'Event berhasil didaftarkan.',
      event: newEvent,
    });
  } catch (error) {
    console.error('[API CREATE EVENT ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat event baru.', error: error.message },
      { status: 500 }
    );
  }
}
