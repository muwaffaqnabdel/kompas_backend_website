import { NextResponse } from 'next/server';
import { getPanitiaOverviewData } from '@/lib/data-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'evt-lkbb-2026';

    const data = await getPanitiaOverviewData(eventId);
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('[API PANITIA OVERVIEW ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data operasional panitia.', error: error.message },
      { status: 500 }
    );
  }
}
