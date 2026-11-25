import { NextResponse } from 'next/server';
import { getJudgesList, createJudge } from '@/lib/data-service';
import { requireAdminPanitia } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'evt-lkbb-2026';

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId;
    const judges = await getJudgesList(targetEventId);

    return NextResponse.json({
      success: true,
      eventId: targetEventId,
      total: judges.length,
      judges,
    });
  } catch (error) {
    console.error('[API GET PANITIA JUDGES ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil daftar Dewan Juri.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, name, role, category, specialties, institution, pin, email, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama Dewan Juri wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanPin = String(pin || '').trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return NextResponse.json(
        { success: false, message: 'PIN Akses Tablet Dewan Juri wajib terdiri dari tepat 4 digit angka.' },
        { status: 400 }
      );
    }

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId || 'evt-lkbb-2026';
    const newJudge = await createJudge(targetEventId, {
      name: name.trim(),
      role,
      category,
      specialties,
      institution,
      pin: cleanPin,
      email,
      status: status || 'AKTIF',
    });

    return NextResponse.json({
      success: true,
      message: `Dewan Juri "${newJudge.name}" berhasil didaftarkan.`,
      judge: newJudge,
    });
  } catch (error) {
    console.error('[API POST PANITIA JUDGES ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mendaftarkan Dewan Juri.', error: error.message },
      { status: 500 }
    );
  }
}

