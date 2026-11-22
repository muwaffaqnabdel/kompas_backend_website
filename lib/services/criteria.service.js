import { prisma, withDbFallback, memoryState } from './db-fallback.js';

// -------------------------------------------------------------
// PANITIA CRITERIA / RUBRIK PENILAIAN LENGKAP LKBB
// -------------------------------------------------------------
export const STANDARD_CRITERIA_TEMPLATE = [
  // 1. KATEGORI PBB (8 Aba-Aba Gerakan Baku)
  {
    name: '1. Sikap Sempurna & Berhimpun',
    category: 'PBB',
    orderIndex: 1,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-1', 'juri-2', 'juri-3'],
    description: 'Kerapihan tumit merapat, sudut kaki 45 derajat, dada membusung, pandangan lurus ke depan.',
  },
  {
    name: '2. Penghormatan (Hormat Umum/Pembina)',
    category: 'PBB',
    orderIndex: 2,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-1', 'juri-2', 'juri-3'],
    description: 'Ketepatan sudut 15 derajat, telapak tangan lurus, jari manis menempel pelipis/tutup kepala.',
  },
  {
    name: '3. Lencang Kanan & Setengah Lengan',
    category: 'PBB',
    orderIndex: 3,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-1', 'juri-2', 'juri-3'],
    description: 'Kelurusan saf, banjar, kerapihan kepala menengok serempak 45 derajat.',
  },
  {
    name: '4. Berhitung Saf & Banjar',
    category: 'PBB',
    orderIndex: 4,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-1', 'juri-2', 'juri-3'],
    description: 'Kenyaringan suara, ketepatan memalingkan muka, kesigapan saf terdepan.',
  },
  {
    name: '5. Hadap Kanan & Hadap Kiri',
    category: 'PBB',
    orderIndex: 5,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-1', 'juri-2', 'juri-3'],
    description: 'Ketepatan kaki tumpu, poros tumit, hentakan kaki penutup yang tegas.',
  },
  {
    name: '6. Hadap Serong Kanan & Kiri',
    category: 'PBB',
    orderIndex: 6,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-1', 'juri-2', 'juri-3'],
    description: 'Sudut putaran 45 derajat, ketahanan postur dada tetap tegak.',
  },
  {
    name: '7. Balik Kanan & Jalan di Tempat',
    category: 'PBB',
    orderIndex: 7,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-1', 'juri-2', 'juri-3'],
    description: 'Putaran 180 derajat, keseimbangan tubuh pasukan, keseragaman penutupan kaki.',
  },
  {
    name: '8. Langkah Tegap & Hormat Kanan',
    category: 'PBB',
    orderIndex: 8,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-1', 'juri-2', 'juri-3'],
    description: 'Tempo 120 langkah/menit, panjang langkah 65cm, ayunan tangan 90 derajat.',
  },

  // 2. KATEGORI VARIASI & FORMASI (3 Rubrik)
  {
    name: '9. Variasi Formasi Bentuk Simetris',
    category: 'VARIASI & FORMASI',
    orderIndex: 9,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-4', 'juri-5'],
    description: 'Keseimbangan bentuk geometri, kerapihan perpindahan saf/banjar tanpa tabrakan.',
  },
  {
    name: '10. Tingkat Kesulitan & Kreativitas Gerak',
    category: 'VARIASI & FORMASI',
    orderIndex: 10,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-4', 'juri-5'],
    description: 'Keunikan transisi, dinamika pergantian tempo gerak, keselarasan ketukan visual.',
  },
  {
    name: '11. Keselarasan Tema & Estetika Visual',
    category: 'VARIASI & FORMASI',
    orderIndex: 11,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-4', 'juri-5'],
    description: 'Kesesuaian pesan tema penampilan, keanggunan/kegagahan gerak, kerapihan akhir formasi.',
  },

  // 3. KATEGORI DANTON (2 Rubrik)
  {
    name: '12. Artikulasi, Kenyaringan & Intonasi Vokal',
    category: 'DANTON',
    orderIndex: 12,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-1'],
    description: 'Kejelasan suara aba-aba peringatan dan pelaksanaan, kenyaringan menjangkau seluruh lapangan.',
  },
  {
    name: '13. Sikap, Wibawa & Penguasaan Pasukan',
    category: 'DANTON',
    orderIndex: 13,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-1'],
    description: 'Ketenangan saat memimpin, pandangan mata tegak, presisi aba-aba peringatan dan pelaksanaan.',
  },

  // 4. KATEGORI MAKE UP / KOSTUM (2 Rubrik)
  {
    name: '14. Kerapihan Seragam, Atribut & Tutup Kepala',
    category: 'MAKE UP / KOSTUM',
    orderIndex: 14,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-5'],
    description: 'Kesesuaian pemakaian pet/baret, kelurusan dasi/scarf, pin lencana, sabuk gesper, dan tali peluit.',
  },
  {
    name: '15. Estetika Tata Rias Wajah & Keserasian Pasukan',
    category: 'MAKE UP / KOSTUM',
    orderIndex: 15,
    minScore: 70,
    maxScore: 100,
    intervalStep: 5,
    weight: 1.0,
    isMandatory: true,
    options: [70, 75, 80, 85, 90, 95, 100],
    assignedJudges: ['juri-5'],
    description: 'Keserasian make up panggung, ketahanan rias dari keringat, kebersihan sepatu, dan kerapihan rambut/jilbab.',
  },
];

export async function getCriteriaList(eventId = 'evt-lkbb-2026') {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const dbCriteria = await prisma.scoringCriterion.findMany({
        where: { eventId: targetEventId },
        include: { options: true },
        orderBy: { orderIndex: 'asc' },
      });

      if (!dbCriteria || dbCriteria.length === 0) {
        return getCriteriaListMemory(targetEventId);
      }

      return dbCriteria.map((c) => {
        const mem = memoryState.criteria.find((m) => m.id === c.id || m.name === c.name);
        return {
          id: c.id,
          eventId: c.eventId,
          name: c.name,
          category: mem?.category || 'PBB',
          orderIndex: c.orderIndex,
          minScore: c.minScore,
          maxScore: c.maxScore,
          intervalStep: c.intervalStep,
          weight: c.weight,
          isMandatory: mem?.isMandatory !== false,
          description: mem?.description || '',
          options: c.options && c.options.length > 0 ? c.options.map((o) => o.scoreValue) : (mem?.options || [70, 75, 80, 85, 90, 95, 100]),
          assignedJudges: mem?.assignedJudges || ['juri-1', 'juri-2', 'juri-3'],
        };
      });
    },
    async () => {
      return getCriteriaListMemory(eventId);
    }
  );
}

function getCriteriaListMemory(eventId) {
  let filtered = memoryState.criteria.filter(
    (c) => c.eventId === eventId || (eventId === 'evt-lkbb-2026' && (c.eventId === 'evt-lkbb-2026' || c.eventId === '08007fe4-8f16-4324-b815-2cb8ead844af'))
  );

  if (filtered.length < 5) {
    // Clear and initialize with standard LKBB 15 criteria template
    memoryState.criteria = memoryState.criteria.filter((c) => c.eventId !== eventId);
    filtered = STANDARD_CRITERIA_TEMPLATE.map((tpl, idx) => ({
      id: `c${idx + 1}`,
      eventId,
      ...tpl,
    }));
    memoryState.criteria.push(...filtered);
  }

  return filtered.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
}

export async function createCriterion(eventId, criterionData) {
  const {
    name,
    category = 'PBB',
    minScore = 70,
    maxScore = 100,
    intervalStep = 5,
    weight = 1.0,
    isMandatory = true,
    description = '',
    options = [70, 75, 80, 85, 90, 95, 100],
    assignedJudges = [],
  } = criterionData;

  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const count = await prisma.scoringCriterion.count({ where: { eventId: targetEventId } });
      const orderIndex = count + 1;

      const record = await prisma.scoringCriterion.create({
        data: {
          eventId: targetEventId,
          name: name.trim(),
          orderIndex,
          minScore: parseFloat(minScore) || 70,
          maxScore: parseFloat(maxScore) || 100,
          intervalStep: parseFloat(intervalStep) || 5,
          weight: parseFloat(weight) || 1.0,
          isActive: true,
          options: {
            create: (Array.isArray(options) ? options : [70, 75, 80, 85, 90, 95, 100]).map((val) => ({
              scoreValue: parseFloat(val),
              isCustom: false,
            })),
          },
        },
        include: { options: true },
      });

      const formatted = {
        id: record.id,
        eventId: targetEventId,
        name: record.name,
        category,
        orderIndex: record.orderIndex,
        minScore: record.minScore,
        maxScore: record.maxScore,
        intervalStep: record.intervalStep,
        weight: record.weight,
        isMandatory,
        description,
        options: record.options?.map((o) => o.scoreValue) || options,
        assignedJudges,
      };

      memoryState.criteria.push(formatted);
      return formatted;
    },
    async () => {
      const existing = memoryState.criteria.filter((c) => c.eventId === eventId);
      const newCrit = {
        id: `c-${Date.now()}`,
        eventId,
        name: name.trim(),
        category,
        orderIndex: existing.length + 1,
        minScore: parseFloat(minScore) || 70,
        maxScore: parseFloat(maxScore) || 100,
        intervalStep: parseFloat(intervalStep) || 5,
        weight: parseFloat(weight) || 1.0,
        isMandatory,
        description,
        options: Array.isArray(options) ? options : [70, 75, 80, 85, 90, 95, 100],
        assignedJudges,
      };
      memoryState.criteria.push(newCrit);
      return newCrit;
    }
  );
}

export async function updateCriterion(criterionId, updateData) {
  return withDbFallback(
    async () => {
      const { name, minScore, maxScore, intervalStep, weight } = updateData;
      await prisma.scoringCriterion.updateMany({
        where: { id: criterionId },
        data: {
          ...(name && { name: name.trim() }),
          ...(minScore !== undefined && { minScore: parseFloat(minScore) }),
          ...(maxScore !== undefined && { maxScore: parseFloat(maxScore) }),
          ...(intervalStep !== undefined && { intervalStep: parseFloat(intervalStep) }),
          ...(weight !== undefined && { weight: parseFloat(weight) }),
        },
      });

      const memIdx = memoryState.criteria.findIndex((c) => c.id === criterionId);
      if (memIdx !== -1) {
        memoryState.criteria[memIdx] = {
          ...memoryState.criteria[memIdx],
          ...updateData,
        };
        return memoryState.criteria[memIdx];
      }

      return {
        id: criterionId,
        ...updateData,
      };
    },
    async () => {
      const idx = memoryState.criteria.findIndex((c) => c.id === criterionId);
      if (idx === -1) throw new Error('Kriteria penilaian tidak ditemukan.');
      memoryState.criteria[idx] = {
        ...memoryState.criteria[idx],
        ...updateData,
      };
      return memoryState.criteria[idx];
    }
  );
}

export async function deleteCriterion(criterionId) {
  return withDbFallback(
    async () => {
      await prisma.scoringCriterion.deleteMany({
        where: { id: criterionId },
      });
      memoryState.criteria = memoryState.criteria.filter((c) => c.id !== criterionId);
      memoryState.criteria.forEach((c, idx) => {
        c.orderIndex = idx + 1;
      });
      return { success: true };
    },
    async () => {
      memoryState.criteria = memoryState.criteria.filter((c) => c.id !== criterionId);
      memoryState.criteria.forEach((c, idx) => {
        c.orderIndex = idx + 1;
      });
      return { success: true };
    }
  );
}

export async function saveAllCriteria(eventId, criteriaList) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;

      // Update in-memory state
      memoryState.criteria = memoryState.criteria.filter((c) => c.eventId !== targetEventId);
      const updatedList = criteriaList.map((c, idx) => ({
        ...c,
        eventId: targetEventId,
        orderIndex: idx + 1,
      }));
      memoryState.criteria.push(...updatedList);

      return updatedList;
    },
    async () => {
      memoryState.criteria = memoryState.criteria.filter((c) => c.eventId !== eventId);
      const updatedList = criteriaList.map((c, idx) => ({
        ...c,
        eventId,
        orderIndex: idx + 1,
      }));
      memoryState.criteria.push(...updatedList);
      return updatedList;
    }
  );
}

export async function resetStandardCriteria(eventId) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;

      await prisma.scoringCriterion.deleteMany({
        where: { eventId: targetEventId },
      });
      memoryState.criteria = memoryState.criteria.filter((c) => c.eventId !== targetEventId);

      const created = [];
      for (let i = 0; i < STANDARD_CRITERIA_TEMPLATE.length; i++) {
        const item = STANDARD_CRITERIA_TEMPLATE[i];
        const res = await createCriterion(targetEventId, item);
        created.push(res);
      }
      return created;
    },
    async () => {
      memoryState.criteria = memoryState.criteria.filter((c) => c.eventId !== eventId);
      const created = STANDARD_CRITERIA_TEMPLATE.map((tpl, idx) => ({
        id: `c${idx + 1}`,
        eventId,
        ...tpl,
      }));
      memoryState.criteria.push(...created);
      return created;
    }
  );
}

export async function toggleScoringLock(eventId, isLocked) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;

      await prisma.event.updateMany({
        where: { id: targetEventId },
        data: { scoringLocked: !!isLocked },
      });

      const memEv = memoryState.events.find((e) => e.id === targetEventId || e.slug === targetEventId);
      if (memEv) memEv.scoringLocked = !!isLocked;

      return { success: true, scoringLocked: !!isLocked };
    },
    async () => {
      const memEv = memoryState.events.find((e) => e.id === eventId || e.slug === eventId);
      if (memEv) memEv.scoringLocked = !!isLocked;
      return { success: true, scoringLocked: !!isLocked };
    }
  );
}