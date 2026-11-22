import { NextResponse } from 'next/server';
import { toggleScoringLock } from '@/lib/data-service';
import { requireAdminPanitia } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, locked } = body;

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId || 'evt-lkbb-2026';
    const result = await toggleScoringLock(targetEventId, !!locked);

    return NextResponse.json({
      success: true,
      message: result.scoringLocked
        ? 'Kriteria penilaian resmi berhasil dikunci (Locked V1.0).'
        : 'Kunci kriteria penilaian berhasil dibuka.',
      scoringLocked: result.scoringLocked,
    });
  } catch (error) {
    console.error('[API POST LOCK CRITERIA ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengubah status penguncian kriteria.', error: error.message },
      { status: 500 }
    );
  }
}

