import bcrypt from 'bcryptjs';
import { prisma, withDbFallback, memoryState } from './db-fallback.js';

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
// POS DP MANAGEMENT & OPERATOR STAFF SERVICES
// -------------------------------------------------------------
export async function getDecisionPointsList(eventId) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const dps = await prisma.decisionPoint.findMany({
        where: { eventId: targetEventId },
        orderBy: { orderIndex: 'asc' },
      });
      return dps;
    },
    async () => {
      let filtered = memoryState.decisionPoints.filter(
        (dp) => dp.eventId === eventId || dp.eventId === '08007fe4-8f16-4324-b815-2cb8ead844af'
      );
      if (filtered.length === 0) {
        filtered = [
          { id: 1, eventId, orderIndex: 1, code: 'DOC_CHECK', name: 'DP 1 — Pengecekan Dokumen dan Berkas', sop: 'Verifikasi berkas fisik kontingen, surat mandat, kartu tanda pelajar sah, dan pemeriksaan daftar nama anggota peleton.', capacityLimit: 1, isActive: true },
          { id: 2, eventId, orderIndex: 2, code: 'PHOTOSHOOT', name: 'DP 2 — Photoshoot Pasukan', sop: 'Sesi dokumentasi foto resmi peleton lengkap di backdrop resmi dan pemeriksaan kesesuaian nomor dada/atribut.', capacityLimit: 1, isActive: true },
          { id: 3, eventId, orderIndex: 3, code: 'FINAL_PREP', name: 'DP 3 — Daerah Persiapan dan Pemanasan', sop: 'Peregangan, pemanasan langkah perlahan, sinkronisasi aba-aba komandan peleton, dan persiapan memasuki panggung.', capacityLimit: 1, isActive: true },
          { id: 4, eventId, orderIndex: 4, code: 'STAGE_PERFORMANCE', name: 'DP 4 — Panggung Utama', sop: 'Peleton tampil di arena pertandingan dinilai langsung oleh Dewan Juri secara real-time.', capacityLimit: 1, isActive: true },
        ];
        memoryState.decisionPoints.push(...filtered);
      }
      return filtered.sort((a, b) => a.orderIndex - b.orderIndex);
    }
  );
}

export async function saveDecisionPointsList(eventId, dpsList) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      await prisma.decisionPoint.deleteMany({ where: { eventId: targetEventId } });
      const created = await Promise.all(
        dpsList.map((dp, idx) =>
          prisma.decisionPoint.create({
            data: {
              eventId: targetEventId,
              orderIndex: idx + 1,
              code: dp.code || (dp.name?.toLowerCase().includes('dokumen') ? 'DOC_CHECK' : dp.name?.toLowerCase().includes('photo') ? 'PHOTOSHOOT' : dp.name?.toLowerCase().includes('persiapan') ? 'FINAL_PREP' : 'STAGE_PERFORMANCE'),
              name: dp.name,
              capacityLimit: 1,
              isActive: true,
            },
          })
        )
      );
      return created;
    },
    async () => {
      memoryState.decisionPoints = memoryState.decisionPoints.filter((dp) => dp.eventId !== eventId);
      const newDps = dpsList.map((dp, idx) => ({
        id: dp.id || idx + 1,
        eventId,
        orderIndex: idx + 1,
        code: dp.code || (dp.name?.toLowerCase().includes('dokumen') ? 'DOC_CHECK' : dp.name?.toLowerCase().includes('photo') ? 'PHOTOSHOOT' : dp.name?.toLowerCase().includes('persiapan') ? 'FINAL_PREP' : 'STAGE_PERFORMANCE'),
        name: dp.name,
        sop: dp.sop || 'SOP Pos Operasional',
        capacityLimit: 1,
        isActive: true,
      }));
      memoryState.decisionPoints.push(...newDps);
      return newDps;
    }
  );
}

export async function getDPStaffList(eventId) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const uEvents = await prisma.userEvent.findMany({
        where: { eventId: targetEventId, role: 'PANITIA_DP', isActive: true },
        include: { user: true, assignedDp: true },
      });
      return uEvents.map((ue) => ({
        id: ue.id,
        userId: ue.userId,
        name: ue.user.fullName,
        email: ue.user.email,
        assignedDpId: ue.assignedDpId ? (isNaN(Number(ue.assignedDpId)) ? ue.assignedDpId : Number(ue.assignedDpId)) : 1,
        status: ue.isActive ? 'AKTIF' : 'NONAKTIF',
      }));
    },
    async () => {
      let filtered = memoryState.dpStaff.filter((s) => s.eventId === eventId || s.eventId === 'evt-lkbb-2026');
      return filtered;
    }
  );
}

export async function createDPStaff(eventId, { name, email, assignedDpId, password = 'password123' }) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const user = await prisma.user.upsert({
        where: { email },
        update: { fullName: name },
        create: {
          email,
          fullName: name,
          passwordHash: bcrypt.hashSync(password, 10),
          globalRole: 'USER',
        },
      });
      const ue = await prisma.userEvent.upsert({
        where: {
          userId_eventId_role: {
            userId: user.id,
            eventId: targetEventId,
            role: 'PANITIA_DP',
          },
        },
        update: { assignedDpId: String(assignedDpId), isActive: true },
        create: {
          userId: user.id,
          eventId: targetEventId,
          role: 'PANITIA_DP',
          assignedDpId: String(assignedDpId),
          isActive: true,
        },
      });
      const cleanAssignedId = assignedDpId ? (isNaN(Number(assignedDpId)) ? String(assignedDpId) : Number(assignedDpId)) : 1;
      return { id: ue.id, name, email, assignedDpId: cleanAssignedId, status: 'AKTIF' };
    },
    async () => {
      const cleanAssignedId = assignedDpId ? (isNaN(Number(assignedDpId)) ? String(assignedDpId) : Number(assignedDpId)) : 1;
      const newStaff = {
        id: `staff-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        assignedDpId: cleanAssignedId,
        eventId,
        status: 'AKTIF',
      };
      memoryState.dpStaff.push(newStaff);
      return newStaff;
    }
  );
}

export async function updateDPStaff(staffId, { name, email, assignedDpId, status }) {
  return withDbFallback(
    async () => {
      const ue = await prisma.userEvent.findUnique({
        where: { id: staffId },
        include: { user: true },
      });
      if (ue) {
        if (name || email) {
          await prisma.user.update({
            where: { id: ue.userId },
            data: {
              ...(name && { fullName: name }),
              ...(email && { email }),
            },
          });
        }
        const updatedUe = await prisma.userEvent.update({
          where: { id: staffId },
          data: {
            ...(assignedDpId !== undefined && { assignedDpId: String(assignedDpId) }),
            ...(status !== undefined && { isActive: status === 'AKTIF' }),
          },
        });
        const rawAssignedId = assignedDpId !== undefined ? assignedDpId : ue.assignedDpId;
        const cleanAssignedId = rawAssignedId ? (isNaN(Number(rawAssignedId)) ? String(rawAssignedId) : Number(rawAssignedId)) : 1;
        return {
          id: staffId,
          name: name || ue.user.fullName,
          email: email || ue.user.email,
          assignedDpId: cleanAssignedId,
          status: status || (updatedUe.isActive ? 'AKTIF' : 'NONAKTIF'),
        };
      }
      throw new Error('Petugas tidak ditemukan.');
    },
    async () => {
      const idx = memoryState.dpStaff.findIndex((s) => s.id === staffId);
      if (idx === -1) throw new Error('Petugas tidak ditemukan.');
      const cleanAssignedId = assignedDpId !== undefined ? (isNaN(Number(assignedDpId)) ? String(assignedDpId) : Number(assignedDpId)) : undefined;
      memoryState.dpStaff[idx] = {
        ...memoryState.dpStaff[idx],
        ...(name && { name }),
        ...(email && { email }),
        ...(cleanAssignedId !== undefined && { assignedDpId: cleanAssignedId }),
        ...(status && { status }),
      };
      return memoryState.dpStaff[idx];
    }
  );
}

export async function deleteDPStaff(staffId) {
  return withDbFallback(
    async () => {
      await prisma.userEvent.delete({ where: { id: staffId } });
      return { success: true, id: staffId };
    },
    async () => {
      const idx = memoryState.dpStaff.findIndex((s) => s.id === staffId);
      if (idx === -1) throw new Error('Petugas tidak ditemukan.');
      const removed = memoryState.dpStaff.splice(idx, 1);
      return { success: true, deleted: removed[0] };
    }
  );
}

// -------------------------------------------------------------
// KHUSUS POS PENGECEKAN DOKUMEN (DOC_CHECK)
// Siapapun petugas yang ditugaskan di Pos Dokumen ini melihat semua berkas peserta event
// -------------------------------------------------------------
export async function getDocCheckParticipants(eventId = 'evt-lkbb-2026') {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const participants = await prisma.participant.findMany({
        where: { eventId: targetEventId },
        include: {
          documents: true,
          members: true,
        },
        orderBy: { queueNumber: 'asc' },
      });
      return participants;
    },
    async () => {
      const participants = memoryState.participants.filter(
        (p) => p.eventId === eventId || p.eventId === 'evt-lkbb-2026'
      );
      return participants.map((p) => ({
        id: p.id,
        teamName: p.teamName,
        schoolName: p.schoolName,
        queueNumber: p.queueNumber,
        scheduledTime: p.scheduledTime,
        status: p.status,
        currentDpId: p.currentDpId,
        dpStatus: p.dpStatus,
        docs: p.docs,
        revisionNote: p.revisionNote,
        documents: [
          {
            id: 'doc-1',
            title: 'File Kartu Pelajar (Kolektif Anggota)',
            fileName: p.docs?.kartuPelajar?.name || '16_Kartu_Pelajar_Pasukan.pdf',
            status: p.docs?.kartuPelajar?.status === 'VALIDATED' ? 'VERIFIED' : p.docs?.kartuPelajar?.status === 'REVISION' ? 'REVISION' : 'VERIFIED',
            size: '3.4 MB',
          },
          {
            id: 'doc-2',
            title: 'File Surat Rekomendasi / Pengantar Sekolah',
            fileName: p.docs?.suratTugas?.name || 'Surat_Tugas_Kepsek_SMAN1.pdf',
            status: p.docs?.suratTugas?.status === 'VALIDATED' ? 'VERIFIED' : 'VERIFIED',
            size: '1.2 MB',
          },
          {
            id: 'doc-3',
            title: 'Formulir Pendaftaran & Pakta Integritas Kontingen',
            fileName: p.docs?.suratDokter?.name || 'Formulir_Pakta_Integritas.pdf',
            status: p.docs?.suratDokter?.status === 'REVISION' ? 'REVISION' : 'VERIFIED',
            size: '840 KB',
            note: p.revisionNote || '',
          },
        ],
      }));
    }
  );
}
