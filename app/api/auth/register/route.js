import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signJwtToken, resolveUserNavigation } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, schoolName, teamName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, message: 'Email, password, dan nama lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password minimal 6 karakter.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar. Silakan login.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : null,
        globalRole: 'USER',
        isActive: true,
      },
      include: {
        userEvents: true,
      },
    });

    // Buat token session
    const token = signJwtToken({
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      globalRole: newUser.globalRole,
      assignedRoles: [],
    });

    const navResolution = resolveUserNavigation(newUser, []);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Registrasi akun berhasil.',
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          globalRole: newUser.globalRole,
        },
        navigation: navResolution,
        token,
      },
      { status: 201 }
    );

    response.cookies.set('kompas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('[API AUTH REGISTER ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal melakukan registrasi.', error: error.message },
      { status: 500 }
    );
  }
}
