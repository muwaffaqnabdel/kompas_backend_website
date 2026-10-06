import { NextResponse } from 'next/server';
import { getLeaderboardData } from '@/lib/data-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'evt-lkbb-2026';

    const leaderboard = await getLeaderboardData(eventId);
    return NextResponse.json({
      success: true,
      leaderboard,
      totalTeams: leaderboard.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API GET LEADERBOARD ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data klasemen lomba.', error: error.message },
      { status: 500 }
    );
  }
}
