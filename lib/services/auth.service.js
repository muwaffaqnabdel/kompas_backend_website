import { prisma, withDbFallback, memoryState } from './db-fallback.js';

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
