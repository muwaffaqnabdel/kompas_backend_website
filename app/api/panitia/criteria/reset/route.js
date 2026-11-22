import { NextResponse } from 'next/server';
import { resetStandardCriteria } from '@/lib/data-service';
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
    const criteria = await resetStandardCriteria(targetEventId);

    return NextResponse.json({
      success: true,
      message: 'Format standar 15 aba-aba LKBB berhasil dimuat ke sistem.',
      total: criteria.length,
      criteria,
    });
  } catch (error) {
    console.error('[API POST RESET CRITERIA ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mereset kriteria ke standar LKBB.', error: error.message },
      { status: 500 }
    );
  }
}

