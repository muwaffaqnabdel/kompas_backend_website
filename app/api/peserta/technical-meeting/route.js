import { NextResponse } from 'next/server';
import { getTechnicalMeetingData } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || '';

    if (!eventId) {
      return NextResponse.json({
        success: true,
        exists: false,
        eventId: null,
        meetingInfo: null,
        documents: [],
        summaryNotes: '',
      });
    }

    const tmData = await getTechnicalMeetingData(eventId);
    const isPublished = Boolean(tmData.exists && tmData.meetingInfo?.isPublished !== false);

    // Hanya tampilkan dokumen & info TM jika sudah diatur dan dipublikasikan oleh Admin Panitia
    const publishedDocs = isPublished
      ? (tmData.documents || []).filter((d) => d.isPublished !== false)
      : [];

    return NextResponse.json({
      success: true,
      exists: Boolean(tmData.exists),
      isPublished,
      eventId: tmData.eventId,
      eventName: tmData.eventName || '',
      meetingInfo: isPublished ? tmData.meetingInfo : null,
      documents: publishedDocs,
      summaryNotes: isPublished ? tmData.summaryNotes || '' : '',
    });
  } catch (error) {
    console.error('[API GET PESERTA TECHNICAL MEETING ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data Technical Meeting.', error: error.message },
      { status: 500 }
    );
  }
}
