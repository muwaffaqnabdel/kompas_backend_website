import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signJwtToken, resolveUserNavigation } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        userEvents: {
          where: { isActive: true },
          include: {
            event: true,
            assignedDp: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Akun Anda dinonaktifkan. Hubungi Super Admin.' },
        { status: 403 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    // Resolusi tujuan dashboard sesuai PRD Flow Per Role
    const navResolution = resolveUserNavigation(user, user.userEvents);

    // Buat JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      globalRole: user.globalRole,
      assignedRoles: user.userEvents.map((ue) => ({
        eventId: ue.eventId,
        role: ue.role,
        assignedDpId: ue.assignedDpId,
      })),
    };

    const token = signJwtToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        globalRole: user.globalRole,
        phone: user.phone,
      },
      navigation: navResolution,
      token,
    });

    // Simpan token di HTTP-Only Cookie untuk keamanan
    response.cookies.set('kompas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (error) {
    console.error('[API AUTH LOGIN ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat login.', error: error.message },
      { status: 500 }
    );
  }
}
