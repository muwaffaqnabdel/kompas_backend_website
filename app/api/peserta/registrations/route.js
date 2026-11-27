import { NextResponse } from 'next/server';
import { requirePeserta } from '@/lib/auth';
import { getPesertaRegistrations, registerTeamToEvent } from '@/lib/peserta-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const registrations = await getPesertaRegistrations(auth.user.userId);
    return NextResponse.json({
      success: true,
      total: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error('[API GET PESERTA REGISTRATIONS ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat daftar lomba yang diikuti.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const registration = await registerTeamToEvent(auth.user.userId, body);
    return NextResponse.json(
      {
        success: true,
        message: `Tim "${registration.teamName}" berhasil terdaftar di event "${registration.eventName}".`,
        registration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API POST PESERTA REGISTRATION ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mendaftarkan tim ke event.' },
      { status: 400 }
    );
  }
}

