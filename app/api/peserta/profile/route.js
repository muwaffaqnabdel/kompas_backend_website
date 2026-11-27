import { NextResponse } from 'next/server';
import { requirePeserta } from '@/lib/auth';
import { getOrInitContingentProfile, upsertContingentProfile } from '@/lib/peserta-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const data = await getOrInitContingentProfile(auth.user.userId);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('[API GET PESERTA PROFILE ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat Profil Kontingen.', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const data = await upsertContingentProfile(auth.user.userId, body);
    return NextResponse.json({
      success: true,
      message: 'Profil Kontingen berhasil disimpan.',
      ...data,
    });
  } catch (error) {
    console.error('[API PUT PESERTA PROFILE ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menyimpan Profil Kontingen.' },
      { status: 400 }
    );
  }
}

