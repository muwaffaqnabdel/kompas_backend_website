import { NextResponse } from 'next/server';
import { getCriteriaList, createCriterion, saveAllCriteria } from '@/lib/data-service';
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
    const criteria = await getCriteriaList(targetEventId);

    return NextResponse.json({
      success: true,
      eventId: targetEventId,
      total: criteria.length,
      criteria,
    });
  } catch (error) {
    console.error('[API GET PANITIA CRITERIA ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil kriteria penilaian.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama kriteria / aba-aba wajib diisi.' },
        { status: 400 }
      );
    }

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId || 'evt-lkbb-2026';
    const newCriterion = await createCriterion(targetEventId, body);

    return NextResponse.json({
      success: true,
      message: `Aba-aba "${newCriterion.name}" berhasil ditambahkan ke kategori ${newCriterion.category}.`,
      criterion: newCriterion,
    });
  } catch (error) {
    console.error('[API POST PANITIA CRITERIA ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan kriteria penilaian.', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { eventId, criteria } = body;

    if (!Array.isArray(criteria)) {
      return NextResponse.json(
        { success: false, message: 'Data kriteria harus berupa array.' },
        { status: 400 }
      );
    }

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId || 'evt-lkbb-2026';
    const updated = await saveAllCriteria(targetEventId, criteria);

    return NextResponse.json({
      success: true,
      message: 'Urutan dan konfigurasi kriteria berhasil disimpan.',
      total: updated.length,
      criteria: updated,
    });
  } catch (error) {
    console.error('[API PUT PANITIA CRITERIA ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan konfigurasi kriteria.', error: error.message },
      { status: 500 }
    );
  }
}

