import { NextResponse } from 'next/server';
import { getTechnicalMeetingData, saveTechnicalMeetingInfo } from '@/lib/data-service';
import { requireAdminPanitia } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'evt-lkbb-2026';

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId;
    const tmData = await getTechnicalMeetingData(targetEventId);

    return NextResponse.json({
      success: true,
      ...tmData,
    });
  } catch (error) {
    console.error('[API GET PANITIA TECHNICAL MEETING ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data Technical Meeting.', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { eventId, meetingInfo, summaryNotes } = body;

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId || 'evt-lkbb-2026';
    const updated = await saveTechnicalMeetingInfo(targetEventId, { meetingInfo, summaryNotes });

    return NextResponse.json({
      success: true,
      message: 'Informasi Technical Meeting berhasil disimpan dan disinkronkan.',
      ...updated,
    });
  } catch (error) {
    console.error('[API PUT PANITIA TECHNICAL MEETING ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan informasi Technical Meeting.', error: error.message },
      { status: 500 }
    );
  }
}

