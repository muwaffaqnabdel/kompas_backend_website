import { NextResponse } from 'next/server';
import { requirePeserta } from '@/lib/auth';
import {
  getPesertaRegistrationDetail,
  updateRegistrationTeamAndMembers,
} from '@/lib/peserta-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, context) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const params = await context.params;
    const detail = await getPesertaRegistrationDetail(auth.user.userId, params?.id);
    if (!detail) {
      return NextResponse.json(
        { success: false, message: 'Pendaftaran tidak ditemukan.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, registration: detail });
  } catch (error) {
    console.error('[API GET REGISTRATION DETAIL ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat detail pendaftaran.', error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateRegistrationTeamAndMembers(auth.user.userId, params?.id, body);
    return NextResponse.json({
      success: true,
      message:
        body.status === 'SUBMITTED'
          ? 'Pendaftaran & kelengkapan berkas berhasil diajukan ke Panitia!'
          : 'Perubahan data tim & anggota event berhasil disimpan.',
      registration: updated,
    });
  } catch (error) {
    console.error('[API PATCH REGISTRATION ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui pendaftaran.' },
      { status: 400 }
    );
  }
}

