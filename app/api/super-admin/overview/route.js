import { NextResponse } from 'next/server';
import { getSuperAdminOverviewData } from '@/lib/data-service';

export async function GET() {
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
