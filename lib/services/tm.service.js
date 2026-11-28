import { prisma, withDbFallback, memoryState } from './db-fallback.js';
import { deletePesertaStorageFile } from '../supabase.js';

function parseStoredPayload(notulenUrl) {
  if (!notulenUrl) {
    return { meta: {}, summaryNotes: '', documents: [] };
  }
  try {
    const parsed = JSON.parse(notulenUrl);
    if (Array.isArray(parsed)) {
      return { meta: {}, summaryNotes: '', documents: parsed };
    }
    if (parsed && typeof parsed === 'object') {
      return {
        meta: parsed.meta && typeof parsed.meta === 'object' ? parsed.meta : {},
        summaryNotes: typeof parsed.summaryNotes === 'string' ? parsed.summaryNotes : '',
        documents: Array.isArray(parsed.documents) ? parsed.documents : [],
      };
    }
  } catch {
    // Jika plain text URL tunggal
    return {
      meta: {},
      summaryNotes: '',
      documents: [
        {
          id: 'doc-legacy-notulen',
          name: 'Notulen_Technical_Meeting.pdf',
          ext: 'pdf',
          size: '-',
          fileUrl: notulenUrl,
          isPublished: true,
        },
      ],
    };
  }
  return { meta: {}, summaryNotes: '', documents: [] };
}

function serializeStoredPayload({ meta = {}, summaryNotes = '', documents = [] }) {
  return JSON.stringify({
    version: 2,
    meta: {
      platform: meta.platform || 'Zoom Meeting',
      meetingId: meta.meetingId || '',
      passcode: meta.passcode || '',
      time: meta.time || '',
      timezone: meta.timezone || 'WIB',
      instructions: meta.instructions || '',
    },
    summaryNotes: String(summaryNotes || ''),
    documents: Array.isArray(documents) ? documents : [],
  });
}

function formatDateYMD(dateVal) {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export async function getTechnicalMeetingData(eventId) {
  return withDbFallback(
    async () => {
      if (!eventId) {
        return { exists: false, eventId: null, meetingInfo: null, documents: [], summaryNotes: '' };
      }

      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
        include: { technicalMeeting: true },
      });

      if (!ev) {
        return { exists: false, eventId, meetingInfo: null, documents: [], summaryNotes: '' };
      }

      const tm = ev.technicalMeeting;
      if (!tm) {
        return {
          exists: false,
          eventId: ev.id,
          eventName: ev.name,
          meetingInfo: null,
          documents: [],
          summaryNotes: '',
        };
      }

      const stored = parseStoredPayload(tm.notulenUrl);
      const dateStr = formatDateYMD(tm.meetingDate);

      return {
        exists: true,
        eventId: ev.id,
        eventName: ev.name,
        meetingInfo: {
          platform: stored.meta.platform || 'Zoom Meeting',
          zoomUrl: tm.zoomUrl || '',
          meetingId: stored.meta.meetingId || '',
          passcode: stored.meta.passcode || '',
          date: dateStr,
          time: stored.meta.time || '',
          timezone: stored.meta.timezone || 'WIB',
          instructions: stored.meta.instructions || '',
          isPublished: Boolean(tm.isPublished),
        },
        documents: stored.documents,
        summaryNotes: stored.summaryNotes,
      };
    },
    async () => {
      const mem = (memoryState.technicalMeetings || []).find((m) => m.eventId === eventId);
      if (!mem) {
        return { exists: false, eventId, meetingInfo: null, documents: [], summaryNotes: '' };
      }
      return { exists: true, ...mem };
    }
  );
}

export async function saveTechnicalMeetingInfo(eventId, { meetingInfo = {}, summaryNotes }) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
        include: { technicalMeeting: true },
      });
      if (!ev) {
        throw new Error('Event tidak ditemukan di database.');
      }

      const existingStored = parseStoredPayload(ev.technicalMeeting?.notulenUrl);

      let parsedDate = ev.technicalMeeting?.meetingDate || null;
      if (meetingInfo?.date !== undefined) {
        if (!meetingInfo.date) {
          parsedDate = null;
        } else {
          const cleanTime =
            meetingInfo.time && /^\d{1,2}:\d{2}$/.test(String(meetingInfo.time).trim())
              ? String(meetingInfo.time).trim()
              : '00:00';
          const candidate = new Date(`${meetingInfo.date}T${cleanTime}:00`);
          parsedDate = Number.isNaN(candidate.getTime()) ? null : candidate;
        }
      }

      const nextMeta = {
        platform: meetingInfo?.platform ?? existingStored.meta.platform ?? 'Zoom Meeting',
        meetingId: meetingInfo?.meetingId ?? existingStored.meta.meetingId ?? '',
        passcode: meetingInfo?.passcode ?? existingStored.meta.passcode ?? '',
        time: meetingInfo?.time ?? existingStored.meta.time ?? '',
        timezone: meetingInfo?.timezone ?? existingStored.meta.timezone ?? 'WIB',
        instructions: meetingInfo?.instructions ?? existingStored.meta.instructions ?? '',
      };

      const nextNotes =
        summaryNotes !== undefined ? String(summaryNotes || '') : existingStored.summaryNotes;

      const serialized = serializeStoredPayload({
        meta: nextMeta,
        summaryNotes: nextNotes,
        documents: existingStored.documents,
      });

      const nextZoomUrl =
        meetingInfo?.zoomUrl !== undefined
          ? String(meetingInfo.zoomUrl || '').trim() || null
          : ev.technicalMeeting?.zoomUrl || null;

      const nextPublished =
        meetingInfo?.isPublished !== undefined
          ? Boolean(meetingInfo.isPublished)
          : ev.technicalMeeting?.isPublished ?? true;

      await prisma.technicalMeeting.upsert({
        where: { eventId: ev.id },
        update: {
          zoomUrl: nextZoomUrl,
          meetingDate: parsedDate,
          isPublished: nextPublished,
          notulenUrl: serialized,
        },
        create: {
          eventId: ev.id,
          zoomUrl: nextZoomUrl,
          meetingDate: parsedDate,
          isPublished: nextPublished,
          notulenUrl: serialized,
        },
      });

      return getTechnicalMeetingData(ev.id);
    },
    async () => {
      if (!memoryState.technicalMeetings) memoryState.technicalMeetings = [];
      let mem = memoryState.technicalMeetings.find((m) => m.eventId === eventId);
      if (!mem) {
        mem = { eventId, meetingInfo: {}, documents: [], summaryNotes: '' };
        memoryState.technicalMeetings.push(mem);
      }
      mem.meetingInfo = { ...mem.meetingInfo, ...meetingInfo };
      if (summaryNotes !== undefined) mem.summaryNotes = summaryNotes;
      return { exists: true, ...mem };
    }
  );
}

export async function addTechnicalMeetingDocument(eventId, documentData) {
  const newDoc = {
    id: documentData.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: documentData.name || 'Dokumen_TM.pdf',
    ext: documentData.ext || 'pdf',
    size: documentData.size || '-',
    uploadedAt:
      documentData.uploadedAt ||
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB',
    uploader: documentData.uploader || 'Admin Panitia',
    isPublished: documentData.isPublished !== false,
    fileUrl: documentData.fileUrl || null,
    storagePath: documentData.storagePath || null,
  };

  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
        include: { technicalMeeting: true },
      });
      if (!ev) throw new Error('Event tidak ditemukan di database.');

      const existingStored = parseStoredPayload(ev.technicalMeeting?.notulenUrl);
      const updatedDocs = [...existingStored.documents, newDoc];
      const serialized = serializeStoredPayload({
        meta: existingStored.meta,
        summaryNotes: existingStored.summaryNotes,
        documents: updatedDocs,
      });

      await prisma.technicalMeeting.upsert({
        where: { eventId: ev.id },
        update: { notulenUrl: serialized },
        create: {
          eventId: ev.id,
          notulenUrl: serialized,
          isPublished: true,
        },
      });

      return newDoc;
    },
    async () => {
      if (!memoryState.technicalMeetings) memoryState.technicalMeetings = [];
      let mem = memoryState.technicalMeetings.find((m) => m.eventId === eventId);
      if (!mem) {
        mem = { eventId, meetingInfo: {}, documents: [], summaryNotes: '' };
        memoryState.technicalMeetings.push(mem);
      }
      mem.documents = [...(mem.documents || []), newDoc];
      return newDoc;
    }
  );
}

export async function deleteTechnicalMeetingDocument(eventId, docId) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
        include: { technicalMeeting: true },
      });
      if (!ev || !ev.technicalMeeting) {
        throw new Error('Dokumen Technical Meeting tidak ditemukan.');
      }

      const existingStored = parseStoredPayload(ev.technicalMeeting.notulenUrl);
      const targetDoc = existingStored.documents.find((d) => d.id === docId);
      if (!targetDoc) {
        throw new Error('Dokumen Technical Meeting tidak ditemukan.');
      }

      const updatedDocs = existingStored.documents.filter((d) => d.id !== docId);
      const serialized = serializeStoredPayload({
        meta: existingStored.meta,
        summaryNotes: existingStored.summaryNotes,
        documents: updatedDocs,
      });

      await prisma.technicalMeeting.update({
        where: { eventId: ev.id },
        data: { notulenUrl: serialized },
      });

      if (targetDoc.storagePath) {
        await deletePesertaStorageFile(targetDoc.storagePath);
      }

      return { success: true, deletedId: docId };
    },
    async () => {
      const mem = (memoryState.technicalMeetings || []).find((m) => m.eventId === eventId);
      if (!mem) throw new Error('Dokumen Technical Meeting tidak ditemukan.');
      mem.documents = (mem.documents || []).filter((d) => d.id !== docId);
      return { success: true, deletedId: docId };
    }
  );
}
