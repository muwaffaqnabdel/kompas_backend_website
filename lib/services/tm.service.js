import { prisma, withDbFallback, memoryState } from './db-fallback.js';

export const DEFAULT_TM_INFO = {
  platform: 'Zoom Meeting',
  zoomUrl: 'https://zoom.us/j/89241109928?pwd=kompasLKBB2026official',
  meetingId: '892 4110 9928',
  passcode: 'LKBB2026',
  date: '2026-11-14',
  time: '13:30',
  timezone: 'WIB',
  instructions: 'Format nama akun Zoom: [No Urut] - [Nama Sekolah] - [Nama Official/Danton]. Harap memasuki ruang virtual 15 menit sebelum acara dimulai. Setiap kontingen maksimal mengirimkan 2 akun delegasi.',
  isPublished: true,
};

export const DEFAULT_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'Berita_Acara_Hasil_Pengundian_Nomor_Urut_TM.pdf',
    ext: 'pdf',
    size: '2.4 MB',
    uploadedAt: '24 Okt 2026, 09:15 WIB',
    uploader: 'Sekretariat Panitia',
    isPublished: true,
  },
  {
    id: 'doc-2',
    name: 'Tata_Tertib_dan_Petunjuk_Teknis_Final_LKBB.docx',
    ext: 'docx',
    size: '1.2 MB',
    uploadedAt: '24 Okt 2026, 09:30 WIB',
    uploader: 'Sie Perlombaan',
    isPublished: true,
  },
];

export const DEFAULT_SUMMARY_NOTES = `1. Batas waktu tampil peleton maksimal 10 menit (Peluit 1: Mulai panggung, Peluit 2: Peringatan sisa 2 menit, Peluit 3: Waktu habis).
2. Toleransi keterlambatan kehadiran di DP 1 (Cek Dokumen & Fisik) maksimal 5 menit dari jadwal tampil.
3. Seluruh nomor urut undian tampil bersifat final dan mengikat sesuai Berita Acara terlampir.
4. Musik pengiring variasi & formasi wajib diserahkan ke meja operator sound paling lambat saat gladi kotor H-1.
5. Kostum Danton wajib mengenakan PDH resmi pangkalan satuan masing-masing.`;

function getOrCreateMemoryTM(eventId) {
  if (!memoryState.technicalMeetings) {
    memoryState.technicalMeetings = [];
  }
  let tm = memoryState.technicalMeetings.find(
    (item) => item.eventId === eventId || (eventId === 'evt-lkbb-2026' && (item.eventId === 'evt-lkbb-2026' || item.eventId === '08007fe4-8f16-4324-b815-2cb8ead844af'))
  );

  if (!tm) {
    tm = {
      eventId,
      meetingInfo: { ...DEFAULT_TM_INFO },
      documents: [...DEFAULT_DOCUMENTS],
      summaryNotes: DEFAULT_SUMMARY_NOTES,
    };
    memoryState.technicalMeetings.push(tm);
  }
  return tm;
}

export async function getTechnicalMeetingData(eventId = 'evt-lkbb-2026') {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
        include: { technicalMeeting: true },
      });
      const targetEventId = ev ? ev.id : eventId;
      const memTm = getOrCreateMemoryTM(targetEventId);

      if (ev?.technicalMeeting) {
        return {
          eventId: targetEventId,
          meetingInfo: {
            ...memTm.meetingInfo,
            zoomUrl: ev.technicalMeeting.zoomUrl || memTm.meetingInfo.zoomUrl,
            isPublished: ev.technicalMeeting.isPublished ?? memTm.meetingInfo.isPublished,
            date: ev.technicalMeeting.meetingDate
              ? new Date(ev.technicalMeeting.meetingDate).toISOString().split('T')[0]
              : memTm.meetingInfo.date,
          },
          documents: memTm.documents || [],
          summaryNotes: memTm.summaryNotes || '',
        };
      }

      return {
        eventId: targetEventId,
        meetingInfo: memTm.meetingInfo,
        documents: memTm.documents,
        summaryNotes: memTm.summaryNotes,
      };
    },
    async () => {
      const memTm = getOrCreateMemoryTM(eventId);
      return {
        eventId,
        meetingInfo: memTm.meetingInfo,
        documents: memTm.documents,
        summaryNotes: memTm.summaryNotes,
      };
    }
  );
}

export async function saveTechnicalMeetingInfo(eventId, { meetingInfo, summaryNotes }) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;

      let parsedDate = null;
      if (meetingInfo?.date) {
        const timePart = meetingInfo.time ? `T${meetingInfo.time}:00` : 'T00:00:00';
        try {
          parsedDate = new Date(`${meetingInfo.date}${timePart}`);
        } catch {
          parsedDate = null;
        }
      }

      await prisma.technicalMeeting.upsert({
        where: { eventId: targetEventId },
        update: {
          zoomUrl: meetingInfo?.zoomUrl || null,
          meetingDate: parsedDate,
          isPublished: meetingInfo?.isPublished !== false,
        },
        create: {
          eventId: targetEventId,
          zoomUrl: meetingInfo?.zoomUrl || null,
          meetingDate: parsedDate,
          isPublished: meetingInfo?.isPublished !== false,
        },
      });

      const memTm = getOrCreateMemoryTM(targetEventId);
      if (meetingInfo) {
        memTm.meetingInfo = { ...memTm.meetingInfo, ...meetingInfo };
      }
      if (summaryNotes !== undefined) {
        memTm.summaryNotes = summaryNotes;
      }

      return {
        success: true,
        eventId: targetEventId,
        meetingInfo: memTm.meetingInfo,
        summaryNotes: memTm.summaryNotes,
      };
    },
    async () => {
      const memTm = getOrCreateMemoryTM(eventId);
      if (meetingInfo) {
        memTm.meetingInfo = { ...memTm.meetingInfo, ...meetingInfo };
      }
      if (summaryNotes !== undefined) {
        memTm.summaryNotes = summaryNotes;
      }

      return {
        success: true,
        eventId,
        meetingInfo: memTm.meetingInfo,
        summaryNotes: memTm.summaryNotes,
      };
    }
  );
}

export async function addTechnicalMeetingDocument(eventId, documentData) {
  const memTm = getOrCreateMemoryTM(eventId);
  const newDoc = {
    id: documentData.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: documentData.name || 'Dokumen_TM.pdf',
    ext: documentData.ext || 'pdf',
    size: documentData.size || '1.0 MB',
    uploadedAt: documentData.uploadedAt || new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB',
    uploader: documentData.uploader || 'Admin Panitia',
    isPublished: documentData.isPublished !== false,
    fileUrl: documentData.fileUrl || null,
  };

  memTm.documents = [...(memTm.documents || []), newDoc];
  return newDoc;
}

export async function deleteTechnicalMeetingDocument(eventId, docId) {
  const memTm = getOrCreateMemoryTM(eventId);
  const exists = memTm.documents.some((d) => d.id === docId);
  if (!exists) {
    throw new Error('Dokumen Technical Meeting tidak ditemukan.');
  }

  memTm.documents = memTm.documents.filter((d) => d.id !== docId);
  return { success: true, deletedId: docId };
}

