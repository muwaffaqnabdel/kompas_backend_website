import { NextResponse } from 'next/server';
import { getDocumentRequirements } from '@/lib/data-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'evt-lkbb-2026';

    const requirements = await getDocumentRequirements(eventId);

    return NextResponse.json({
      success: true,
      eventId,
      total: requirements.length,
      requirements,
    });
  } catch (error) {
    console.error('[API GET PESERTA DOCUMENT REQUIREMENTS ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil daftar persyaratan berkas lomba.', error: error.message },
      { status: 500 }
    );
  }
}

