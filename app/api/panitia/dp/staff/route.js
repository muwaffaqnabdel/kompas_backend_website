import { NextResponse } from 'next/server';
import { getDPStaffList, createDPStaff } from '@/lib/data-service';
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
    const staff = await getDPStaffList(targetEventId);

    return NextResponse.json({
      success: true,
      eventId: targetEventId,
      total: staff.length,
      staff,
    });
  } catch (error) {
    console.error('[API GET DP STAFF ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil daftar petugas Pos DP.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, name, email, assignedDpId, password } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Nama dan email petugas wajib diisi.' },
        { status: 400 }
      );
    }

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId || 'evt-lkbb-2026';
    const newStaff = await createDPStaff(targetEventId, {
      name,
      email,
      assignedDpId: assignedDpId || 1,
      password: password || 'password123',
    });

    return NextResponse.json({
      success: true,
      message: `Akun petugas "${newStaff.name}" berhasil dibuat.`,
      staff: newStaff,
    });
  } catch (error) {
    console.error('[API POST DP STAFF ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan petugas Pos DP.', error: error.message },
      { status: 500 }
    );
  }
}

