import { NextResponse } from 'next/server';
import { requirePeserta } from '@/lib/auth';
import { updateContingentMember, deleteContingentMember } from '@/lib/peserta-service';
import { uploadMemberPhoto } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(request, context) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const params = await context.params;
    const memberId = params?.id;
    if (!memberId) {
      return NextResponse.json({ success: false, message: 'ID anggota tidak valid.' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type') || '';
    let payload = {};
    let photoFile = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      if (formData.has('fullName')) payload.fullName = formData.get('fullName');
      if (formData.has('ttl')) payload.ttl = formData.get('ttl');
      if (formData.has('nisn')) payload.nisn = formData.get('nisn');
      if (formData.has('defaultRole')) payload.defaultRole = formData.get('defaultRole');
      const file = formData.get('photo');
      if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
        photoFile = file;
      }
    } else {
      payload = await request.json();
    }

    if (photoFile) {
      if (photoFile.size > 3 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'Ukuran pas foto melebihi batas maksimal 3 MB.' },
          { status: 413 }
        );
      }
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const uploaded = await uploadMemberPhoto(buffer, {
        userId: auth.user.userId,
        memberId,
        mimeType: photoFile.type || 'image/webp',
      });
      if (!uploaded.success) {
        return NextResponse.json(
          { success: false, message: uploaded.error || 'Gagal mengunggah pas foto.' },
          { status: 502 }
        );
      }
      payload.photoUrl = uploaded.photoUrl;
      payload.photoStoragePath = uploaded.storagePath;
    }

    const member = await updateContingentMember(auth.user.userId, memberId, payload);
    return NextResponse.json({
      success: true,
      message: 'Data anggota berhasil diperbarui.',
      member,
    });
  } catch (error) {
    console.error('[API PATCH PROFILE MEMBER ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui anggota.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request, context) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const params = await context.params;
    const memberId = params?.id;
    const result = await deleteContingentMember(auth.user.userId, memberId);
    return NextResponse.json({
      success: true,
      message: 'Anggota berhasil dihapus dari Bank Anggota Profil.',
      ...result,
    });
  } catch (error) {
    console.error('[API DELETE PROFILE MEMBER ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus anggota.' },
      { status: 400 }
    );
  }
}

