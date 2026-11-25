import { NextResponse } from 'next/server';
import { getJuriParticipantsData } from '@/lib/data-service';
import { requireJuri } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedEventId = searchParams.get('eventId') || null;
    const category = searchParams.get('category') || null;

    const authCheck = await requireJuri(request, requestedEventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const data = await getJuriParticipantsData(
      authCheck.targetEventId,
      authCheck.user.userId,
      category
    );

    return NextResponse.json({
      success: true,
      eventId: data.event.id,
      event: data.event,
      categories: data.categories,
      total: data.total,
      totalAll: data.totalAll,
      participants: data.participants,
    });
  } catch (error) {
    console.error('[API GET JURI PARTICIPANTS ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil daftar peserta untuk Dewan Juri.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

