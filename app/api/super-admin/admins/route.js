import { NextResponse } from 'next/server';
import { getAdminPanitiaList } from '@/lib/data-service';
import { requireSuperAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  // STRICT PROTEKSI ROLE: Hanya Super Admin yang berhak melihat daftar akun Admin Panitia
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

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
