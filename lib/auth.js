import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kompas_paskibra_super_secure_jwt_secret_key_2026';

export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export function signJwtToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwtToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Resolusi alur navigasi berdasarkan PRD (PRDWEBSITEPASKIBRA_FLOW_PER_ROLE.md):
 * 1. Super Admin -> Global Dashboard (/admin/overview)
 * 2. Admin Panitia -> langsung ke dashboard event yang ditugaskan (/panitia/dashboard?event=...)
 * 3. Panitia DP -> langsung ke workstation pos DP yang ditugaskan (/dp/workstation?event=...&dp=...)
 * 4. Juri -> langsung ke dashboard Juri (/juri/dashboard?event=...)
 * 5. Peserta -> dashboard peserta (/peserta/dashboard?event=...)
 * 6. Jika pengguna terhubung ke > 1 event -> halaman pemilihan event (/select-event)
 * 7. Jika tidak ada event aktif -> /waiting-assignment
 */
export function resolveUserNavigation(user, activeUserEvents = []) {
  if (user.globalRole === 'SUPER_ADMIN') {
    return {
      redirectPath: '/admin/overview',
      role: 'SUPER_ADMIN',
      scope: 'GLOBAL',
      eventsCount: activeUserEvents.length,
    };
  }

  if (!activeUserEvents || activeUserEvents.length === 0) {
    return {
      redirectPath: '/waiting-assignment',
      role: 'USER',
      scope: 'UNASSIGNED',
      eventsCount: 0,
    };
  }

  // Jika memiliki tepat 1 penugasan event aktif
  if (activeUserEvents.length === 1) {
    const ue = activeUserEvents[0];
    const eventId = ue.eventId;

    switch (ue.role) {
      case 'ADMIN_PANITIA':
        return {
          redirectPath: `/panitia/dashboard?eventId=${eventId}`,
          role: 'ADMIN_PANITIA',
          eventId,
          event: ue.event,
        };
      case 'PANITIA_DP':
        return {
          redirectPath: `/dp/workstation?eventId=${eventId}${ue.assignedDpId ? `&dpId=${ue.assignedDpId}` : ''}`,
          role: 'PANITIA_DP',
          eventId,
          assignedDpId: ue.assignedDpId,
          event: ue.event,
        };
      case 'JURI':
        return {
          redirectPath: `/juri/dashboard?eventId=${eventId}`,
          role: 'JURI',
          eventId,
          event: ue.event,
        };
      case 'PESERTA':
      default:
        return {
          redirectPath: `/peserta/dashboard?eventId=${eventId}`,
          role: 'PESERTA',
          eventId,
          event: ue.event,
        };
    }
  }

  // Jika terhubung ke lebih dari satu event, arahkan ke selector
  return {
    redirectPath: '/select-event',
    role: 'MULTI_ROLE',
    scope: 'MULTI_EVENT',
    eventsCount: activeUserEvents.length,
    events: activeUserEvents.map((ue) => ({
      eventId: ue.eventId,
      eventName: ue.event?.name,
      role: ue.role,
      assignedDpId: ue.assignedDpId,
    })),
  };
}
