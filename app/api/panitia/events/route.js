import { NextResponse } from 'next/server';
import { getEventsList } from '@/lib/data-service';
import { requireAdminPanitia } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const authCheck = await requireAdminPanitia(request);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const allEvents = await getEventsList();

    // Jika Super Admin atau mode Demo: berikan akses ke seluruh event
    if (authCheck.isSuperAdmin || authCheck.isDemo) {
      return NextResponse.json({
        success: true,
        events: allEvents,
      });
    }

    // Jika user biasa: hanya filter event yang ditugaskan sebagai ADMIN_PANITIA
    const assignedIds = new Set((authCheck.user.assignedRoles || [])
      .filter((r) => r.role === 'ADMIN_PANITIA')
      .map((r) => r.eventId));

    const userEvents = allEvents.filter((e) => assignedIds.has(e.id));

    return NextResponse.json({
      success: true,
      events: userEvents,
    });
  } catch (error) {
    console.error('[API GET PANITIA EVENTS LIST ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil daftar event panitia.', error: error.message },
      { status: 500 }
    );
  }
}

