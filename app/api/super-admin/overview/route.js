import { NextResponse } from 'next/server';
import { getSuperAdminOverviewData } from '@/lib/data-service';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET(request) {
  // STRICT PROTEKSI ROLE: Hanya Super Admin yang berhak mengakses overview command center
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const data = await getSuperAdminOverviewData();
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('[API SUPER ADMIN OVERVIEW ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data overview Super Admin.', error: error.message },
      { status: 500 }
    );
  }
}
