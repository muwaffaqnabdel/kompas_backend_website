import { NextResponse } from 'next/server';
import { getPanitiaOverviewData } from '@/lib/data-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'evt-lkbb-2026';
    const status = searchParams.get('status');

    const data = await getPanitiaOverviewData(eventId);
    let participants = data.participants || [];

    if (status) {
      participants = participants.filter((p) => p.status === status);
    }

    return NextResponse.json({
      success: true,
      participants,
      total: participants.length,
    });
  } catch (error) {
    console.error('[API GET PARTICIPANTS ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data peserta.', error: error.message },
      { status: 500 }
    );
  }
}
