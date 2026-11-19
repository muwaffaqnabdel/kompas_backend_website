import { NextResponse } from 'next/server';
import { assignAdminToEvent } from '@/lib/data-service';
import { requireSuperAdmin } from '@/lib/auth';

export async function POST(request, { params }) {
  // STRICT PROTEKSI ROLE: Hanya Super Admin yang berhak menugaskan Admin Panitia
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { email, fullName, username, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password wajib diisi untuk membuat akun admin.' },
        { status: 400 }
      );
    }

    const displayName = username || fullName || email.split('@')[0];
    const result = await assignAdminToEvent(
      id,
      {
        email,
        fullName: displayName,
        password,
      },
      authCheck.user.userId
    );

    return NextResponse.json({
      success: true,
      message: `Akun Admin Panitia "${result.targetUser.fullName}" (${result.targetUser.email}) berhasil dibuat dan ditugaskan ke event "${result.event.name}".`,
      result,
    });
  } catch (error) {
    console.error('[API ASSIGN ADMIN ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menugaskan admin panitia.', error: error.message },
      { status: 500 }
    );
  }
}
