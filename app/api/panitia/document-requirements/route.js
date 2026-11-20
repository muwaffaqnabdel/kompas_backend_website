import { NextResponse } from 'next/server';
import { getDocumentRequirements, createDocumentRequirement } from '@/lib/data-service';
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
    const requirements = await getDocumentRequirements(targetEventId);

    return NextResponse.json({
      success: true,
      eventId: targetEventId,
      total: requirements.length,
      requirements,
    });
  } catch (error) {
    console.error('[API GET DOCUMENT REQUIREMENTS ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil daftar persyaratan berkas.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, title, description, isRequired, allowedFormats, maxSizeMb, templateUrl, templateName } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Judul persyaratan berkas wajib diisi.' },
        { status: 400 }
      );
    }

    const authCheck = await requireAdminPanitia(request, eventId);
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const targetEventId = authCheck.targetEventId || eventId || 'evt-lkbb-2026';
    const newRequirement = await createDocumentRequirement({
      eventId: targetEventId,
      title: title.trim(),
      description: description ? description.trim() : '',
      isRequired: isRequired !== undefined ? Boolean(isRequired) : true,
      allowedFormats: allowedFormats || 'PDF, DOC, DOCX',
      maxSizeMb: Number(maxSizeMb) || 10,
      templateUrl: templateUrl || null,
      templateName: templateName || null,
    });

    return NextResponse.json({
      success: true,
      message: `Persyaratan berkas "${newRequirement.title}" berhasil ditambahkan.`,
      requirement: newRequirement,
    });
  } catch (error) {
    console.error('[API POST DOCUMENT REQUIREMENTS ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan persyaratan berkas.', error: error.message },
      { status: 500 }
    );
  }
}

