import { NextResponse } from 'next/server';
import { getDocCheckParticipants } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'evt-lkbb-2026';

    const participants = await getDocCheckParticipants(eventId);

    return NextResponse.json({
      success: true,
      eventId,
      total: participants.length,
      participants,
    });
  } catch (error) {
    console.error('[API GET DOC CHECK PARTICIPANTS ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data berkas peserta untuk Pos DP Dokumen.', error: error.message },
      { status: 500 }
    );
  }
}

