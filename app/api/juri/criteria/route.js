import { NextResponse } from 'next/server';
import { getJuriCriteriaData } from '@/lib/data-service';
import { requireJuri } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedEventId = searchParams.get('eventId') || null;

    const authCheck = await requireJuri(request, requestedEventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const data = await getJuriCriteriaData(
      authCheck.targetEventId,
      authCheck.user.userId,
      authCheck.user.email,
      Boolean(authCheck.isSuperAdmin)
    );

    return NextResponse.json({
      success: true,
      eventId: data.event.id,
      event: data.event,
      scoringLocked: data.scoringLocked,
      judge: data.judge,
      assignedCategories: data.assignedCategories,
      totalAll: data.totalAll,
      total: data.total,
      criteria: data.criteria,
    });
  } catch (error) {
    console.error('[API GET JURI CRITERIA ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil kriteria penilaian Dewan Juri.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

