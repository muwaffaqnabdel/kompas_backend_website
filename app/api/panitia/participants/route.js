import { NextResponse } from 'next/server';
import { requireAdminPanitia } from '@/lib/auth';
import { getPanitiaParticipantsList } from '@/lib/peserta-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedEventId = searchParams.get('eventId') || null;

    const authCheck = await requireAdminPanitia(request, requestedEventId);
    if (!authCheck.authorized) return authCheck.response;

    const targetEventId = authCheck.targetEventId || requestedEventId;
    if (!targetEventId) {
      return NextResponse.json(
        { success: false, message: 'eventId wajib disertakan.' },
        { status: 400 }
      );
    }

    const { event, participants } = await getPanitiaParticipantsList(targetEventId);
    return NextResponse.json({
      success: true,
      event,
      total: participants.length,
      participants,
    });
  } catch (error) {
    console.error('[API GET PANITIA PARTICIPANTS ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat daftar kontingen peserta.', error: error.message },
      { status: 500 }
    );
  }
}

