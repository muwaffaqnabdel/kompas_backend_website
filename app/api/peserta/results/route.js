import { NextResponse } from 'next/server';
import { requirePeserta } from '@/lib/auth';
import { getPesertaResultsData } from '@/lib/peserta-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId') || null;
    const data = await getPesertaResultsData(auth.user.userId, participantId);

    if (!data) {
      return NextResponse.json({
        success: true,
        hasRegistration: false,
        result: null,
      });
    }

    return NextResponse.json({
      success: true,
      hasRegistration: true,
      result: data,
    });
  } catch (error) {
    console.error('[API GET PESERTA RESULTS ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat hasil penilaian dan evaluasi Dewan Juri.', error: error.message },
      { status: 500 }
    );
  }
}

