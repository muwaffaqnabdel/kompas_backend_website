import { prisma, withDbFallback, memoryState } from './db-fallback.js';

// -------------------------------------------------------------
// SUPER ADMIN SERVICES
// -------------------------------------------------------------
export async function getSuperAdminOverviewData() {
  return withDbFallback(
    async () => {
      const [totalEvents, totalUsers, totalParticipants, auditLogsRaw] = await Promise.all([
        prisma.event.count(),
        prisma.user.count(),
        prisma.participant.count(),
        prisma.auditLog.findMany({
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { fullName: true, email: true, globalRole: true } },
            event: { select: { name: true, slug: true } },
          },
        }),
      ]);
      const events = await prisma.event.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          decisionPoints: { orderBy: { orderIndex: 'asc' } },
          _count: { select: { participants: true } },
        },
      });

      const auditLogs = auditLogsRaw.map((log) => ({
        id: log.id,
        timestamp: log.createdAt,
        actor: log.user?.fullName || 'Super Admin',
        role: log.user?.globalRole || 'SUPER_ADMIN',
        action: log.action,
        target: log.event?.name || log.resource,
        payload: log.payload,
      }));

      return {
        stats: {
          totalEvents,
          totalUsers,
          totalParticipants,
          systemStatus: 'ONLINE_HEALTHY',
          databaseEngine: 'Supabase PostgreSQL',
        },
        events,
        auditLogs,
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
