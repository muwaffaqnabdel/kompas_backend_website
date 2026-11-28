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

function parseEventTimeline(timelineJson) {
  if (!timelineJson) return null;
  try {
    const parsed = typeof timelineJson === 'string' ? JSON.parse(timelineJson) : timelineJson;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed
      .filter((s) => s && String(s.title || '').trim())
      .map((s, idx) => ({
        id: s.id || `step-${idx + 1}`,
        title: String(s.title).trim(),
        date: String(s.date || '').trim(),
        description: String(s.description || '').trim(),
        status: ['AUTO', 'COMPLETED', 'CURRENT', 'UPCOMING'].includes(s.status) ? s.status : 'AUTO',
      }));
  } catch {
    return null;
  }
}

async function fetchRawEventTimelineMap() {
  const map = new Map();
  try {
    const rows = await prisma.$queryRaw`SELECT id, "timelineJson" FROM "Event"`;
    for (const r of rows || []) {
      map.set(r.id, r.timelineJson ?? null);
    }
  } catch (err) {
    console.warn('[PESERTA RAW TIMELINE WARN]', err?.message);
  }
  return map;
}

function formatRegistration(p, requirements = [], rawTimelineJson = null) {
  const docChecklist = buildDocumentChecklist(requirements, p.documents);
  const completedDocs = docChecklist.filter((d) => d.status !== 'EMPTY').length;
  const verifiedDocs = docChecklist.filter((d) => d.status === 'VERIFIED').length;
  const effectiveTimelineJson = rawTimelineJson !== null ? rawTimelineJson : p.event?.timelineJson ?? null;

  return {
    id: p.id,
    eventId: p.eventId,
    eventName: p.event?.name || 'Event LKBB',
    eventSlug: p.event?.slug || '',
    eventDate: p.event?.eventDate || null,
    eventLocation: p.event?.location || '',
    eventStatus: p.event?.status || 'REGISTRATION_OPEN',
    eventTimeline: parseEventTimeline(effectiveTimelineJson),
    eventTechnicalMeeting: p.event?.technicalMeeting
      ? {
          meetingDate: p.event.technicalMeeting.meetingDate,
          zoomUrl: p.event.technicalMeeting.zoomUrl,
          notulenUrl: p.event.technicalMeeting.notulenUrl,
          isPublished: Boolean(p.event.technicalMeeting.isPublished),
        }
      : null,
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
          technicalMeeting: {
            select: {
              meetingDate: true,
              zoomUrl: true,
              notulenUrl: true,
              isPublished: true,
            },
          },
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
  const [allReqs, timelineMap] = await Promise.all([
    eventIds.length > 0
      ? prisma.eventDocumentRequirement.findMany({
          where: { eventId: { in: eventIds } },
          orderBy: { orderIndex: 'asc' },
        })
      : [],
    fetchRawEventTimelineMap(),
  ]);

  const reqByEvent = new Map();
  for (const r of allReqs) {
    if (!reqByEvent.has(r.eventId)) reqByEvent.set(r.eventId, []);
    reqByEvent.get(r.eventId).push(r);
  }

  return participants.map((p) =>
    formatRegistration(p, reqByEvent.get(p.eventId) || [], timelineMap.get(p.eventId) ?? null)
  );
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
          technicalMeeting: {
            select: {
              meetingDate: true,
              zoomUrl: true,
              notulenUrl: true,
              isPublished: true,
            },
          },
        },
      },
      members: { orderBy: { id: 'asc' } },
      documents: { orderBy: { uploadedAt: 'desc' } },
    },
  });

  if (!participant) return null;

  const [reqs, timelineMap] = await Promise.all([
    prisma.eventDocumentRequirement.findMany({
      where: { eventId: participant.eventId },
      orderBy: { orderIndex: 'asc' },
    }),
    fetchRawEventTimelineMap(),
  ]);

  return formatRegistration(participant, reqs, timelineMap.get(participant.eventId) ?? null);
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

const BEST_CATEGORY_LABELS = {
  PBB: 'Best PBB',
  'VARIASI & FORMASI': 'Best Variasi & Formasi',
  DANTON: 'Best Danton',
  'MAKE UP / KOSTUM': 'Best Make Up / Kostum',
};

export async function getPesertaResultsData(userId, participantId = null) {
  const targetParticipant = await prisma.participant.findFirst({
    where: participantId ? { id: participantId, userId } : { userId },
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
      scores: {
        include: {
          criterion: {
            select: {
              id: true,
              name: true,
              category: true,
              orderIndex: true,
              maxScore: true,
              weight: true,
            },
          },
          judge: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
      feedbacks: {
        where: { status: 'SENT' },
        include: {
          judge: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: [{ sentAt: 'desc' }, { createdAt: 'desc' }],
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!targetParticipant) {
    return null;
  }

  const event = targetParticipant.event;
  const eventId = targetParticipant.eventId;
  const isPublished = Boolean(
    event?.resultsPublished || event?.status === 'PUBLISHED' || event?.status === 'ARCHIVED'
  );

  // Ambil metadata Dewan Juri di event ini untuk melengkapi jabatan & instansi pada feedback/skor
  const judgeAssignments = await prisma.userEvent.findMany({
    where: { eventId, role: 'JURI' },
    select: {
      userId: true,
      judgeRole: true,
      judgeInstitution: true,
      judgeSpecialties: true,
    },
  });
  const judgeMetaMap = new Map(judgeAssignments.map((ja) => [ja.userId, ja]));

  // Format daftar evaluasi & rekaman suara resmi (hanya status SENT sesuai PRD 6.6)
  const feedbacks = (targetParticipant.feedbacks || []).map((fb) => {
    const meta = judgeMetaMap.get(fb.judgeId);
    return {
      id: fb.id,
      judgeId: fb.judgeId,
      judgeName: fb.judge?.fullName || fb.judge?.email || 'Dewan Juri',
      judgeRole: meta?.judgeRole || 'Dewan Juri',
      judgeInstitution: meta?.judgeInstitution || '',
      audioStorageUrl: fb.audioStorageUrl || null,
      refinedText: fb.refinedText || fb.rawTranscript || '',
      sentAt: fb.sentAt || fb.createdAt,
    };
  });

  const scoredJudgeIds = new Set((targetParticipant.scores || []).map((s) => s.judgeId));
  const isScored = scoredJudgeIds.size > 0;

  const basePayload = {
    event: {
      id: event?.id || eventId,
      name: event?.name || 'Event LKBB',
      slug: event?.slug || '',
      eventDate: event?.eventDate || null,
      location: event?.location || '',
      status: event?.status || 'REGISTRATION_OPEN',
      resultsPublished: Boolean(event?.resultsPublished),
    },
    participant: {
      id: targetParticipant.id,
      teamName: targetParticipant.teamName,
      schoolName: targetParticipant.schoolName,
      category: targetParticipant.category,
      registrationNumber: targetParticipant.registrationNumber,
      queueNumber: targetParticipant.queueNumber,
      status: targetParticipant.status,
    },
    isPublished,
    isScored,
    judgesCountScored: scoredJudgeIds.size,
    feedbacks,
  };

  // Jika Admin Panitia belum mempublikasikan hasil akhir, lindungi klasemen & peringkat agar tidak bocor
  if (!isPublished) {
    return {
      ...basePayload,
      summary: null,
      categories: [],
      detailedScores: [],
      leaderboard: [],
    };
  }

  // Ambil seluruh peserta & skor di event ini untuk menghitung klasemen & gelar Best Category nyata
  const [allCriteria, allParticipants] = await Promise.all([
    prisma.scoringCriterion.findMany({
      where: { eventId, isActive: true },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.participant.findMany({
      where: { eventId },
      include: {
        scores: {
          include: {
            criterion: {
              select: { id: true, category: true, weight: true, maxScore: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const categoriesSet = new Set();
  for (const c of allCriteria) {
    if (c.category) categoriesSet.add(c.category);
  }
  for (const p of allParticipants) {
    for (const s of p.scores || []) {
      if (s.criterion?.category) categoriesSet.add(s.criterion.category);
    }
  }
  const categories = [...categoriesSet];

  // Hitung skor total & skor per kategori untuk tiap tim
  const rankedRows = allParticipants
    .map((p) => {
      const catScores = {};
      for (const cat of categories) catScores[cat] = 0;

      let computedTotal = 0;
      const teamJudgeSet = new Set();
      for (const s of p.scores || []) {
        const val = (Number(s.scoreValue) || 0) * (Number(s.criterion?.weight) || 1);
        computedTotal += val;
        const cat = s.criterion?.category || 'PBB';
        catScores[cat] = (catScores[cat] || 0) + val;
        teamJudgeSet.add(s.judgeId);
      }

      const finalTotal =
        (p.scores || []).length > 0
          ? Number(computedTotal.toFixed(2))
          : p.totalScore != null
          ? Number(Number(p.totalScore).toFixed(2))
          : 0;

      return {
        participantId: p.id,
        teamName: p.teamName,
        schoolName: p.schoolName,
        category: p.category,
        queueNumber: p.queueNumber,
        totalScore: finalTotal,
        judgesScored: teamJudgeSet.size,
        hasScores: (p.scores || []).length > 0 || p.totalScore != null,
        categoryScores: Object.fromEntries(
          Object.entries(catScores).map(([k, v]) => [k, Number(v.toFixed(2))])
        ),
        isCurrentTeam: p.id === targetParticipant.id,
      };
    })
    .filter((r) => r.hasScores)
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((r, idx) => ({ ...r, rank: idx + 1 }));

  // Hitung gelar kejuaraan (Juara Umum 1–3 + Best Category) untuk tim peserta
  const myRow = rankedRows.find((r) => r.participantId === targetParticipant.id) || null;
  const achievements = [];
  if (myRow) {
    if (myRow.rank === 1) achievements.push('Juara Umum 1');
    else if (myRow.rank === 2) achievements.push('Juara Umum 2');
    else if (myRow.rank === 3) achievements.push('Juara Umum 3');

    for (const cat of categories) {
      const topInCat = [...rankedRows]
        .filter((r) => (r.categoryScores[cat] || 0) > 0)
        .sort((a, b) => (b.categoryScores[cat] || 0) - (a.categoryScores[cat] || 0));
      if (topInCat[0]?.participantId === targetParticipant.id) {
        achievements.push(BEST_CATEGORY_LABELS[cat] || `Best ${cat}`);
      }
    }
  }

  // Susun rincian nilai per aba-aba milik tim ini
  const scoreMapByCriterion = new Map();
  for (const s of targetParticipant.scores || []) {
    const cid = s.criterionId;
    if (!scoreMapByCriterion.has(cid)) {
      scoreMapByCriterion.set(cid, {
        criterionId: cid,
        name: s.criterion?.name || 'Aba-Aba',
        category: s.criterion?.category || 'PBB',
        orderIndex: s.criterion?.orderIndex ?? 999,
        weight: Number(s.criterion?.weight) || 1,
        maxScore: Number(s.criterion?.maxScore) || 100,
        judgeScores: [],
        subtotal: 0,
      });
    }
    const entry = scoreMapByCriterion.get(cid);
    const weighted = (Number(s.scoreValue) || 0) * entry.weight;
    entry.judgeScores.push({
      judgeId: s.judgeId,
      judgeName: s.judge?.fullName || 'Dewan Juri',
      scoreValue: Number(s.scoreValue) || 0,
    });
    entry.subtotal = Number((entry.subtotal + weighted).toFixed(2));
  }

  const detailedScores = [...scoreMapByCriterion.values()].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  const categoryBreakdown = categories.map((cat) => {
    const score = myRow?.categoryScores?.[cat] ?? 0;
    const catRanking = [...rankedRows]
      .filter((r) => (r.categoryScores[cat] || 0) > 0)
      .sort((a, b) => (b.categoryScores[cat] || 0) - (a.categoryScores[cat] || 0));
    const catRankIdx = catRanking.findIndex((r) => r.participantId === targetParticipant.id);
    return {
      category: cat,
      score,
      rank: catRankIdx >= 0 ? catRankIdx + 1 : null,
      totalTeamsInCategory: catRanking.length,
    };
  });

  return {
    ...basePayload,
    categories,
    summary: myRow
      ? {
          rank: myRow.rank,
          totalRankedTeams: rankedRows.length,
          totalScore: myRow.totalScore,
          achievements,
          categoryBreakdown,
        }
      : {
          rank: null,
          totalRankedTeams: rankedRows.length,
          totalScore: 0,
          achievements: [],
          categoryBreakdown,
        },
    detailedScores,
    leaderboard: rankedRows,
  };
}

/**
 * Daftar kontingen peserta nyata dari database untuk Admin Panitia per eventId.
 */
export async function getPanitiaParticipantsList(eventIdentifier) {
  const event = await prisma.event.findFirst({
    where: { OR: [{ id: eventIdentifier }, { slug: eventIdentifier }] },
    select: { id: true, name: true, slug: true, eventDate: true, location: true, status: true },
  });

  if (!event) {
    return { event: null, participants: [] };
  }

  const [participants, requirements] = await Promise.all([
    prisma.participant.findMany({
      where: { eventId: event.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            contingentProfile: {
              select: {
                coachName: true,
                officialPhone: true,
              },
            },
          },
        },
        members: { orderBy: { id: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
      orderBy: [{ queueNumber: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.eventDocumentRequirement.findMany({
      where: { eventId: event.id },
      orderBy: { orderIndex: 'asc' },
    }),
  ]);

  const formatted = participants.map((p) => {
    const docChecklist = buildDocumentChecklist(requirements, p.documents);
    const uploadedCount = docChecklist.filter((d) => d.status !== 'EMPTY').length;
    const verifiedCount = docChecklist.filter((d) => d.status === 'VERIFIED').length;
    const rejectedCount = docChecklist.filter((d) => d.status === 'REJECTED').length;

    return {
      id: p.id,
      eventId: p.eventId,
      registrationNumber: p.registrationNumber || `REG-${p.id.slice(0, 6).toUpperCase()}`,
      teamName: p.teamName,
      schoolName: p.schoolName,
      category: p.category,
      queueNumber: p.queueNumber,
      performanceTime: p.performanceTime,
      status: p.status,
      revisionNotes: p.revisionNotes || '',
      totalScore: p.totalScore,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      official: {
        name: p.user?.contingentProfile?.coachName || p.user?.fullName || 'Official Kontingen',
        email: p.user?.email || '',
        phone: p.user?.contingentProfile?.officialPhone || p.user?.phone || '',
      },
      membersCount: p.members?.length || 0,
      members: (p.members || []).map((m) => ({
        id: m.id,
        fullName: m.fullName,
        roleInTeam: m.roleInTeam || 'PASUKAN',
        ttl: m.ttl || '',
        nisn: m.nisn || '',
        photoUrl: m.photoUrl || null,
      })),
      documents: docChecklist,
      docsSummary: {
        total: docChecklist.length,
        uploaded: uploadedCount,
        verified: verifiedCount,
        rejected: rejectedCount,
      },
    };
  });

  return { event, participants: formatted };
}

/**
 * Verifikasi berkas, catatan revisi, status kontingen, serta nomor urut & jam tampil oleh Admin Panitia.
 */
export async function updatePanitiaParticipantVerification(
  eventIdentifier,
  participantId,
  payload = {},
  actorUserId = null
) {
  const existing = await prisma.participant.findUnique({
    where: { id: participantId },
    include: {
      event: { select: { id: true, slug: true, eventDate: true } },
    },
  });

  if (!existing) {
    throw new Error('Data kontingen peserta tidak ditemukan.');
  }

  if (
    eventIdentifier &&
    existing.eventId !== eventIdentifier &&
    existing.event?.slug !== eventIdentifier
  ) {
    throw new Error('Kontingen ini tidak terdaftar pada event yang dipilih.');
  }

  const updateData = {};

  if (payload.status !== undefined) {
    const allowed = ['DRAFT', 'SUBMITTED', 'REVISION_REQUIRED', 'VALIDATED', 'SCHEDULED'];
    if (!allowed.includes(payload.status)) {
      throw new Error(`Status peserta tidak valid: ${payload.status}`);
    }
    updateData.status = payload.status;
  }

  if (payload.revisionNotes !== undefined) {
    updateData.revisionNotes = String(payload.revisionNotes || '').trim() || null;
  }

  if (payload.queueNumber !== undefined) {
    if (payload.queueNumber === null || payload.queueNumber === '') {
      updateData.queueNumber = null;
    } else {
      const parsedNum = Number(payload.queueNumber);
      if (!Number.isInteger(parsedNum) || parsedNum <= 0) {
        throw new Error('Nomor urut tampil harus berupa bilangan bulat positif.');
      }
      // Cek konflik nomor urut dengan tim lain pada event yang sama
      const conflict = await prisma.participant.findFirst({
        where: {
          eventId: existing.eventId,
          queueNumber: parsedNum,
          NOT: { id: existing.id },
        },
        select: { teamName: true, schoolName: true },
      });
      if (conflict) {
        throw new Error(
          `Nomor urut #${String(parsedNum).padStart(2, '0')} sudah dipakai oleh ${conflict.teamName} (${conflict.schoolName}).`
        );
      }
      updateData.queueNumber = parsedNum;
      // Jika tim sudah VALIDATED dan diberi nomor urut, otomatis naik ke SCHEDULED bila status tidak ditentukan eksplisit
      if (!updateData.status && existing.status === 'VALIDATED') {
        updateData.status = 'SCHEDULED';
      }
    }
  }

  if (payload.performanceTime !== undefined) {
    if (!payload.performanceTime) {
      updateData.performanceTime = null;
    } else if (/^\d{1,2}:\d{2}$/.test(String(payload.performanceTime).trim())) {
      // Format jam "HH:mm" digabung dengan tanggal event
      const [hh, mm] = String(payload.performanceTime).trim().split(':').map(Number);
      const baseDate = existing.event?.eventDate ? new Date(existing.event.eventDate) : new Date();
      baseDate.setHours(hh, mm, 0, 0);
      updateData.performanceTime = baseDate;
    } else {
      const parsedDate = new Date(payload.performanceTime);
      if (!Number.isNaN(parsedDate.getTime())) {
        updateData.performanceTime = parsedDate;
      }
    }
  }

  const docUpdates = Array.isArray(payload.documentUpdates) ? payload.documentUpdates : [];

  await prisma.$transaction(async (tx) => {
    if (Object.keys(updateData).length > 0) {
      await tx.participant.update({
        where: { id: existing.id },
        data: updateData,
      });
    }

    for (const du of docUpdates) {
      if (!du?.documentId) continue;
      const mappedStatus =
        du.status === 'VERIFIED' || du.status === 'APPROVED'
          ? 'APPROVED'
          : du.status === 'REJECTED' || du.status === 'REVISION'
          ? 'REJECTED'
          : 'PENDING';
      await tx.participantDocument.updateMany({
        where: { id: du.documentId, participantId: existing.id },
        data: {
          status: mappedStatus,
          rejectionNote:
            mappedStatus === 'REJECTED'
              ? String(du.rejectionNote || '').trim() || 'Mohon perbaiki berkas ini.'
              : null,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        eventId: existing.eventId,
        userId: actorUserId,
        action: 'PANITIA_VERIFY_PARTICIPANT',
        resource: `Participant:${existing.id}`,
        payload: JSON.stringify({
          status: updateData.status,
          queueNumber: updateData.queueNumber,
          docUpdatesCount: docUpdates.length,
        }),
      },
    });
  });

  const refreshed = await getPanitiaParticipantsList(existing.eventId);
  return refreshed.participants.find((p) => p.id === existing.id) || null;
}

const VALIDATED_DP_STATUSES = [
  'VALIDATED',
  'SCHEDULED',
  'SCORED',
  'FEEDBACK_GENERATED',
  'FINALIZED',
];

const DEFAULT_DP_STEPS = [
  {
    orderIndex: 1,
    code: 'DOC_CHECK',
    shortName: 'DP 1',
    label: 'Cek Dokumen',
    name: 'DP 1 - Pengecekan Dokumen & Berkas',
    instruction: 'Segera menuju Pos DP 1 bersama komandan peleton & berkas fisik yang diperlukan.',
  },
  {
    orderIndex: 2,
    code: 'PHOTOSHOOT',
    shortName: 'DP 2',
    label: 'Photoshoot',
    name: 'DP 2 - Photoshoot Resmi Pasukan',
    instruction: 'Pasukan berada di studio foto resmi. Rapikan atribut dan ikuti arahan petugas foto.',
  },
  {
    orderIndex: 3,
    code: 'FINAL_PREP',
    shortName: 'DP 3',
    label: 'Persiapan',
    name: 'DP 3 - Persiapan Terakhir & Pemanasan',
    instruction: 'Lakukan pemanasan ringan dan cek formasi sebelum dipanggil masuk ke Arena Utama.',
  },
  {
    orderIndex: 4,
    code: 'STAGE_PERFORMANCE',
    shortName: 'DP 4',
    label: 'Arena Utama',
    name: 'DP 4 - Penampilan Lapangan Utama',
    instruction: 'Pasukan sedang berada di Arena Utama. Tampilkan performa terbaik di hadapan Dewan Juri.',
  },
];

/**
 * Mengambil posisi live DP 1–4 untuk 1 pendaftaran tim milik peserta,
 * beserta informasi tim yang sedang aktif di DP 1 & DP 4 pada event yang sama.
 */
export async function getPesertaLiveDPStatus(userId, participantId = null) {
  const participant = await prisma.participant.findFirst({
    where: participantId ? { id: participantId, userId } : { userId },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          slug: true,
          eventDate: true,
          location: true,
        },
      },
      journeys: {
        include: {
          decisionPoint: {
            select: {
              id: true,
              orderIndex: true,
              code: true,
              name: true,
            },
          },
        },
        orderBy: { enteredAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!participant) {
    return null;
  }

  const [eventDps, activeEventJourneys] = await Promise.all([
    prisma.decisionPoint.findMany({
      where: { eventId: participant.eventId },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.participantJourney.findMany({
      where: {
        status: 'IN_PROGRESS',
        participant: { eventId: participant.eventId },
      },
      include: {
        decisionPoint: {
          select: { orderIndex: true, code: true, name: true },
        },
        participant: {
          select: { id: true, teamName: true, schoolName: true, queueNumber: true },
        },
      },
    }),
  ]);

  const dpByOrder = new Map(eventDps.map((dp) => [dp.orderIndex, dp]));
  const journeys = participant.journeys || [];
  const activeJourney = journeys.find((j) => j.status === 'IN_PROGRESS') || null;
  const completedOrders = new Set(
    journeys
      .filter((j) => j.status === 'COMPLETED' && j.decisionPoint?.orderIndex)
      .map((j) => j.decisionPoint.orderIndex)
  );
  const completedDp4 = completedOrders.has(4);

  let currentPos = null;
  if (activeJourney?.decisionPoint?.orderIndex) {
    currentPos = activeJourney.decisionPoint.orderIndex;
  } else if (completedDp4) {
    currentPos = 'FINISHED';
  }

  const activeStepMeta =
    typeof currentPos === 'number'
      ? DEFAULT_DP_STEPS.find((s) => s.orderIndex === currentPos) || null
      : null;

  const activeDp = activeJourney
    ? {
        orderIndex: activeJourney.decisionPoint?.orderIndex || currentPos,
        code: activeJourney.decisionPoint?.code || activeStepMeta?.code || '',
        name: activeJourney.decisionPoint?.name || activeStepMeta?.name || `DP ${currentPos}`,
        shortName: activeStepMeta?.shortName || `DP ${currentPos}`,
        label: activeStepMeta?.label || `Pos ${currentPos}`,
        instruction: activeStepMeta?.instruction || 'Ikuti arahan petugas pos di lokasi.',
        enteredAt: activeJourney.enteredAt,
        startedAt: activeJourney.startedAt,
        dp4ScoringOpen:
          activeJourney.decisionPoint?.orderIndex === 4 && Boolean(activeJourney.startedAt),
      }
    : null;

  const steps = DEFAULT_DP_STEPS.map((def) => {
    const dbDp = dpByOrder.get(def.orderIndex);
    const matchingJourneys = journeys.filter((j) => j.decisionPoint?.orderIndex === def.orderIndex);
    const latestJourney = matchingJourneys[matchingJourneys.length - 1] || null;

    let stepStatus = 'UPCOMING';
    if (currentPos === 'FINISHED') {
      stepStatus = 'COMPLETED';
    } else if (typeof currentPos === 'number') {
      if (def.orderIndex < currentPos || completedOrders.has(def.orderIndex)) {
        stepStatus = 'COMPLETED';
      } else if (def.orderIndex === currentPos) {
        stepStatus = 'ACTIVE';
      }
    } else if (completedOrders.has(def.orderIndex)) {
      stepStatus = 'COMPLETED';
    }

    return {
      orderIndex: def.orderIndex,
      code: dbDp?.code || def.code,
      shortName: def.shortName,
      label: def.label,
      name: dbDp?.name || def.name,
      instruction: def.instruction,
      status: stepStatus,
      enteredAt: latestJourney?.enteredAt || null,
      completedAt: latestJourney?.completedAt || null,
    };
  });

  const formatOtherTeam = (journey) => {
    if (!journey?.participant) return null;
    return {
      participantId: journey.participant.id,
      teamName: journey.participant.teamName,
      schoolName: journey.participant.schoolName,
      queueNumber:
        journey.participant.queueNumber != null
          ? String(journey.participant.queueNumber).padStart(2, '0')
          : null,
      isSelf: journey.participant.id === participant.id,
      enteredAt: journey.enteredAt,
    };
  };

  const pos1Journey = activeEventJourneys.find((j) => j.decisionPoint?.orderIndex === 1) || null;
  const pos4Journey = activeEventJourneys.find((j) => j.decisionPoint?.orderIndex === 4) || null;

  return {
    participantId: participant.id,
    eventId: participant.eventId,
    eventName: participant.event?.name || '',
    teamName: participant.teamName,
    schoolName: participant.schoolName,
    queueNumber: participant.queueNumber,
    participantStatus: participant.status,
    isQualifiedForDP: VALIDATED_DP_STATUSES.includes(participant.status),
    currentPos, // null | 1 | 2 | 3 | 4 | 'FINISHED'
    callEventKey: activeJourney
      ? `${participant.id}:${activeJourney.decisionPoint?.orderIndex || currentPos}:${new Date(
          activeJourney.enteredAt
        ).getTime()}`
      : null,
    activeDp,
    steps,
    currentlyInPos1: formatOtherTeam(pos1Journey),
    currentlyInPos4: formatOtherTeam(pos4Journey),
    journeys: journeys.map((j) => ({
      id: j.id,
      dpOrder: j.decisionPoint?.orderIndex || null,
      dpCode: j.decisionPoint?.code || '',
      dpName: j.decisionPoint?.name || '',
      status: j.status,
      enteredAt: j.enteredAt,
      startedAt: j.startedAt,
      completedAt: j.completedAt,
    })),
    syncedAt: new Date().toISOString(),
  };
}

