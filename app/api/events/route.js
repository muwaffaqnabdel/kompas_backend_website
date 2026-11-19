import { NextResponse } from 'next/server';
import { getEventsList, createNewEvent } from '@/lib/data-service';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('q');

    let events = await getEventsList();

    if (status && status !== 'ALL') {
      events = events.filter((e) => e.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      events = events.filter(
        (e) => e.name?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)
      );
    }

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
  // STRICT PROTEKSI ROLE: Hanya Super Admin yang berhak mendaftarkan event baru
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const { name, location, eventDate, description, status } = body;

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: 'Nama event wajib diisi (minimal 3 karakter).' },
        { status: 400 }
      );
    }

    const newEvent = await createNewEvent(
      {
        name: name.trim(),
        location: location?.trim() || 'Gelanggang Olahraga',
        eventDate: eventDate || new Date(),
        description: description?.trim() || '',
        status: status || 'DRAFT_SETUP',
      },
      authCheck.user.userId
    );

    return NextResponse.json({
      success: true,
      message: `Event "${newEvent.name}" berhasil didaftarkan secara resmi.`,
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
