import { NextResponse } from 'next/server';
import { assignAdminToEvent } from '@/lib/data-service';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, fullName } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email admin panitia wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await assignAdminToEvent(id, { email, fullName });

    return NextResponse.json({
      success: true,
      message: `Admin ${result.targetUser.fullName} (${result.targetUser.email}) berhasil ditugaskan ke event.`,
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
