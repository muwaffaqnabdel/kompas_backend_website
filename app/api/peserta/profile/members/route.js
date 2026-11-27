import { NextResponse } from 'next/server';
import { requirePeserta } from '@/lib/auth';
import { createContingentMember, updateContingentMember } from '@/lib/peserta-service';
import { uploadMemberPhoto } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  const auth = await requirePeserta(request);
  if (!auth.authorized) return auth.response;

  try {
    const contentType = request.headers.get('content-type') || '';
    let payload = {};
    let photoFile = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      payload = {
        fullName: formData.get('fullName'),
        ttl: formData.get('ttl'),
        nisn: formData.get('nisn'),
        defaultRole: formData.get('defaultRole') || 'PASUKAN',
        schoolName: formData.get('schoolName') || '',
      };
      const file = formData.get('photo');
      if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
        photoFile = file;
      }
    } else {
      payload = await request.json();
    }

    if (photoFile && photoFile.size > 3 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Ukuran pas foto melebihi batas maksimal 3 MB.' },
        { status: 413 }
      );
    }

    // Buat record anggota terlebih dahulu agar punya memberId permanen untuk path storage
    let member = await createContingentMember(auth.user.userId, payload);

    if (photoFile) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const uploaded = await uploadMemberPhoto(buffer, {
        userId: auth.user.userId,
        memberId: member.id,
        mimeType: photoFile.type || 'image/webp',
      });

      if (!uploaded.success) {
        return NextResponse.json(
          {
            success: true,
            member,
            warning: uploaded.error || 'Anggota tersimpan, namun pas foto gagal diunggah.',
          },
          { status: 201 }
        );
      }

      member = await updateContingentMember(auth.user.userId, member.id, {
        photoUrl: uploaded.photoUrl,
        photoStoragePath: uploaded.storagePath,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Anggota "${member.fullName}" berhasil ditambahkan ke Bank Anggota Profil.`,
        member,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API POST PROFILE MEMBER ERROR]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menambahkan anggota.' },
      { status: 400 }
    );
  }
}

