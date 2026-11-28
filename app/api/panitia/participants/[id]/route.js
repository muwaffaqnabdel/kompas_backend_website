import { NextResponse } from 'next/server';
import { requireAdminPanitia } from '@/lib/auth';
import { updatePanitiaParticipantVerification } from '@/lib/peserta-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(request, context) {
  try {
    const params = await context.params;
    const participantId = params?.id;
    const body = await request.json();

    const authCheck = await requireAdminPanitia(request, body.eventId || null);
    if (!authCheck.authorized) return authCheck.response;

    const updated = await updatePanitiaParticipantVerification(
      authCheck.targetEventId || body.eventId || null,
      participantId,
      body,
      authCheck.user?.userId || null
    );

    return NextResponse.json({
      success: true,
      message: 'Data verifikasi & jadwal kontingen berhasil disimpan ke database.',
      participant: updated,
    });
  } catch (error) {
    console.error('[API PATCH PANITIA PARTICIPANT ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui status kontingen.' },
      { status: 400 }
    );
  }
}

