import { NextResponse } from 'next/server';
import { verifyJudgePIN, getJudgeSessionProfile } from '@/lib/data-service';
import { requireJuri, signJwtToken } from '@/lib/auth';

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

    const sessionData = await getJudgeSessionProfile(
      authCheck.user.userId,
      authCheck.user.email,
      authCheck.targetEventId
    );

    if (!sessionData.judge) {
      return NextResponse.json(
        {
          success: false,
          code: 'JUDGE_PROFILE_NOT_FOUND',
          message: 'Profil Dewan Juri tidak ditemukan pada event yang ditugaskan.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      isSuperAdmin: Boolean(authCheck.isSuperAdmin),
      judge: sessionData.judge,
      event: sessionData.event,
      assignedEvents: sessionData.assignedEvents,
    });
  } catch (error) {
    console.error('[API GET JURI SESSION ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memeriksa sesi Dewan Juri.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId = 'evt-lkbb-2026', pin } = body;

    const cleanPin = String(pin || '').trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return NextResponse.json(
        { success: false, message: 'PIN Dewan Juri wajib terdiri dari tepat 4 digit angka.' },
        { status: 400 }
      );
    }

    const result = await verifyJudgePIN(eventId, cleanPin);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    const tokenPayload = {
      userId: result.judge.userId || result.judge.id,
      email: result.judge.email,
      fullName: result.judge.name,
      globalRole: 'USER',
      assignedRoles: result.assignedRoles || [
        {
          eventId: result.event.id,
          role: 'JURI',
          assignedDpId: null,
        },
      ],
    };

    const token = signJwtToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: `Login berhasil sebagai ${result.judge.name}`,
      judge: result.judge,
      event: result.event,
      token,
    });

    response.cookies.set('kompas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (error) {
    console.error('[API JURI SESSION ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memverifikasi sesi Dewan Juri.', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Sesi Tablet Dewan Juri berhasil diakhiri.',
  });

  response.cookies.set('kompas_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

