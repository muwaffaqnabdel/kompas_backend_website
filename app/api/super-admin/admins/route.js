import { NextResponse } from 'next/server';
import { getAdminPanitiaList } from '@/lib/data-service';

export async function GET() {
  try {
    const admins = await getAdminPanitiaList();
    return NextResponse.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error('[API GET ADMIN PANITIA ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil daftar Admin Panitia.', error: error.message },
      { status: 500 }
    );
  }
}
