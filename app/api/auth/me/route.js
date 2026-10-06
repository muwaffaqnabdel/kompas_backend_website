import { NextResponse } from 'next/server';
import { findUserById } from '@/lib/data-service';
import { verifyJwtToken, resolveUserNavigation } from '@/lib/auth';

export async function GET(request) {
  try {
    // Ambil token dari cookie atau Authorization header
    const cookieToken = request.cookies.get('kompas_session')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada sesi aktif.' },
        { status: 401 }
      );
    }

    const decoded = verifyJwtToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Sesi kedaluwarsa atau tidak valid.' },
        { status: 401 }
      );
    }

    const user = await findUserById(decoded.userId);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Akun tidak ditemukan atau nonaktif.' },
        { status: 401 }
      );
    }

    const navResolution = resolveUserNavigation(user, user.userEvents);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        globalRole: user.globalRole,
        assignedEvents: user.userEvents.map((ue) => ({
          userEventId: ue.id,
          eventId: ue.eventId,
          eventName: ue.event?.name,
          eventSlug: ue.event?.slug,
          eventStatus: ue.event?.status,
          role: ue.role,
          assignedDp: ue.assignedDp
            ? {
                id: ue.assignedDp.id,
                name: ue.assignedDp.name,
                orderIndex: ue.assignedDp.orderIndex,
              }
            : null,
        })),
      },
      navigation: navResolution,
    });
  } catch (error) {
    console.error('[API AUTH ME ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memverifikasi sesi.', error: error.message },
      { status: 500 }
    );
  }
}
