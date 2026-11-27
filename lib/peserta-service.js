import prisma from '@/lib/prisma';
import { deletePesertaStorageFile } from '@/lib/supabase';

const DEFAULT_DOC_REQUIREMENTS = [
  {
    id: 'req-kartu-pelajar',
    title: 'File Kartu Pelajar (Kolektif Anggota)',
    description: 'Scan kartu pelajar resmi dari seluruh anggota pasukan dalam 1 file PDF atau Word.',
    isRequired: true,
    allowedFormats: 'PDF, DOC, DOCX',
    maxSizeMb: 10,
  },
  {
    id: 'req-surat-rekomendasi',
    title: 'Surat Rekomendasi / Pengantar Sekolah',
    description: 'Surat tugas dan rekomendasi resmi dari Kepala Sekolah berstempel basah.',
    isRequired: true,
    allowedFormats: 'PDF, DOC, DOCX',
    maxSizeMb: 10,
  },
  {
    id: 'req-bukti-bayar',
    title: 'Bukti Transfer Pendaftaran',
    description: 'Struk atau tangkapan layar transfer biaya pendaftaran event.',
    isRequired: true,
    allowedFormats: 'PDF, JPG, PNG',
    maxSizeMb: 5,
  },
];

export async function getOrInitContingentProfile(userId) {
  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, phone: true },
    }),
    prisma.contingentProfile.findUnique({
      where: { userId },
      include: {
        members: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
  ]);

  if (!profile) {
    return {
      exists: false,
      profile: {
        id: null,
        userId,
        schoolName: '',
        defaultTeamName: '',
        category: 'SMA/SMK/MA',
        coachName: user?.fullName || '',
        officialPhone: user?.phone || '',
      },
      members: [],
      user,
    };
  }

  return {
    exists: true,
    profile: {
      id: profile.id,
      userId: profile.userId,
      schoolName: profile.schoolName,
      defaultTeamName: profile.defaultTeamName || '',
      category: profile.category || 'SMA/SMK/MA',
      coachName: profile.coachName || '',
      officialPhone: profile.officialPhone || '',
      updatedAt: profile.updatedAt,
    },
    members: profile.members.map((m) => ({
      id: m.id,
      profileId: m.profileId,
      fullName: m.fullName,
      ttl: m.ttl || '',
      nisn: m.nisn || '',
      defaultRole: m.defaultRole || 'PASUKAN',
      photoUrl: m.photoUrl || null,
      photoStoragePath: m.photoStoragePath || null,
      createdAt: m.createdAt,
    })),
    user,
  };
}

export async function upsertContingentProfile(userId, payload = {}) {
  const schoolName = String(payload.schoolName || '').trim();
  if (!schoolName) {
    throw new Error('Nama sekolah / instansi wajib diisi.');
  }

  const profile = await prisma.contingentProfile.upsert({
    where: { userId },
    create: {
      userId,
      schoolName,
      defaultTeamName: String(payload.defaultTeamName || '').trim() || null,
      category: String(payload.category || 'SMA/SMK/MA').trim(),
      coachName: String(payload.coachName || '').trim() || null,
      officialPhone: String(payload.officialPhone || '').trim() || null,
    },
    update: {
      schoolName,
      defaultTeamName: String(payload.defaultTeamName || '').trim() || null,
      category: String(payload.category || 'SMA/SMK/MA').trim(),
      coachName: String(payload.coachName || '').trim() || null,
      officialPhone: String(payload.officialPhone || '').trim() || null,
    },
    include: {
      members: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return {
    exists: true,
    profile: {
      id: profile.id,
      userId: profile.userId,
      schoolName: profile.schoolName,
      defaultTeamName: profile.defaultTeamName || '',
      category: profile.category || 'SMA/SMK/MA',
      coachName: profile.coachName || '',
      officialPhone: profile.officialPhone || '',
      updatedAt: profile.updatedAt,
    },
    members: profile.members,
  };
}

async function ensureProfileForUser(userId, fallbackSchool = '') {
  let profile = await prisma.contingentProfile.findUnique({ where: { userId } });
  if (!profile) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, phone: true },
    });
    profile = await prisma.contingentProfile.create({
      data: {
        userId,
        schoolName: fallbackSchool || user?.fullName || 'Kontingen Paskibra',
        category: 'SMA/SMK/MA',
        coachName: user?.fullName || null,
        officialPhone: user?.phone || null,
      },
    });
  }
  return profile;
}

export async function createContingentMember(userId, payload = {}) {
  const fullName = String(payload.fullName || '').trim();
  if (!fullName) {
    throw new Error('Nama lengkap anggota wajib diisi.');
  }

  const profile = await ensureProfileForUser(userId, payload.schoolName);

  const member = await prisma.contingentMember.create({
    data: {
      profileId: profile.id,
      fullName,
      ttl: String(payload.ttl || '').trim() || null,
      nisn: String(payload.nisn || '').trim() || null,
      defaultRole: String(payload.defaultRole || 'PASUKAN').trim().toUpperCase(),
      photoUrl: payload.photoUrl || null,
      photoStoragePath: payload.photoStoragePath || null,
      isActive: true,
    },
  });

  return member;
}

export async function updateContingentMember(userId, memberId, payload = {}) {
  const existing = await prisma.contingentMember.findUnique({
    where: { id: memberId },
    include: { profile: { select: { userId: true } } },
  });

  if (!existing || existing.profile.userId !== userId) {
    throw new Error('Anggota tidak ditemukan atau bukan milik profil Anda.');
  }

  const data = {};
  if (payload.fullName !== undefined) {
    const name = String(payload.fullName).trim();
    if (!name) throw new Error('Nama lengkap anggota tidak boleh kosong.');
    data.fullName = name;
  }
  if (payload.ttl !== undefined) data.ttl = String(payload.ttl || '').trim() || null;
  if (payload.nisn !== undefined) data.nisn = String(payload.nisn || '').trim() || null;
  if (payload.defaultRole !== undefined) {
    data.defaultRole = String(payload.defaultRole || 'PASUKAN').trim().toUpperCase();
  }
  if (payload.photoUrl !== undefined) data.photoUrl = payload.photoUrl;
  if (payload.photoStoragePath !== undefined) data.photoStoragePath = payload.photoStoragePath;

  const updated = await prisma.contingentMember.update({
    where: { id: memberId },
    data,
  });

  return updated;
}

export async function deleteContingentMember(userId, memberId) {
  const existing = await prisma.contingentMember.findUnique({
    where: { id: memberId },
    include: { profile: { select: { userId: true } } },
  });

  if (!existing || existing.profile.userId !== userId) {
    throw new Error('Anggota tidak ditemukan atau bukan milik profil Anda.');
  }

  await prisma.contingentMember.delete({ where: { id: memberId } });

  // Hapus file pas foto di Supabase Storage HANYA jika tidak sedang dipakai oleh snapshot pendaftaran event manapun
  if (existing.photoStoragePath && existing.photoUrl) {
    const basePhotoUrl = existing.photoUrl.split('?')[0];
    const usedInEvent = await prisma.participantMember.findFirst({
      where: {
        photoUrl: { startsWith: basePhotoUrl },
      },
      select: { id: true },
    });
    if (!usedInEvent) {
      await deletePesertaStorageFile(existing.photoStoragePath);
    }
  }

  return { deletedId: memberId };
}

function buildDocumentChecklist(requirements, uploadedDocs) {
  const reqList =
    Array.isArray(requirements) && requirements.length > 0
      ? requirements
      : DEFAULT_DOC_REQUIREMENTS;

  return reqList.map((req) => {
    const matched = (uploadedDocs || []).find(
      (d) =>
        (d.requirementId && d.requirementId === req.id) ||
        String(d.docType || '').toLowerCase() === String(req.title || '').toLowerCase()
    );
    return {
      requirementId: req.id,
      title: req.title,
      description: req.description || '',
      isRequired: req.isRequired !== false,
      allowedFormats: `${req.allowedFormats || 'PDF, DOC, DOCX'} (Maks. ${req.maxSizeMb || 10}MB)`,
      maxSizeMb: req.maxSizeMb || 10,
      templateUrl: req.templateUrl || null,
      templateName: req.templateName || null,
      documentId: matched?.id || null,
      fileName: matched?.fileName || null,
      fileSize: matched?.fileSize || null,
      fileUrl: matched?.fileUrl || null,
      uploadedAt: matched?.uploadedAt || null,
      status: matched
        ? matched.status === 'APPROVED'
          ? 'VERIFIED'
          : matched.status === 'REJECTED'
          ? 'REJECTED'
          : 'PENDING'
        : 'EMPTY',
      rejectionNote: matched?.rejectionNote || null,
    };
  });
}

function formatRegistration(p, requirements = []) {
  const docChecklist = buildDocumentChecklist(requirements, p.documents);
  const completedDocs = docChecklist.filter((d) => d.status !== 'EMPTY').length;
  const verifiedDocs = docChecklist.filter((d) => d.status === 'VERIFIED').length;

  return {
    id: p.id,
    eventId: p.eventId,
    eventName: p.event?.name || 'Event LKBB',
    eventSlug: p.event?.slug || '',
    eventDate: p.event?.eventDate || null,
    eventLocation: p.event?.location || '',
    eventStatus: p.event?.status || 'REGISTRATION_OPEN',
    resultsPublished: Boolean(p.event?.resultsPublished),
    teamName: p.teamName,
    schoolName: p.schoolName,
    category: p.category,
    registrationNumber: p.registrationNumber,
    queueNumber: p.queueNumber,
    performanceTime: p.performanceTime,
    status: p.status,
    revisionNotes: p.revisionNotes,
    totalScore: p.totalScore,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    membersCount: p.members?.length || 0,
    members: (p.members || []).map((m) => ({
      id: m.id,
      sourceMemberId: m.sourceMemberId || null,
      fullName: m.fullName,
      roleInTeam: m.roleInTeam || 'PASUKAN',
      ttl: m.ttl || '',
      nisn: m.nisn || '',
      photoUrl: m.photoUrl || null,
    })),
    documents: docChecklist,
    docsSummary: {
      total: docChecklist.length,
      uploaded: completedDocs,
      verified: verifiedDocs,
    },
  };
}

export async function getPesertaRegistrations(userId) {
  const participants = await prisma.participant.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          slug: true,
          eventDate: true,
          location: true,
          status: true,
          resultsPublished: true,
        },
      },
      members: {
        orderBy: { id: 'asc' },
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const eventIds = [...new Set(participants.map((p) => p.eventId))];
  const allReqs =
    eventIds.length > 0
      ? await prisma.eventDocumentRequirement.findMany({
          where: { eventId: { in: eventIds } },
          orderBy: { orderIndex: 'asc' },
        })
      : [];

  const reqByEvent = new Map();
  for (const r of allReqs) {
    if (!reqByEvent.has(r.eventId)) reqByEvent.set(r.eventId, []);
    reqByEvent.get(r.eventId).push(r);
  }

  return participants.map((p) => formatRegistration(p, reqByEvent.get(p.eventId) || []));
}

export async function getPesertaRegistrationDetail(userId, participantId) {
  const participant = await prisma.participant.findFirst({
    where: { id: participantId, userId },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          slug: true,
          eventDate: true,
          location: true,
          status: true,
          resultsPublished: true,
        },
      },
      members: { orderBy: { id: 'asc' } },
      documents: { orderBy: { uploadedAt: 'desc' } },
    },
  });

  if (!participant) return null;

  const reqs = await prisma.eventDocumentRequirement.findMany({
    where: { eventId: participant.eventId },
    orderBy: { orderIndex: 'asc' },
  });

  return formatRegistration(participant, reqs);
}

export async function registerTeamToEvent(userId, payload = {}) {
  const { eventId, teamName, schoolName, category, selectedMembers = [] } = payload;

  if (!eventId) throw new Error('Event tujuan wajib dipilih.');
  const cleanTeamName = String(teamName || '').trim();
  const cleanSchoolName = String(schoolName || '').trim();
  if (!cleanTeamName) throw new Error('Nama pasukan / tim wajib diisi.');
  if (!cleanSchoolName) throw new Error('Nama sekolah / kontingen wajib diisi.');

  const event = await prisma.event.findFirst({
    where: { OR: [{ id: eventId }, { slug: eventId }] },
  });
  if (!event) {
    throw new Error('Event lomba tidak ditemukan di database.');
  }

  const closedStatuses = ['LIVE', 'SCORING_REVIEW', 'PUBLISHED', 'ARCHIVED'];
  if (closedStatuses.includes(event.status)) {
    throw new Error(`Pendaftaran untuk event "${event.name}" sudah ditutup (status: ${event.status}).`);
  }

  // Izinkan 1 sekolah mendaftar >1 tim (misal Tim A & Tim B), cegah hanya jika nama tim persis sama di event yang sama
  const duplicateTeam = await prisma.participant.findFirst({
    where: {
      eventId: event.id,
      userId,
      teamName: { equals: cleanTeamName, mode: 'insensitive' },
    },
    select: { id: true },
  });
  if (duplicateTeam) {
    throw new Error(
      `Tim "${cleanTeamName}" sudah terdaftar pada event "${event.name}". Gunakan nama tim berbeda jika ingin mendaftarkan tim kedua (misal "${cleanTeamName} B").`
    );
  }

  // Ambil anggota master profil untuk memvalidasi snapshot URL pas foto jika sourceMemberId disertakan
  const userProfile = await prisma.contingentProfile.findUnique({
    where: { userId },
    include: { members: true },
  });
  const masterMemberMap = new Map((userProfile?.members || []).map((m) => [m.id, m]));

  // Siapkan anggota snapshot + simpan anggota baru ke Profil jika diminta (`saveToProfile: true`)
  const normalizedMembers = [];
  for (const item of Array.isArray(selectedMembers) ? selectedMembers : []) {
    const fullName = String(item.fullName || '').trim();
    if (!fullName) continue;

    let sourceMemberId = item.sourceMemberId || null;
    let photoUrl = item.photoUrl || null;
    let ttl = String(item.ttl || '').trim() || null;
    let nisn = String(item.nisn || '').trim() || null;
    const roleInTeam = String(item.roleInTeam || item.defaultRole || 'PASUKAN').trim().toUpperCase();

    if (sourceMemberId && masterMemberMap.has(sourceMemberId)) {
      const master = masterMemberMap.get(sourceMemberId);
      photoUrl = photoUrl || master.photoUrl || null;
      ttl = ttl || master.ttl || null;
      nisn = nisn || master.nisn || null;
    } else if (item.saveToProfile) {
      const createdMaster = await createContingentMember(userId, {
        schoolName: cleanSchoolName,
        fullName,
        ttl,
        nisn,
        defaultRole: roleInTeam,
        photoUrl,
      });
      sourceMemberId = createdMaster.id;
    }

    normalizedMembers.push({
      sourceMemberId,
      fullName,
      ttl,
      nisn,
      roleInTeam,
      photoUrl,
    });
  }

  const regCode = `REG-${event.slug.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${String(
    Date.now()
  ).slice(-5)}`;

  const created = await prisma.$transaction(async (tx) => {
    const participant = await tx.participant.create({
      data: {
        eventId: event.id,
        userId,
        teamName: cleanTeamName,
        schoolName: cleanSchoolName,
        category: String(category || 'SMA/SMK/MA').trim(),
        registrationNumber: regCode,
        status: 'DRAFT',
        members: {
          create: normalizedMembers,
        },
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            eventDate: true,
            location: true,
            status: true,
            resultsPublished: true,
          },
        },
        members: { orderBy: { id: 'asc' } },
        documents: true,
      },
    });

    await tx.userEvent.upsert({
      where: {
        userId_eventId_role: {
          userId,
          eventId: event.id,
          role: 'PESERTA',
        },
      },
      create: {
        userId,
        eventId: event.id,
        role: 'PESERTA',
        isActive: true,
      },
      update: {
        isActive: true,
      },
    });

    await tx.auditLog.create({
      data: {
        eventId: event.id,
        userId,
        action: 'PESERTA_REGISTER_EVENT',
        resource: `Participant:${participant.id}`,
        payload: JSON.stringify({
          teamName: cleanTeamName,
          schoolName: cleanSchoolName,
          membersCount: normalizedMembers.length,
        }),
      },
    });

    return participant;
  });

  const reqs = await prisma.eventDocumentRequirement.findMany({
    where: { eventId: event.id },
    orderBy: { orderIndex: 'asc' },
  });

  return formatRegistration(created, reqs);
}

export async function updateRegistrationTeamAndMembers(userId, participantId, payload = {}) {
  const existing = await prisma.participant.findFirst({
    where: { id: participantId, userId },
    include: { event: true },
  });
  if (!existing) {
    throw new Error('Data pendaftaran tim tidak ditemukan atau bukan milik akun Anda.');
  }

  const updateData = {};
  if (payload.teamName !== undefined) {
    const clean = String(payload.teamName).trim();
    if (!clean) throw new Error('Nama tim tidak boleh kosong.');
    updateData.teamName = clean;
  }
  if (payload.schoolName !== undefined) {
    const clean = String(payload.schoolName).trim();
    if (!clean) throw new Error('Nama sekolah tidak boleh kosong.');
    updateData.schoolName = clean;
  }
  if (payload.category !== undefined) {
    updateData.category = String(payload.category).trim();
  }
  if (payload.status && ['DRAFT', 'SUBMITTED'].includes(payload.status)) {
    updateData.status = payload.status;
  }

  let normalizedMembers = null;
  if (Array.isArray(payload.members)) {
    normalizedMembers = [];
    for (const item of payload.members) {
      const fullName = String(item.fullName || '').trim();
      if (!fullName) continue;
      let sourceMemberId = item.sourceMemberId || null;
      const roleInTeam = String(item.roleInTeam || 'PASUKAN').trim().toUpperCase();
      const ttl = String(item.ttl || '').trim() || null;
      const nisn = String(item.nisn || '').trim() || null;
      const photoUrl = item.photoUrl || null;

      if (!sourceMemberId && item.saveToProfile) {
        const savedMaster = await createContingentMember(userId, {
          schoolName: updateData.schoolName || existing.schoolName,
          fullName,
          ttl,
          nisn,
          defaultRole: roleInTeam,
          photoUrl,
        });
        sourceMemberId = savedMaster.id;
      }

      normalizedMembers.push({
        sourceMemberId,
        fullName,
        roleInTeam,
        ttl,
        nisn,
        photoUrl,
      });
    }
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(updateData).length > 0) {
      await tx.participant.update({
        where: { id: participantId },
        data: updateData,
      });
    }
    if (normalizedMembers !== null) {
      await tx.participantMember.deleteMany({ where: { participantId } });
      if (normalizedMembers.length > 0) {
        await tx.participantMember.createMany({
          data: normalizedMembers.map((m) => ({ ...m, participantId })),
        });
      }
    }
  });

  return getPesertaRegistrationDetail(userId, participantId);
}

export async function upsertRegistrationDocument(userId, participantId, payload = {}) {
  const existing = await prisma.participant.findFirst({
    where: { id: participantId, userId },
    select: { id: true, eventId: true },
  });
  if (!existing) {
    throw new Error('Data pendaftaran tidak ditemukan atau bukan milik akun Anda.');
  }

  const { requirementId = null, docType, fileName, fileSize, fileUrl, storagePath } = payload;

  const matchedDoc = await prisma.participantDocument.findFirst({
    where: requirementId
      ? { participantId, requirementId }
      : { participantId, docType },
  });

  if (matchedDoc) {
    const oldPath = matchedDoc.storagePath;
    await prisma.participantDocument.update({
      where: { id: matchedDoc.id },
      data: {
        requirementId: requirementId || matchedDoc.requirementId,
        docType: docType || matchedDoc.docType,
        fileName,
        fileSize,
        fileUrl,
        storagePath,
        status: 'PENDING',
        rejectionNote: null,
        uploadedAt: new Date(),
      },
    });
    if (oldPath && oldPath !== storagePath) {
      await deletePesertaStorageFile(oldPath);
    }
  } else {
    await prisma.participantDocument.create({
      data: {
        participantId,
        requirementId,
        docType,
        fileName,
        fileSize,
        fileUrl,
        storagePath,
        status: 'PENDING',
      },
    });
  }

  return getPesertaRegistrationDetail(userId, participantId);
}

export async function deleteRegistrationDocument(userId, participantId, documentId) {
  const existing = await prisma.participant.findFirst({
    where: { id: participantId, userId },
    select: { id: true },
  });
  if (!existing) {
    throw new Error('Data pendaftaran tidak ditemukan atau bukan milik akun Anda.');
  }

  const doc = await prisma.participantDocument.findFirst({
    where: { id: documentId, participantId },
  });
  if (doc) {
    await prisma.participantDocument.delete({ where: { id: doc.id } });
    if (doc.storagePath) {
      await deletePesertaStorageFile(doc.storagePath);
    }
  }

  return getPesertaRegistrationDetail(userId, participantId);
}

