import { NextResponse } from 'next/server';
import { getDecisionPointsList, saveDecisionPointsList } from '@/lib/data-service';
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
    const dps = await getDecisionPointsList(targetEventId);

    return NextResponse.json({
      success: true,
      eventId: targetEventId,
      total: dps.length,
      decisionPoints: dps,
    });
  } catch (error) {
    console.error('[API GET PANITIA DP ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil rangkaian Pos DP.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, decisionPoints } = body;

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId || 'evt-lkbb-2026';
    if (!Array.isArray(decisionPoints) || decisionPoints.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Daftar Pos DP tidak valid.' },
        { status: 400 }
      );
    }

    const saved = await saveDecisionPointsList(targetEventId, decisionPoints);

    return NextResponse.json({
      success: true,
      message: 'Rangkaian Pos DP berhasil disimpan.',
      decisionPoints: saved,
    });
  } catch (error) {
    console.error('[API POST PANITIA DP ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan rangkaian Pos DP.', error: error.message },
      { status: 500 }
    );
  }
}

