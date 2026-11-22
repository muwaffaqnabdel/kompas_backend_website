import bcrypt from 'bcryptjs';
import { prisma, withDbFallback, memoryState } from './db-fallback.js';

// -------------------------------------------------------------
// EVENT SERVICES
// -------------------------------------------------------------
export async function getEventsList() {
  return withDbFallback(
    async () => {
      const events = await prisma.event.findMany({
        orderBy: { eventDate: 'asc' },
        include: {
          decisionPoints: true,
          criteria: true,
          participants: {
            select: {
              id: true,
              teamName: true,
              schoolName: true,
              category: true,
              queueNumber: true,
              status: true,
              documents: {
                select: { id: true, docType: true, status: true, fileUrl: true },
              },
            },
          },
          userEvents: {
            where: { role: 'ADMIN_PANITIA', isActive: true },
            include: { user: true },
          },
          _count: { select: { participants: true } },
        },
      });

      return events.map((ev) => {
        const adminUserEvent = ev.userEvents?.[0];
        const participantsList = ev.participants || [];
        const validatedCount = participantsList.filter((p) => p.status === 'VALIDATED').length;
        const pendingCount = participantsList.filter((p) => p.status === 'SUBMITTED' || p.status === 'PENDING_REVIEW').length;
        const incompleteCount = participantsList.filter((p) => p.status === 'DRAFT' || p.status === 'NEED_REVISION').length;
        const totalParticipants = ev._count?.participants || participantsList.length || 0;

        let readinessScore = 0;
        if (adminUserEvent) readinessScore += 25;
        if (ev.decisionPoints?.length >= 4) readinessScore += 25;
        if (ev.criteria?.length >= 1) readinessScore += 25;
        if (ev.dpFlowLocked || ev.scoringLocked) readinessScore += 25;

        let alertStatus = 'NORMAL';
        let alertMessage = 'Sistem Siap';
        if (!adminUserEvent) {
          alertStatus = 'CRITICAL';
          alertMessage = 'Belum Ada Pengelola';
        } else if (!ev.dpFlowLocked && ev.status === 'LIVE') {
          alertStatus = 'WARNING';
          alertMessage = 'Flow DP Belum Dikunci';
        }

        return {
          ...ev,
          adminPanitia: adminUserEvent?.user
            ? {
                id: adminUserEvent.user.id,
                fullName: adminUserEvent.user.fullName,
                email: adminUserEvent.user.email,
              }
            : null,
          validatedParticipantsCount: validatedCount,
          pendingParticipantsCount: pendingCount,
          incompleteParticipantsCount: incompleteCount,
          totalParticipantsCount: totalParticipants,
          readinessScore,
          alertStatus,
          alertMessage,
        };
      });
    },
    async () => {
      return memoryState.events.map((e) => {
        const assignedAdminUE = memoryState.userEvents.find(
          (ue) => ue.eventId === e.id && ue.role === 'ADMIN_PANITIA' && ue.isActive
        );
        const adminUser = assignedAdminUE
          ? memoryState.users.find((u) => u.id === assignedAdminUE.userId)
          : null;
        const eventParticipants = memoryState.participants.filter((p) => p.eventId === e.id);
        const validatedCount = eventParticipants.filter((p) => p.status === 'VALIDATED').length;

        let readinessScore = 0;
        if (adminUser) readinessScore += 25;
        if (memoryState.decisionPoints.filter((dp) => dp.eventId === e.id).length >= 4) readinessScore += 25;
        if (memoryState.criteria.filter((c) => c.eventId === e.id).length >= 1) readinessScore += 25;
        if (e.dpFlowLocked || e.scoringLocked) readinessScore += 25;

        let alertStatus = 'NORMAL';
        let alertMessage = 'Sistem Siap';
        if (!adminUser) {
          alertStatus = 'CRITICAL';
          alertMessage = 'Belum Ada Pengelola';
        } else if (!e.dpFlowLocked && e.status === 'LIVE') {
          alertStatus = 'WARNING';
          alertMessage = 'Flow DP Belum Dikunci';
        }

        return {
          ...e,
          adminPanitia: adminUser
            ? {
                id: adminUser.id,
                fullName: adminUser.fullName,
                email: adminUser.email,
              }
            : null,
          decisionPoints: memoryState.decisionPoints.filter((dp) => dp.eventId === e.id),
          validatedParticipantsCount: validatedCount,
          totalParticipantsCount: eventParticipants.length,
          readinessScore,
          alertStatus,
          alertMessage,
          _count: {
            participants: eventParticipants.length,
          },
        };
      });
    }
  );
}

export async function getPanitiaEventDetail(identifier = null) {
  return withDbFallback(
    async () => {
      let whereClause = {};
      if (identifier) {
        whereClause = { OR: [{ id: identifier }, { slug: identifier }] };
      }

      const ev = await prisma.event.findFirst({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          decisionPoints: { orderBy: { orderIndex: 'asc' } },
          criteria: { orderBy: { orderIndex: 'asc' } },
          technicalMeeting: true,
          userEvents: {
            where: { isActive: true },
            include: { user: true, assignedDp: true },
          },
          participants: {
            select: {
              id: true,
              teamName: true,
              schoolName: true,
              category: true,
              queueNumber: true,
              status: true,
              documents: {
                select: { id: true, docType: true, status: true, fileUrl: true },
              },
            },
          },
          _count: {
            select: {
              participants: true,
              decisionPoints: true,
              criteria: true,
            },
          },
        },
      });

      if (!ev) return null;

      // Filter roles dari userEvents
      const adminUE = ev.userEvents.find((ue) => ue.role === 'ADMIN_PANITIA');
      const judgesUE = ev.userEvents.filter((ue) => ue.role === 'JURI');
      const staffUE = ev.userEvents.filter((ue) => ue.role === 'PANITIA_DP');

      // Hitung rincian peserta & berkas
      const participants = ev.participants || [];
      const totalParticipants = ev._count?.participants || participants.length || 0;
      const validatedParticipants = participants.filter((p) => p.status === 'VALIDATED').length;
      const pendingParticipants = participants.filter((p) => p.status === 'SUBMITTED' || p.status === 'PENDING_REVIEW').length;
      const incompleteParticipants = participants.filter((p) => p.status === 'DRAFT' || p.status === 'REVISION_REQUIRED' || p.status === 'NEED_REVISION').length;

      // Hitung skor kesiapan sistem (Readiness Score)
      let readinessScore = 0;
      if (adminUE) readinessScore += 25;
      if (ev.decisionPoints?.length >= 4) readinessScore += 25;
      if (ev.criteria?.length >= 1) readinessScore += 25;
      if (ev.dpFlowLocked || ev.scoringLocked) readinessScore += 25;

      return {
        ...ev,
        adminPanitia: adminUE?.user
          ? {
              id: adminUE.user.id,
              fullName: adminUE.user.fullName,
              email: adminUE.user.email,
              phone: adminUE.user.phone,
            }
          : null,
        judges: judgesUE.map((j) => ({
          id: j.user.id,
          fullName: j.user.fullName,
          email: j.user.email,
          role: 'Dewan Juri',
        })),
        staff: staffUE.map((s) => ({
          id: s.user.id,
          fullName: s.user.fullName,
          assignedDp: s.assignedDp?.name || 'Pos DP',
        })),
        stats: {
          totalParticipants,
          validatedParticipants,
          pendingParticipants,
          incompleteParticipants,
          totalJudges: judgesUE.length,
          totalStaff: staffUE.length,
          readinessScore,
        },
      };
    },
    async () => {
      const ev = identifier
        ? memoryState.events.find((e) => e.id === identifier || e.slug === identifier)
        : memoryState.events[0];
      if (!ev) return null;

      const eventParticipants = memoryState.participants.filter((p) => p.eventId === ev.id);
      const validatedCount = eventParticipants.filter((p) => p.status === 'VALIDATED').length;
      const adminUE = memoryState.userEvents.find(
        (ue) => ue.eventId === ev.id && ue.role === 'ADMIN_PANITIA' && ue.isActive
      );
      const adminUser = adminUE ? memoryState.users.find((u) => u.id === adminUE.userId) : null;

      return {
        ...ev,
        adminPanitia: adminUser
          ? { id: adminUser.id, fullName: adminUser.fullName, email: adminUser.email }
          : null,
        decisionPoints: memoryState.decisionPoints
          .filter((dp) => dp.eventId === ev.id)
          .sort((a, b) => a.orderIndex - b.orderIndex),
        criteria: memoryState.criteria.filter((c) => c.eventId === ev.id),
        stats: {
          totalParticipants: eventParticipants.length,
          validatedParticipants: validatedCount,
          pendingParticipants: Math.max(0, eventParticipants.length - validatedCount),
          incompleteParticipants: 0,
          totalJudges: 3,
          totalStaff: 4,
          readinessScore: adminUser ? 75 : 50,
        },
      };
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

export async function createNewEvent(data, actorUserId = null) {
  return withDbFallback(
    async () => {
      let slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const existingSlug = await prisma.event.findUnique({ where: { slug } });
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const standardDps = [
        { orderIndex: 1, code: 'DOC_CHECK', name: 'DP 1 - Pengecekan Dokumen & Berkas', capacityLimit: 1 },
        { orderIndex: 2, code: 'PHOTOSHOOT', name: 'DP 2 - Photoshoot Resmi Pasukan', capacityLimit: 1 },
        { orderIndex: 3, code: 'FINAL_PREP', name: 'DP 3 - Persiapan Terakhir & Pemanasan', capacityLimit: 1 },
        { orderIndex: 4, code: 'STAGE_PERFORMANCE', name: 'DP 4 - Penampilan Lapangan Utama', capacityLimit: 1 },
      ];

      const createdEvent = await prisma.event.create({
        data: {
          name: data.name,
          slug,
          description: data.description || '',
          bannerUrl: data.bannerUrl || null,
          eventDate: new Date(data.eventDate || Date.now() + 86400000 * 30),
          location: data.location || 'Gelanggang Olahraga',
          status: data.status || 'DRAFT_SETUP',
          dpFlowLocked: false,
          scoringLocked: false,
          resultsPublished: false,
          decisionPoints: {
            create: standardDps,
          },
        },
        include: {
          decisionPoints: { orderBy: { orderIndex: 'asc' } },
        },
      });

      // Catat ke AuditLog
      try {
        await prisma.auditLog.create({
          data: {
            eventId: createdEvent.id,
            userId: actorUserId,
            action: 'CREATE_EVENT',
            resource: 'EVENT',
            payload: JSON.stringify({ name: createdEvent.name, slug: createdEvent.slug, status: createdEvent.status }),
          },
        });
      } catch (logErr) {
        console.warn('[AUDIT LOG WARNING]', logErr.message);
      }

      return createdEvent;
    },
    async () => {
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
  );
}

export async function updateEvent(id, updateData, actorUserId = null) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });
      if (!ev) {
        throw new Error('Event tidak ditemukan.');
      }

      const updated = await prisma.event.update({
        where: { id: ev.id },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.location !== undefined && { location: updateData.location }),
          ...(updateData.eventDate && { eventDate: new Date(updateData.eventDate) }),
          ...(updateData.description !== undefined && { description: updateData.description }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.bannerUrl !== undefined && { bannerUrl: updateData.bannerUrl }),
          ...(updateData.dpFlowLocked !== undefined && { dpFlowLocked: updateData.dpFlowLocked }),
          ...(updateData.scoringLocked !== undefined && { scoringLocked: updateData.scoringLocked }),
          ...(updateData.resultsPublished !== undefined && { resultsPublished: updateData.resultsPublished }),
        },
        include: {
          decisionPoints: { orderBy: { orderIndex: 'asc' } },
          _count: { select: { participants: true } },
        },
      });

      // Catat ke AuditLog
      try {
        await prisma.auditLog.create({
          data: {
            eventId: updated.id,
            userId: actorUserId,
            action: 'UPDATE_EVENT',
            resource: 'EVENT',
            payload: JSON.stringify(updateData),
          },
        });
      } catch (logErr) {
        console.warn('[AUDIT LOG WARNING]', logErr.message);
      }

      return updated;
    },
    async () => {
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
  );
}

export async function deleteEvent(id, actorUserId = null) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });
      if (!ev) {
        throw new Error('Event tidak ditemukan.');
      }

      await prisma.event.delete({
        where: { id: ev.id },
      });

      try {
        await prisma.auditLog.create({
          data: {
            userId: actorUserId,
            action: 'DELETE_EVENT',
            resource: 'EVENT',
            payload: JSON.stringify({ id: ev.id, name: ev.name, slug: ev.slug }),
          },
        });
      } catch (logErr) {
        console.warn('[AUDIT LOG WARNING]', logErr.message);
      }

      return { id: ev.id, name: ev.name, deleted: true };
    },
    async () => {
      const evIndex = memoryState.events.findIndex((e) => e.id === id || e.slug === id);
      if (evIndex === -1) {
        throw new Error('Event tidak ditemukan.');
      }
      const deleted = memoryState.events.splice(evIndex, 1)[0];
      memoryState.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        actor: 'Super Admin',
        role: 'SUPER_ADMIN',
        action: 'DELETE_EVENT',
        target: deleted.name,
      });
      return { id: deleted.id, name: deleted.name, deleted: true };
    }
  );
}

export async function assignAdminToEvent(eventId, { email, fullName, password }, actorUserId = null) {
  const passwordHash = password ? bcrypt.hashSync(password, 10) : defaultPasswordHash;

  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      if (!ev) throw new Error('Event tidak ditemukan.');

      let targetUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!targetUser) {
        targetUser = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash,
            fullName: fullName || email.split('@')[0],
            phone: '081234567800',
            globalRole: 'USER',
            isActive: true,
          },
        });
      } else {
        targetUser = await prisma.user.update({
          where: { id: targetUser.id },
          data: {
            passwordHash,
            fullName: fullName || targetUser.fullName,
            isActive: true,
          },
        });
      }

      // Nonaktifkan admin panitia lain pada event ini agar tidak terjadi duplikasi PIC aktif
      await prisma.userEvent.updateMany({
        where: {
          eventId: ev.id,
          role: 'ADMIN_PANITIA',
          userId: { not: targetUser.id },
          isActive: true,
        },
        data: { isActive: false },
      });

      let ue = await prisma.userEvent.findFirst({
        where: {
          userId: targetUser.id,
          eventId: ev.id,
          role: 'ADMIN_PANITIA',
        },
      });

      if (!ue) {
        ue = await prisma.userEvent.create({
          data: {
            userId: targetUser.id,
            eventId: ev.id,
            role: 'ADMIN_PANITIA',
            isActive: true,
          },
        });
      } else if (!ue.isActive) {
        ue = await prisma.userEvent.update({
          where: { id: ue.id },
          data: { isActive: true },
        });
      }

      try {
        await prisma.auditLog.create({
          data: {
            eventId: ev.id,
            userId: actorUserId || targetUser.id,
            action: 'ASSIGN_ADMIN_PANITIA',
            resource: 'USER_EVENT',
            payload: JSON.stringify({
              adminId: targetUser.id,
              adminName: targetUser.fullName,
              adminEmail: targetUser.email,
              eventName: ev.name,
              userEventId: ue.id,
            }),
          },
        });
      } catch (logErr) {
        console.warn('[AUDIT LOG WARNING]', logErr.message);
      }

      return { targetUser, event: ev };
    },
    async () => {
      const ev = memoryState.events.find((e) => e.id === eventId || e.slug === eventId);
      if (!ev) throw new Error('Event tidak ditemukan.');

      let targetUser = memoryState.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!targetUser) {
        targetUser = {
          id: `usr-${Date.now()}`,
          email: email.toLowerCase(),
          passwordHash,
          fullName: fullName || 'Admin Panitia Baru',
          phone: '081234567800',
          globalRole: 'USER',
          isActive: true,
          createdAt: new Date(),
        };
        memoryState.users.push(targetUser);
      } else {
        targetUser.passwordHash = passwordHash;
        if (fullName) targetUser.fullName = fullName;
      }

      const existingUe = memoryState.userEvents.find(
        (ue) => ue.userId === targetUser.id && ue.eventId === ev.id && ue.role === 'ADMIN_PANITIA'
      );

      if (!existingUe) {
        memoryState.userEvents.push({
          id: `ue-${Date.now()}`,
          userId: targetUser.id,
          eventId: ev.id,
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
  );
}

export async function getAdminPanitiaList() {
  return withDbFallback(
    async () => {
      const users = await prisma.user.findMany({
        where: {
          userEvents: {
            some: { role: 'ADMIN_PANITIA' },
          },
        },
        include: {
          userEvents: {
            where: { role: 'ADMIN_PANITIA' },
            include: { event: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        isActive: u.isActive,
        createdAt: u.createdAt,
        assignedEvents: u.userEvents.map((ue) => ({
          id: ue.event.id,
          name: ue.event.name,
          slug: ue.event.slug,
          status: ue.event.status,
          isActive: ue.isActive,
        })),
      }));
    },
    async () => {
      const adminUserEvents = memoryState.userEvents.filter((ue) => ue.role === 'ADMIN_PANITIA');
      const adminUserIds = [...new Set(adminUserEvents.map((ue) => ue.userId))];

      return adminUserIds.map((uid) => {
        const u = memoryState.users.find((user) => user.id === uid) || {
          id: uid,
          fullName: 'Admin Panitia',
          email: 'panitia@kompas.id',
          isActive: true,
          createdAt: new Date(),
        };

        const uEvents = adminUserEvents
          .filter((ue) => ue.userId === uid)
          .map((ue) => {
            const ev = memoryState.events.find((e) => e.id === ue.eventId) || {
              id: ue.eventId,
              name: 'LKBB Nasional Paskibra 2026',
              slug: 'lkbb-nasional-2026',
              status: 'REGISTRATION_OPEN',
            };
            return {
              id: ev.id,
              name: ev.name,
              slug: ev.slug,
              status: ev.status,
              isActive: ue.isActive,
            };
          });

        return {
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          isActive: u.isActive,
          createdAt: u.createdAt,
          assignedEvents: uEvents,
        };
      });
    }
  );
}
