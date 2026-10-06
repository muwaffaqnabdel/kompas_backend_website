import { NextResponse } from 'next/server';
import { verifyParticipantDocs } from '@/lib/data-service';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, revisionNote, adminName } = body;

    if (!['VALIDATED', 'REVISION_REQUIRED', 'SUBMITTED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status verifikasi tidak valid. Gunakan VALIDATED, REVISION_REQUIRED, atau SUBMITTED.' },
        { status: 400 }
      );
    }

    const updatedParticipant = await verifyParticipantDocs(id, {
      status,
      revisionNote,
      adminName: adminName || 'Admin Panitia',
    });

    return NextResponse.json({
      success: true,
      message: `Status berkas berhasil diubah menjadi ${status}.`,
      participant: updatedParticipant,
    });
  } catch (error) {
    console.error('[API VERIFY PARTICIPANT ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memverifikasi berkas peserta.', error: error.message },
      { status: 500 }
    );
  }
}
