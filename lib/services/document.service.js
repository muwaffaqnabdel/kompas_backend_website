import { prisma, withDbFallback, memoryState } from './db-fallback.js';

// -------------------------------------------------------------
// EVENT DOCUMENT REQUIREMENTS (KONFIGURASI PERSYARATAN BERKAS)
// -------------------------------------------------------------
export async function getDocumentRequirements(eventId) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const reqs = await prisma.eventDocumentRequirement.findMany({
        where: { eventId: targetEventId },
        orderBy: { orderIndex: 'asc' },
      });
      return reqs;
    },
    async () => {
      let filtered = memoryState.documentRequirements.filter(
        (r) => r.eventId === eventId || r.eventId === 'evt-lkbb-2026'
      );
      if (filtered.length === 0) {
        filtered = [
          {
            id: `req-${Date.now()}-1`,
            eventId,
            title: 'File Kartu Pelajar (Kolektif Anggota)',
            description: 'Scan kartu pelajar resmi dari seluruh 16 anggota pasukan dalam 1 file PDF atau Word.',
            isRequired: true,
            allowedFormats: 'PDF, DOC, DOCX',
            maxSizeMb: 10,
            templateUrl: null,
            templateName: null,
            orderIndex: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: `req-${Date.now()}-2`,
            eventId,
            title: 'File Surat Rekomendasi / Pengantar Sekolah',
            description: 'Surat tugas dan rekomendasi resmi dari Kepala Sekolah berstempel basah.',
            isRequired: true,
            allowedFormats: 'PDF, DOC, DOCX',
            maxSizeMb: 10,
            templateUrl: null,
            templateName: null,
            orderIndex: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: `req-${Date.now()}-3`,
            eventId,
            title: 'Formulir Pendaftaran & Pakta Integritas Kontingen',
            description: 'Formulir biodata kontingen lengkap dan pakta integritas bermeterai 10.000.',
            isRequired: true,
            allowedFormats: 'PDF, DOC, DOCX',
            maxSizeMb: 10,
            templateUrl: '/templates/Formulir_Pendaftaran_Pakta_Integritas_2026.docx',
            templateName: 'Formulir_Pendaftaran_Pakta_Integritas_2026.docx',
            orderIndex: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        memoryState.documentRequirements.push(...filtered);
      }
      return filtered.sort((a, b) => a.orderIndex - b.orderIndex);
    }
  );
}

export async function createDocumentRequirement(data) {
  const { eventId, title, description, isRequired = true, allowedFormats = 'PDF, DOC, DOCX', maxSizeMb = 10, templateUrl = null, templateName = null } = data;
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const count = await prisma.eventDocumentRequirement.count({
        where: { eventId: targetEventId },
      });
      const created = await prisma.eventDocumentRequirement.create({
        data: {
          eventId: targetEventId,
          title,
          description: description || null,
          isRequired: Boolean(isRequired),
          allowedFormats: allowedFormats || 'PDF, DOC, DOCX',
          maxSizeMb: Number(maxSizeMb) || 10,
          templateUrl: templateUrl || null,
          templateName: templateName || null,
          orderIndex: count + 1,
        },
      });
      return created;
    },
    async () => {
      const eventReqs = memoryState.documentRequirements.filter((r) => r.eventId === eventId);
      const newReq = {
        id: `req-${Date.now()}`,
        eventId,
        title,
        description: description || '',
        isRequired: Boolean(isRequired),
        allowedFormats: allowedFormats || 'PDF, DOC, DOCX',
        maxSizeMb: Number(maxSizeMb) || 10,
        templateUrl: templateUrl || null,
        templateName: templateName || null,
        orderIndex: eventReqs.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryState.documentRequirements.push(newReq);
      return newReq;
    }
  );
}

export async function updateDocumentRequirement(id, updateData) {
  return withDbFallback(
    async () => {
      const updated = await prisma.eventDocumentRequirement.update({
        where: { id },
        data: {
          ...(updateData.title !== undefined && { title: updateData.title }),
          ...(updateData.description !== undefined && { description: updateData.description }),
          ...(updateData.isRequired !== undefined && { isRequired: Boolean(updateData.isRequired) }),
          ...(updateData.allowedFormats !== undefined && { allowedFormats: updateData.allowedFormats }),
          ...(updateData.maxSizeMb !== undefined && { maxSizeMb: Number(updateData.maxSizeMb) }),
          ...(updateData.templateUrl !== undefined && { templateUrl: updateData.templateUrl }),
          ...(updateData.templateName !== undefined && { templateName: updateData.templateName }),
          ...(updateData.orderIndex !== undefined && { orderIndex: Number(updateData.orderIndex) }),
        },
      });
      return updated;
    },
    async () => {
      const idx = memoryState.documentRequirements.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Persyaratan berkas tidak ditemukan.');
      memoryState.documentRequirements[idx] = {
        ...memoryState.documentRequirements[idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      return memoryState.documentRequirements[idx];
    }
  );
}

export async function deleteDocumentRequirement(id) {
  return withDbFallback(
    async () => {
      const deleted = await prisma.eventDocumentRequirement.delete({
        where: { id },
      });
      return { success: true, deleted };
    },
    async () => {
      const idx = memoryState.documentRequirements.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Persyaratan berkas tidak ditemukan.');
      const removed = memoryState.documentRequirements.splice(idx, 1);
      return { success: true, deleted: removed[0] };
    }
  );
}
