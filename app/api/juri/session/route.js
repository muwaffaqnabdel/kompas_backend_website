import { NextResponse } from 'next/server';
import { verifyJudgePIN } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId = 'evt-lkbb-2026', pin } = body;

    if (!pin) {
      return NextResponse.json(
        { success: false, message: 'PIN Dewan Juri wajib dimasukkan.' },
        { status: 400 }
      );
    }

    const result = await verifyJudgePIN(eventId, pin);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Login berhasil sebagai ${result.judge.name}`,
      judge: result.judge,
    });
  } catch (error) {
    console.error('[API JURI SESSION ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memverifikasi sesi Dewan Juri.', error: error.message },
      { status: 500 }
    );
  }
}

