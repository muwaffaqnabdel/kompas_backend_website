import { NextResponse } from 'next/server';
import { getDPStatusData } from '@/lib/data-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'evt-lkbb-2026';

    const data = await getDPStatusData(eventId);
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('[API GET DP STATUS ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil status pos DP.', error: error.message },
      { status: 500 }
    );
  }
}
