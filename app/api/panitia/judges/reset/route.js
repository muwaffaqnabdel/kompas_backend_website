import { NextResponse } from 'next/server';
import { resetStandardJudges } from '@/lib/data-service';
import { requireAdminPanitia } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId } = body;

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId || 'evt-lkbb-2026';
    const judges = await resetStandardJudges(targetEventId);

    return NextResponse.json({
      success: true,
      message: 'Format standar 5 Dewan Juri LKBB berhasil dimuat ke sistem.',
      total: judges.length,
      judges,
    });
  } catch (error) {
    console.error('[API POST RESET JUDGES ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mereset format standar dewan juri.', error: error.message },
      { status: 500 }
    );
  }
}

