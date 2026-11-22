import { NextResponse } from 'next/server';
import { getTechnicalMeetingData } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'evt-lkbb-2026';

    const tmData = await getTechnicalMeetingData(eventId);

    // Filter only published documents for participants
    const publishedDocs = (tmData.documents || []).filter((d) => d.isPublished !== false);

    return NextResponse.json({
      success: true,
      eventId: tmData.eventId,
      meetingInfo: tmData.meetingInfo?.isPublished !== false ? tmData.meetingInfo : null,
      documents: publishedDocs,
      summaryNotes: tmData.summaryNotes || '',
    });
  } catch (error) {
    console.error('[API GET PESERTA TECHNICAL MEETING ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data Technical Meeting.', error: error.message },
      { status: 500 }
    );
  }
}

