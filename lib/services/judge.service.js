import bcrypt from 'bcryptjs';
import { prisma, withDbFallback, memoryState } from './db-fallback.js';

// -------------------------------------------------------------
// DEWAN JURI (PANEL PENJURIAN) SERVICES
// -------------------------------------------------------------
export const STANDARD_JUDGES_TEMPLATE = [
  {
    name: 'Kolonel (Purn) Bambang S., M.Pd',
    role: 'Ketua Dewan Juri (Juri 1)',
    category: 'PBB Murni',
    specialties: ['PBB Murni', 'Komandan Peleton'],
    institution: 'Purna Paskibra Indonesia (PPI Pusat)',
    pin: '8821',
    status: 'AKTIF',
    email: 'juri1@kompas.id',
  },
  {
    name: 'Mayor Aris Setiawan',
    role: 'Anggota Dewan Juri (Juri 2)',
    category: 'PBB Murni',
    specialties: ['PBB Murni'],
    institution: 'Dispora & Kodam Jaya',
    pin: '4412',
    status: 'AKTIF',
    email: 'juri2@kompas.id',
  },
  {
    name: 'Kapten Kav. Hendra Gunawan',
    role: 'Anggota Dewan Juri (Juri 3)',
    category: 'PBB Murni',
    specialties: ['PBB Murni'],
    institution: 'Pusdiklat Paskibraka Nasional',
    pin: '9120',
    status: 'AKTIF',
    email: 'juri3@kompas.id',
  },
  {
    name: 'Dra. Endang Lestari',
    role: 'Anggota Dewan Juri (Juri 4)',
    category: 'Formasi & Variasi',
    specialties: ['Formasi & Variasi'],
    institution: 'Instruktur Koreografi & Tari Nasional',
    pin: '3318',
    status: 'AKTIF',
    email: 'juri4@kompas.id',
  },
  {
    name: 'Rian Syahputra, S.Sn',
    role: 'Anggota Dewan Juri (Juri 5)',
    category: 'Formasi & Variasi',
    specialties: ['Formasi & Variasi', 'Kerapihan & Kostum'],
    institution: 'Akademi Seni & Budaya Indonesia',
    pin: '7729',
    status: 'AKTIF',
    email: 'juri5@kompas.id',
  },
];

export async function getJudgesList(eventId) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const uEvents = await prisma.userEvent.findMany({
        where: { eventId: targetEventId, role: 'JURI' },
        include: { user: true },
        orderBy: { assignedAt: 'asc' },
      });
      if (uEvents.length === 0) {
        return getJudgesListMemory(targetEventId);
      }
      return uEvents.map((ue, idx) => {
        const mem = memoryState.judges.find(
          (j) => j.id === ue.id || j.userId === ue.userId || j.email === ue.user.email
        );
        return {
          id: ue.id,
          userId: ue.userId,
          name: ue.user.fullName,
          email: ue.user.email,
          role: mem?.role || (idx === 0 ? 'Ketua Dewan Juri (Juri 1)' : `Anggota Dewan Juri (Juri ${idx + 1})`),
          category: mem?.category || (idx < 3 ? 'PBB Murni' : 'Formasi & Variasi'),
          specialties: mem?.specialties || (idx < 3 ? ['PBB Murni'] : ['Formasi & Variasi']),
          institution: mem?.institution || 'Dewan Juri Nasional',
          pin: mem?.pin || ue.user.phone || '8821',
          status: ue.isActive ? 'AKTIF' : 'NONAKTIF',
        };
      });
    },
    async () => {
      return getJudgesListMemory(eventId);
    }
  );
}

function getJudgesListMemory(eventId) {
  let filtered = memoryState.judges.filter(
    (j) => j.eventId === eventId || j.eventId === 'evt-lkbb-2026' || j.eventId === '08007fe4-8f16-4324-b815-2cb8ead844af'
  );
  if (filtered.length === 0) {
    filtered = STANDARD_JUDGES_TEMPLATE.map((tpl, idx) => ({
      id: `juri-${idx + 1}`,
      eventId,
      ...tpl,
    }));
    memoryState.judges.push(...filtered);
  }
  return filtered;
}

export async function createJudge(eventId, { name, role, category, specialties, institution, pin, email, status = 'AKTIF' }) {
  const cleanEmail = email && email.trim() ? email.trim() : `juri.${Date.now()}@kompas.id`;
  const cleanPin = pin && pin.trim() ? pin.trim() : String(Math.floor(1000 + Math.random() * 9000));

  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const user = await prisma.user.upsert({
        where: { email: cleanEmail },
        update: { fullName: name, phone: cleanPin },
        create: {
          email: cleanEmail,
          fullName: name,
          phone: cleanPin,
          passwordHash: bcrypt.hashSync('juri1234', 10),
          globalRole: 'USER',
        },
      });
      const ue = await prisma.userEvent.upsert({
        where: {
          userId_eventId_role: {
            userId: user.id,
            eventId: targetEventId,
            role: 'JURI',
          },
        },
        update: { isActive: status === 'AKTIF' },
        create: {
          userId: user.id,
          eventId: targetEventId,
          role: 'JURI',
          isActive: status === 'AKTIF',
        },
      });

      const judgeRecord = {
        id: ue.id,
        userId: user.id,
        eventId: targetEventId,
        name: name.trim(),
        role: role || 'Anggota Dewan Juri',
        category: category || 'PBB Murni',
        specialties: specialties || [category || 'PBB Murni'],
        institution: institution || 'Dewan Juri Nasional',
        pin: cleanPin,
        email: cleanEmail,
        status: status || 'AKTIF',
      };

      memoryState.judges.push(judgeRecord);
      return judgeRecord;
    },
    async () => {
      const judgeRecord = {
        id: `juri-${Date.now()}`,
        eventId,
        name: name.trim(),
        role: role || 'Anggota Dewan Juri',
        category: category || 'PBB Murni',
        specialties: specialties || [category || 'PBB Murni'],
        institution: institution || 'Dewan Juri Nasional',
        pin: cleanPin,
        email: cleanEmail,
        status: status || 'AKTIF',
      };
      memoryState.judges.push(judgeRecord);
      return judgeRecord;
    }
  );
}

export async function updateJudge(judgeId, updateData) {
  const { name, role, category, specialties, institution, pin, email, status } = updateData;

  return withDbFallback(
    async () => {
      const ue = await prisma.userEvent.findUnique({
        where: { id: judgeId },
        include: { user: true },
      });
      if (ue) {
        if (name || pin || email) {
          await prisma.user.update({
            where: { id: ue.userId },
            data: {
              ...(name && { fullName: name }),
              ...(pin && { phone: pin }),
              ...(email && { email }),
            },
          });
        }
        if (status !== undefined) {
          await prisma.userEvent.update({
            where: { id: judgeId },
            data: { isActive: status === 'AKTIF' },
          });
        }
      }

      const memIdx = memoryState.judges.findIndex((j) => j.id === judgeId || (ue && j.userId === ue.userId));
      if (memIdx !== -1) {
        memoryState.judges[memIdx] = {
          ...memoryState.judges[memIdx],
          ...updateData,
        };
        return memoryState.judges[memIdx];
      }

      return {
        id: judgeId,
        userId: ue?.userId,
        name: name || ue?.user.fullName,
        email: email || ue?.user.email,
        role: role || 'Anggota Dewan Juri',
        category: category || 'PBB Murni',
        specialties: specialties || [category || 'PBB Murni'],
        institution: institution || '',
        pin: pin || ue?.user.phone || '8821',
        status: status || (ue?.isActive ? 'AKTIF' : 'NONAKTIF'),
      };
    },
    async () => {
      const idx = memoryState.judges.findIndex((j) => j.id === judgeId);
      if (idx === -1) throw new Error('Dewan Juri tidak ditemukan.');
      memoryState.judges[idx] = {
        ...memoryState.judges[idx],
        ...updateData,
      };
      return memoryState.judges[idx];
    }
  );
}

export async function deleteJudge(judgeId) {
  return withDbFallback(
    async () => {
      await prisma.userEvent.deleteMany({
        where: { id: judgeId },
      });
      memoryState.judges = memoryState.judges.filter((j) => j.id !== judgeId);
      return { success: true };
    },
    async () => {
      memoryState.judges = memoryState.judges.filter((j) => j.id !== judgeId);
      return { success: true };
    }
  );
}

export async function resetStandardJudges(eventId) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      await prisma.userEvent.deleteMany({
        where: { eventId: targetEventId, role: 'JURI' },
      });
      memoryState.judges = memoryState.judges.filter((j) => j.eventId !== targetEventId);

      const created = [];
      for (let i = 0; i < STANDARD_JUDGES_TEMPLATE.length; i++) {
        const item = STANDARD_JUDGES_TEMPLATE[i];
        const res = await createJudge(targetEventId, item);
        created.push(res);
      }
      return created;
    },
    async () => {
      memoryState.judges = memoryState.judges.filter((j) => j.eventId !== eventId);
      const created = STANDARD_JUDGES_TEMPLATE.map((tpl, idx) => ({
        id: `juri-${Date.now()}-${idx + 1}`,
        eventId,
        ...tpl,
      }));
      memoryState.judges.push(...created);
      return created;
    }
  );
}

export async function verifyJudgePIN(eventId, pin) {
  const judges = await getJudgesList(eventId);
  const found = judges.find((j) => String(j.pin) === String(pin) && j.status === 'AKTIF');
  if (!found) {
    return { success: false, message: 'PIN Dewan Juri tidak valid atau status juri nonaktif.' };
  }
  return { success: true, judge: found };
}
