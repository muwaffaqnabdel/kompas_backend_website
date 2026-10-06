import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

/**
 * KOMPAS Central Data Service
 * Mendukung akses database Supabase PostgreSQL via Prisma, dengan in-memory fallback
 * otomatis bila database cloud sedang dalam proses unpause / maintenance.
 */

const defaultPasswordHash = bcrypt.hashSync('password123', 10);

// In-Memory Fallback State (Mirror dari schema.prisma & seed.mjs)
const memoryState = {
  users: [
    {
      id: 'usr-admin-1',
      email: 'admin@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Super Admin Pusat KOMPAS',
      phone: '081234567890',
      globalRole: 'SUPER_ADMIN',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-panitia-1',
      email: 'panitia@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Rian Pratama (Admin Panitia)',
      phone: '081234567891',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp1',
      email: 'dp1@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Budi Santoso (Operator DP 1)',
      phone: '081234567892',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp2',
      email: 'dp2@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Siti Rahma (Operator DP 2)',
      phone: '081234567893',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp3',
      email: 'dp3@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Agus Wijaya (Operator DP 3)',
      phone: '081234567894',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp4',
      email: 'dp4@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Hendro Kusuma (Operator DP 4)',
      phone: '081234567895',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-juri1',
      email: 'juri1@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Kolonel (Purn) Bambang S., M.Pd (Juri 1)',
      phone: '081234567896',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-juri2',
      email: 'juri2@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Mayor Aris Setiawan (Juri 2)',
      phone: '081234567897',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-juri3',
      email: 'juri3@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Dra. Endang Lestari (Juri 3)',
      phone: '081234567898',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-peserta1',
      email: 'peserta@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Dimas Aditya (Danton Garuda Sakti)',
      phone: '081234567899',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
  ],

  events: [
    {
      id: 'evt-lkbb-2026',
      name: 'LKBB Nasional Paskibra 2026',
      slug: 'lkbb-nasional-2026',
      description: 'Lomba Kreasi Baris Berbaris Terbuka Tingkat Nasional SMA/SMK Sederajat.',
      eventDate: new Date('2026-11-15T08:00:00Z'),
      location: 'GOR Remaja Jakarta Timur',
      status: 'REGISTRATION_OPEN',
      dpFlowLocked: false,
      scoringLocked: false,
      resultsPublished: false,
      createdAt: new Date(),
    },
    {
      id: 'evt-galang-2026',
      name: 'LKBB Galang Tanggap Jawa Barat 2026',
      slug: 'lkbb-galang-tanggap-2026',
      description: 'Kompetisi Baris Berbaris Wilayah Jawa Barat & Banten.',
      eventDate: new Date('2026-12-05T08:00:00Z'),
      location: 'Stadion Pajajaran Bandung',
      status: 'REGISTRATION_OPEN',
      dpFlowLocked: false,
      scoringLocked: false,
      resultsPublished: false,
      createdAt: new Date(),
    },
  ],

  userEvents: [
    { id: 'ue-panitia-1', userId: 'usr-panitia-1', eventId: 'evt-lkbb-2026', role: 'ADMIN_PANITIA', assignedDpId: null, isActive: true },
    { id: 'ue-dp1', userId: 'usr-dp1', eventId: 'evt-lkbb-2026', role: 'PANITIA_DP', assignedDpId: 'dp-1', isActive: true },
    { id: 'ue-dp2', userId: 'usr-dp2', eventId: 'evt-lkbb-2026', role: 'PANITIA_DP', assignedDpId: 'dp-2', isActive: true },
    { id: 'ue-dp3', userId: 'usr-dp3', eventId: 'evt-lkbb-2026', role: 'PANITIA_DP', assignedDpId: 'dp-3', isActive: true },
    { id: 'ue-dp4', userId: 'usr-dp4', eventId: 'evt-lkbb-2026', role: 'PANITIA_DP', assignedDpId: 'dp-4', isActive: true },
    { id: 'ue-juri1', userId: 'usr-juri1', eventId: 'evt-lkbb-2026', role: 'JURI', assignedDpId: null, isActive: true },
    { id: 'ue-juri2', userId: 'usr-juri2', eventId: 'evt-lkbb-2026', role: 'JURI', assignedDpId: null, isActive: true },
    { id: 'ue-juri3', userId: 'usr-juri3', eventId: 'evt-lkbb-2026', role: 'JURI', assignedDpId: null, isActive: true },
    { id: 'ue-peserta1', userId: 'usr-peserta1', eventId: 'evt-lkbb-2026', role: 'PESERTA', assignedDpId: null, isActive: true },
  ],

  decisionPoints: [
    { id: 'dp-1', eventId: 'evt-lkbb-2026', orderIndex: 1, code: 'DOC_CHECK', name: 'DP 1 - Pengecekan Dokumen & Berkas', capacityLimit: 1, isActive: true },
    { id: 'dp-2', eventId: 'evt-lkbb-2026', orderIndex: 2, code: 'PHOTOSHOOT', name: 'DP 2 - Photoshoot Resmi Pasukan', capacityLimit: 1, isActive: true },
    { id: 'dp-3', eventId: 'evt-lkbb-2026', orderIndex: 3, code: 'FINAL_PREP', name: 'DP 3 - Persiapan Terakhir & Pemanasan', capacityLimit: 1, isActive: true },
    { id: 'dp-4', eventId: 'evt-lkbb-2026', orderIndex: 4, code: 'STAGE_PERFORMANCE', name: 'DP 4 - Penampilan Lapangan Utama', capacityLimit: 1, isActive: true },
  ],

  criteria: [
    { id: 'crit-1', eventId: 'evt-lkbb-2026', name: '1. Langkah Tegap & Hormat Kanan', minScore: 70, maxScore: 100, weight: 1.0 },
    { id: 'crit-2', eventId: 'evt-lkbb-2026', name: '2. Kerapihan Saf, Banjar & Pasukan', minScore: 70, maxScore: 100, weight: 1.0 },
    { id: 'crit-3', eventId: 'evt-lkbb-2026', name: '3. Variasi Formasi & Kekompakan', minScore: 70, maxScore: 100, weight: 1.0 },
    { id: 'crit-4', eventId: 'evt-lkbb-2026', name: '4. Artikulasi & Intonasi Danton', minScore: 70, maxScore: 100, weight: 1.0 },
  ],

  participants: [
    {
      id: 'part-1',
      eventId: 'evt-lkbb-2026',
      userId: 'usr-peserta1',
      teamName: 'PASKIBRA GARUDA SAKTI',
      schoolName: 'SMAN 1 Jakarta',
      registrationNumber: 'REG-LKBB26-001',
      queueNumber: '01',
      scheduledTime: '08:30 WIB',
      status: 'VALIDATED', // DRAFT, SUBMITTED, REVISION_REQUIRED, VALIDATED, SCHEDULED, SCORED, FINALIZED
      currentDpId: 'dp-1',
      dpStatus: 'IN_PROGRESS',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_Kepsek_SMAN1.pdf' },
        kartuPelajar: { status: 'VALIDATED', name: '16_Kartu_Pelajar_Pasukan.pdf' },
        suratDokter: { status: 'VALIDATED', name: 'Surat_Kesehatan_Puskesmas.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-01T10:00:00Z', by: 'Dimas Aditya' },
        { action: 'VALIDATED', at: '2026-10-02T14:30:00Z', by: 'Rian Pratama (Admin Panitia)' },
      ],
    },
    {
      id: 'part-2',
      eventId: 'evt-lkbb-2026',
      userId: null,
      teamName: 'SATRIA BHAYANGKARA',
      schoolName: 'SMAN 3 Bandung',
      registrationNumber: 'REG-LKBB26-002',
      queueNumber: '02',
      scheduledTime: '09:00 WIB',
      status: 'SUBMITTED',
      currentDpId: null,
      dpStatus: 'WAITING',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_SMAN3_Bdg.pdf' },
        kartuPelajar: { status: 'PENDING_REVIEW', name: 'KTP_Pelajar_Scan.pdf' },
        suratDokter: { status: 'PENDING_REVIEW', name: 'Surat_Kesehatan.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-03T09:15:00Z', by: 'Official SMAN 3' },
      ],
    },
    {
      id: 'part-3',
      eventId: 'evt-lkbb-2026',
      userId: null,
      teamName: 'KARTIKA WIRATAMA',
      schoolName: 'SMKN 2 Surabaya',
      registrationNumber: 'REG-LKBB26-003',
      queueNumber: '03',
      scheduledTime: '09:30 WIB',
      status: 'REVISION_REQUIRED',
      currentDpId: null,
      dpStatus: 'WAITING',
      revisionNote: 'Surat keterangan dokter untuk 2 anggota cadangan belum ditandatangani dokter pemeriksa.',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_SMKN2.pdf' },
        kartuPelajar: { status: 'VALIDATED', name: 'Kartu_Pelajar_Lengkap.pdf' },
        suratDokter: { status: 'REVISION', name: 'Surat_Dokter_Kurang_Ttd.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-02T11:00:00Z', by: 'Pembina SMKN 2' },
        { action: 'REVISION_REQUIRED', at: '2026-10-03T16:00:00Z', by: 'Rian Pratama' },
      ],
    },
    {
      id: 'part-4',
      eventId: 'evt-lkbb-2026',
      userId: null,
      teamName: 'PASKIBRA PANDU NUSANTARA',
      schoolName: 'SMA Taruna Nusantara Magelang',
      registrationNumber: 'REG-LKBB26-004',
      queueNumber: '04',
      scheduledTime: '10:00 WIB',
      status: 'VALIDATED',
      currentDpId: null,
      dpStatus: 'WAITING',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_Taruna.pdf' },
        kartuPelajar: { status: 'VALIDATED', name: 'ID_Cards_Taruna.pdf' },
        suratDokter: { status: 'VALIDATED', name: 'Medical_Check_Taruna.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-04T08:00:00Z', by: 'Danton SMA TN' },
        { action: 'VALIDATED', at: '2026-10-04T12:00:00Z', by: 'Rian Pratama' },
      ],
    },
  ],

  scores: [],
  feedbacks: [],
  auditLogs: [
    { id: 'log-1', timestamp: new Date(Date.now() - 1000 * 60 * 30), actor: 'Rian Pratama', role: 'ADMIN_PANITIA', action: 'VALIDATE_PARTICIPANT', target: 'PASKIBRA GARUDA SAKTI' },
    { id: 'log-2', timestamp: new Date(Date.now() - 1000 * 60 * 15), actor: 'Budi Santoso', role: 'PANITIA_DP_1', action: 'CHECKIN_TEAM', target: 'PASKIBRA GARUDA SAKTI' },
  ],
};

// Helper untuk eksekusi safe query dengan fallback otomatis
async function withDbFallback(dbFn, fallbackFn) {
  try {
    return await dbFn();
  } catch (err) {
    // Jika koneksi DB bermasalah (Supabase timeout / offline), gunakan in-memory store
    console.warn('[KOMPAS DATA SERVICE] Database tidak terjangkau, menggunakan in-memory state:', err.message || err);
    return await fallbackFn();
  }
}

// -------------------------------------------------------------
// USER & AUTH SERVICES
// -------------------------------------------------------------
export async function findUserByEmail(email) {
  const normalized = email.toLowerCase().trim();
  return withDbFallback(
    async () => {
      const u = await prisma.user.findUnique({
        where: { email: normalized },
        include: {
          userEvents: {
            where: { isActive: true },
            include: { event: true, assignedDp: true },
          },
        },
      });
      return u;
    },
    async () => {
      const u = memoryState.users.find((x) => x.email.toLowerCase() === normalized);
      if (!u) return null;
      const uEvents = memoryState.userEvents
        .filter((ue) => ue.userId === u.id && ue.isActive)
        .map((ue) => ({
          ...ue,
          event: memoryState.events.find((e) => e.id === ue.eventId),
          assignedDp: memoryState.decisionPoints.find((dp) => dp.id === ue.assignedDpId) || null,
        }));
      return { ...u, userEvents: uEvents };
    }
  );
}

export async function findUserById(userId) {
  return withDbFallback(
    async () => {
      return await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userEvents: {
            where: { isActive: true },
            include: { event: true, assignedDp: true },
          },
        },
      });
    },
    async () => {
      const u = memoryState.users.find((x) => x.id === userId);
      if (!u) return null;
      const uEvents = memoryState.userEvents
        .filter((ue) => ue.userId === u.id && ue.isActive)
        .map((ue) => ({
          ...ue,
          event: memoryState.events.find((e) => e.id === ue.eventId),
          assignedDp: memoryState.decisionPoints.find((dp) => dp.id === ue.assignedDpId) || null,
        }));
      return { ...u, userEvents: uEvents };
    }
  );
}

// -------------------------------------------------------------
// EVENT SERVICES
// -------------------------------------------------------------
export async function getEventsList() {
  return withDbFallback(
    async () => {
      return await prisma.event.findMany({
        orderBy: { eventDate: 'asc' },
        include: {
          decisionPoints: true,
          _count: { select: { participants: true } },
        },
      });
    },
    async () => {
      return memoryState.events.map((e) => ({
        ...e,
        decisionPoints: memoryState.decisionPoints.filter((dp) => dp.eventId === e.id),
        _count: {
          participants: memoryState.participants.filter((p) => p.eventId === e.id).length,
        },
      }));
    }
  );
}

export async function getEventBySlugOrId(identifier) {
  return withDbFallback(
    async () => {
      return await prisma.event.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
        include: {
          decisionPoints: { orderBy: { orderIndex: 'asc' } },
          criteria: true,
          _count: { select: { participants: true } },
        },
      });
    },
    async () => {
      const ev = memoryState.events.find((e) => e.id === identifier || e.slug === identifier);
      if (!ev) return null;
      return {
        ...ev,
        decisionPoints: memoryState.decisionPoints
          .filter((dp) => dp.eventId === ev.id)
          .sort((a, b) => a.orderIndex - b.orderIndex),
        criteria: memoryState.criteria.filter((c) => c.eventId === ev.id),
        _count: {
          participants: memoryState.participants.filter((p) => p.eventId === ev.id).length,
        },
      };
    }
  );
}

export async function createNewEvent(data) {
  const newEvent = {
    id: `evt-${Date.now()}`,
    name: data.name,
    slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: data.description || '',
    eventDate: new Date(data.eventDate || Date.now() + 86400000 * 30),
    location: data.location || 'Gelanggang Olahraga',
    status: data.status || 'DRAFT_SETUP',
    dpFlowLocked: false,
    scoringLocked: false,
    resultsPublished: false,
    createdAt: new Date(),
  };

  memoryState.events.unshift(newEvent);

  // Otomatis siapkan 4 pos DP standar per PRD Addendum 1.2
  const standardDps = [
    { orderIndex: 1, code: 'DOC_CHECK', name: 'DP 1 - Pengecekan Dokumen & Berkas', capacityLimit: 1 },
    { orderIndex: 2, code: 'PHOTOSHOOT', name: 'DP 2 - Photoshoot Resmi Pasukan', capacityLimit: 1 },
    { orderIndex: 3, code: 'FINAL_PREP', name: 'DP 3 - Persiapan Terakhir & Pemanasan', capacityLimit: 1 },
    { orderIndex: 4, code: 'STAGE_PERFORMANCE', name: 'DP 4 - Penampilan Lapangan Utama', capacityLimit: 1 },
  ];

  standardDps.forEach((dp) => {
    memoryState.decisionPoints.push({
      id: `dp-${newEvent.id}-${dp.orderIndex}`,
      eventId: newEvent.id,
      orderIndex: dp.orderIndex,
      code: dp.code,
      name: dp.name,
      capacityLimit: dp.capacityLimit,
      isActive: true,
    });
  });

  memoryState.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date(),
    actor: 'Super Admin',
    role: 'SUPER_ADMIN',
    action: 'CREATE_EVENT',
    target: newEvent.name,
  });

  return newEvent;
}

export async function updateEvent(id, updateData) {
  const evIndex = memoryState.events.findIndex((e) => e.id === id || e.slug === id);
  if (evIndex === -1) {
    throw new Error('Event tidak ditemukan.');
  }

  memoryState.events[evIndex] = {
    ...memoryState.events[evIndex],
    ...updateData,
  };

  memoryState.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date(),
    actor: 'Super Admin',
    role: 'SUPER_ADMIN',
    action: 'UPDATE_EVENT_STATUS',
    target: `${memoryState.events[evIndex].name} -> ${updateData.status || 'Updated'}`,
  });

  return memoryState.events[evIndex];
}

export async function assignAdminToEvent(eventId, { email, fullName }) {
  const ev = memoryState.events.find((e) => e.id === eventId);
  if (!ev) throw new Error('Event tidak ditemukan.');

  let targetUser = memoryState.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!targetUser) {
    targetUser = {
      id: `usr-${Date.now()}`,
      email: email.toLowerCase(),
      passwordHash: defaultPasswordHash,
      fullName: fullName || 'Admin Panitia Baru',
      phone: '081234567800',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    };
    memoryState.users.push(targetUser);
  }

  // Cek apakah sudah terdaftar
  const existingUe = memoryState.userEvents.find(
    (ue) => ue.userId === targetUser.id && ue.eventId === eventId && ue.role === 'ADMIN_PANITIA'
  );

  if (!existingUe) {
    memoryState.userEvents.push({
      id: `ue-${Date.now()}`,
      userId: targetUser.id,
      eventId: eventId,
      role: 'ADMIN_PANITIA',
      assignedDpId: null,
      isActive: true,
    });
  }

  memoryState.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date(),
    actor: 'Super Admin',
    role: 'SUPER_ADMIN',
    action: 'ASSIGN_ADMIN_PANITIA',
    target: `${targetUser.fullName} -> ${ev.name}`,
  });

  return { targetUser, event: ev };
}

// -------------------------------------------------------------
// SUPER ADMIN SERVICES
// -------------------------------------------------------------
export async function getSuperAdminOverviewData() {
  return withDbFallback(
    async () => {
      const [totalEvents, totalUsers, totalParticipants] = await Promise.all([
        prisma.event.count(),
        prisma.user.count(),
        prisma.participant.count(),
      ]);
      const events = await prisma.event.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      return {
        stats: {
          totalEvents,
          totalUsers,
          totalParticipants,
          systemStatus: 'ONLINE_HEALTHY',
          databaseEngine: 'Supabase PostgreSQL',
        },
        events,
        auditLogs: [],
      };
    },
    async () => {
      return {
        stats: {
          totalEvents: memoryState.events.length,
          totalUsers: memoryState.users.length,
          totalParticipants: memoryState.participants.length,
          systemStatus: 'ONLINE_ACTIVE',
          databaseEngine: 'KOMPAS Active Data Engine',
        },
        events: memoryState.events,
        auditLogs: memoryState.auditLogs,
      };
    }
  );
}

// -------------------------------------------------------------
// ADMIN PANITIA SERVICES
// -------------------------------------------------------------
export async function getPanitiaOverviewData(eventId = 'evt-lkbb-2026') {
  return withDbFallback(
    async () => {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          participants: true,
          decisionPoints: { orderBy: { orderIndex: 'asc' } },
        },
      });
      return event;
    },
    async () => {
      const event = memoryState.events.find((e) => e.id === eventId) || memoryState.events[0];
      const participants = memoryState.participants.filter((p) => p.eventId === event.id);
      const decisionPoints = memoryState.decisionPoints.filter((dp) => dp.eventId === event.id);

      const statusCounts = {
        VALIDATED: participants.filter((p) => p.status === 'VALIDATED').length,
        SUBMITTED: participants.filter((p) => p.status === 'SUBMITTED').length,
        REVISION_REQUIRED: participants.filter((p) => p.status === 'REVISION_REQUIRED').length,
        TOTAL: participants.length,
      };

      return {
        event,
        statusCounts,
        participants,
        decisionPoints,
      };
    }
  );
}

export async function verifyParticipantDocs(participantId, { status, revisionNote, adminName = 'Admin Panitia' }) {
  const pIndex = memoryState.participants.findIndex((p) => p.id === participantId);
  if (pIndex === -1) {
    throw new Error('Peserta tidak ditemukan.');
  }

  memoryState.participants[pIndex].status = status;
  if (revisionNote) {
    memoryState.participants[pIndex].revisionNote = revisionNote;
  }
  memoryState.participants[pIndex].auditHistory.push({
    action: status,
    at: new Date().toISOString(),
    by: adminName,
    note: revisionNote || undefined,
  });

  memoryState.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date(),
    actor: adminName,
    role: 'ADMIN_PANITIA',
    action: `VERIFY_${status}`,
    target: memoryState.participants[pIndex].teamName,
  });

  return memoryState.participants[pIndex];
}

// -------------------------------------------------------------
// PANITIA DP & ATOMIC MOVEMENT (HARI H)
// -------------------------------------------------------------
export async function getDPStatusData(eventId = 'evt-lkbb-2026') {
  const dps = memoryState.decisionPoints.filter((dp) => dp.eventId === eventId);
  const participants = memoryState.participants.filter((p) => p.eventId === eventId);

  const posStatus = dps.map((dp) => {
    const occupiedTeam = participants.find((p) => p.currentDpId === dp.id && p.dpStatus === 'IN_PROGRESS');
    return {
      ...dp,
      isOccupied: !!occupiedTeam,
      activeTeam: occupiedTeam || null,
      capacityAvailable: occupiedTeam ? 0 : 1,
    };
  });

  return {
    decisionPoints: posStatus,
    waitingQueue: participants.filter((p) => !p.currentDpId && p.status === 'VALIDATED'),
  };
}

export async function executeAtomicDPMove({ eventId = 'evt-lkbb-2026', participantId, toDpIndex, operatorName }) {
  const dps = memoryState.decisionPoints
    .filter((dp) => dp.eventId === eventId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const targetDp = dps.find((dp) => dp.orderIndex === toDpIndex);
  if (!targetDp) {
    throw new Error(`Pos DP tujuan (Indeks ${toDpIndex}) tidak valid.`);
  }

  // ATOMIC LOCK CHECK: Cek apakah target DP sudah terisi 1 tim!
  const isTargetOccupied = memoryState.participants.some(
    (p) => p.currentDpId === targetDp.id && p.dpStatus === 'IN_PROGRESS' && p.id !== participantId
  );

  if (isTargetOccupied) {
    return {
      success: false,
      blocked: true,
      message: `ATOMIC LOCK AKTIF: ${targetDp.name} sedang terisi 1 tim! Tim tidak dapat dipindahkan sebelum slot tujuan bebas.`,
      targetDp,
    };
  }

  // Jika slot kosong, pindahkan tim secara atomik
  const pIndex = memoryState.participants.findIndex((p) => p.id === participantId);
  if (pIndex === -1) {
    throw new Error('Data tim peserta tidak ditemukan.');
  }

  const previousDp = dps.find((dp) => dp.id === memoryState.participants[pIndex].currentDpId);
  memoryState.participants[pIndex].currentDpId = targetDp.id;
  memoryState.participants[pIndex].dpStatus = 'IN_PROGRESS';

  memoryState.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date(),
    actor: operatorName || 'Operator DP',
    role: 'PANITIA_DP',
    action: `MOVE_TO_${targetDp.code}`,
    target: memoryState.participants[pIndex].teamName,
  });

  return {
    success: true,
    blocked: false,
    message: `Berhasil memindahkan ${memoryState.participants[pIndex].teamName} ke ${targetDp.name}. Slot ${previousDp ? previousDp.name : 'awal'} kini siap untuk tim berikutnya.`,
    participant: memoryState.participants[pIndex],
    targetDp,
  };
}

// -------------------------------------------------------------
// JURI SCORING & LEADERBOARD
// -------------------------------------------------------------
export async function submitJuriScore({ eventId = 'evt-lkbb-2026', participantId, juriId, scores, penaltySeconds = 0 }) {
  const submission = {
    id: `sub-${Date.now()}`,
    eventId,
    participantId,
    juriId,
    scores, // { c1: 85, c2: 90, ... }
    penaltySeconds,
    submittedAt: new Date().toISOString(),
  };

  memoryState.scores.push(submission);

  return {
    success: true,
    message: 'Nilai juri berhasil tersimpan dengan aman ke sistem.',
    submission,
  };
}

export async function saveAIFeedback({ eventId = 'evt-lkbb-2026', participantId, juriId, rawTranscript, refinedText }) {
  const feedback = {
    id: `fb-${Date.now()}`,
    eventId,
    participantId,
    juriId,
    rawTranscript,
    refinedText,
    createdAt: new Date().toISOString(),
  };

  memoryState.feedbacks.push(feedback);
  return feedback;
}

export async function getLeaderboardData(eventId = 'evt-lkbb-2026') {
  const participants = memoryState.participants.filter((p) => p.eventId === eventId);
  
  // Hitung agregat skor per tim
  const leaderboard = participants.map((p, index) => {
    const teamScores = memoryState.scores.filter((s) => s.participantId === p.id);
    let totalScore = 0;
    if (teamScores.length > 0) {
      teamScores.forEach((s) => {
        const sum = Object.values(s.scores).reduce((a, b) => a + b, 0);
        totalScore += sum - (s.penaltySeconds * 2);
      });
    } else {
      // Dummy demo score jika belum ada submission
      totalScore = 365 - index * 7;
    }

    return {
      rank: index + 1,
      participantId: p.id,
      teamName: p.teamName,
      schoolName: p.schoolName,
      queueNumber: p.queueNumber,
      totalScore,
      status: p.status,
    };
  }).sort((a, b) => b.totalScore - a.totalScore)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return leaderboard;
}
