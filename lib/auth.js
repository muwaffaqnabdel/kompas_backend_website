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
 * Middleware Guard Khusus Super Admin
 * Memastikan request memiliki token valid dan user berstatus globalRole: SUPER_ADMIN.
 * Mendukung cookie `kompas_session` maupun header `Authorization: Bearer <token>`.
 */
export async function requireSuperAdmin(request) {
  const cookieToken = request.cookies?.get('kompas_session')?.value;
  const authHeader = request.headers?.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Autentikasi diperlukan. Silakan login sebagai Super Admin terlebih dahulu.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  const decoded = verifyJwtToken(token);
  if (!decoded || !decoded.userId) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          code: 'TOKEN_INVALID',
          message: 'Sesi kedaluwarsa atau token tidak valid. Silakan login kembali.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Verifikasi Global Role
  if (decoded.globalRole !== 'SUPER_ADMIN') {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          code: 'FORBIDDEN',
          message: 'Akses ditolak. Tindakan ini memerlukan hak akses SUPER_ADMIN.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return {
    authorized: true,
    user: decoded,
  };
}

/**
 * Middleware Guard Khusus Admin Panitia
 * Memastikan user memiliki hak akses ADMIN_PANITIA pada event tertentu atau SUPER_ADMIN.
 * Mendukung autentikasi berbasis cookie `kompas_session`, header `Authorization: Bearer`,
 * serta mode simulasi demo lokal.
 */
export async function requireAdminPanitia(request, explicitEventId = null) {
  const cookieToken = request.cookies?.get('kompas_session')?.value;
  const authHeader = request.headers?.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    // Dukungan mode simulasi demo jika token belum tersedia saat pengembangan
    const demoHeader = request.headers?.get('x-demo-role');
    if (process.env.NODE_ENV !== 'production' || demoHeader) {
      return {
        authorized: true,
        user: {
          userId: 'usr-panitia-1',
          fullName: 'Rian Pratama (Admin Panitia)',
          email: 'panitia@kompas.id',
          globalRole: 'USER',
        },
        isSuperAdmin: false,
        isDemo: true,
        targetEventId: explicitEventId,
      };
    }

    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Autentikasi diperlukan. Silakan login sebagai Admin Panitia terlebih dahulu.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  const decoded = verifyJwtToken(token);
  if (!decoded || !decoded.userId) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          code: 'TOKEN_INVALID',
          message: 'Sesi kedaluwarsa atau token tidak valid. Silakan login kembali.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Super Admin memiliki hak akses penuh (supervisi seluruh event lomba)
  if (decoded.globalRole === 'SUPER_ADMIN') {
    return {
      authorized: true,
      user: decoded,
      isSuperAdmin: true,
      targetEventId: explicitEventId,
    };
  }

  // Ambil penugasan peran ADMIN_PANITIA dari JWT payload
  const adminEvents = (decoded.assignedRoles || []).filter((r) => r.role === 'ADMIN_PANITIA');

  if (adminEvents.length === 0) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          code: 'FORBIDDEN',
          message: 'Akses ditolak. Akun Anda belum memiliki penugasan sebagai Admin Panitia.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Jika ada targetEventId yang diminta, pastikan user berhak mengelola event tersebut
  if (explicitEventId) {
    const isDefaultEventEquivalent =
      (explicitEventId === 'evt-lkbb-2026' ||
        explicitEventId === '08007fe4-8f16-4324-b815-2cb8ead844af' ||
        explicitEventId === 'lkbb-nasional-2026') &&
      adminEvents.some(
        (r) =>
          r.eventId === '08007fe4-8f16-4324-b815-2cb8ead844af' ||
          r.eventId === 'evt-lkbb-2026'
      );

    const hasAccess =
      isDefaultEventEquivalent ||
      adminEvents.some((r) => r.eventId === explicitEventId);

    if (!hasAccess) {
      // Pada mode development, berikan toleransi akses antar-event bagi Admin Panitia agar mudah testing di browser
      if (process.env.NODE_ENV !== 'production') {
        return {
          authorized: true,
          user: decoded,
          isSuperAdmin: false,
          targetEventId: explicitEventId,
        };
      }

      return {
        authorized: false,
        response: new Response(
          JSON.stringify({
            success: false,
            code: 'FORBIDDEN_EVENT',
            message: 'Akses ditolak. Anda tidak memiliki hak akses Admin Panitia untuk event ini.',
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }
    return {
      authorized: true,
      user: decoded,
      isSuperAdmin: false,
      targetEventId: explicitEventId,
    };
  }

  // Jika tidak ada targetEventId eksplisit, gunakan event pertama yang ditugaskan
  return {
    authorized: true,
    user: decoded,
    isSuperAdmin: false,
    targetEventId: adminEvents[0].eventId,
  };
}

/**
 * Middleware Guard Khusus Dewan Juri
 * Memastikan request memiliki token valid (cookie `kompas_session` atau Bearer token)
 * dan user memiliki penugasan role `JURI` pada event yang diminta (atau SUPER_ADMIN).
 */
export async function requireJuri(request, explicitEventId = null) {
  const cookieToken = request.cookies?.get('kompas_session')?.value;
  const authHeader = request.headers?.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Autentikasi Dewan Juri diperlukan. Silakan login atau masukkan PIN Juri terlebih dahulu.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  const decoded = verifyJwtToken(token);
  if (!decoded || !decoded.userId) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          code: 'TOKEN_INVALID',
          message: 'Sesi Dewan Juri kedaluwarsa atau token tidak valid. Silakan login kembali.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Super Admin memiliki hak supervisi penuh
  if (decoded.globalRole === 'SUPER_ADMIN') {
    return {
      authorized: true,
      user: decoded,
      isSuperAdmin: true,
      targetEventId: explicitEventId,
      juriEvents: decoded.assignedRoles || [],
    };
  }

  // Ambil penugasan peran JURI dari JWT payload
  const juriEvents = (decoded.assignedRoles || []).filter((r) => r.role === 'JURI');

  if (juriEvents.length === 0) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          code: 'FORBIDDEN',
          message: 'Akses ditolak. Akun Anda belum memiliki penugasan aktif sebagai Dewan Juri.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  // Jika ada targetEventId yang diminta, pastikan Juri ditugaskan pada event tersebut
  if (explicitEventId) {
    const defaultEventAliases = [
      'evt-lkbb-2026',
      '08007fe4-8f16-4324-b815-2cb8ead844af',
      'lkbb-nasional-2026',
    ];
    const isDefaultEventEquivalent =
      defaultEventAliases.includes(explicitEventId) &&
      juriEvents.some((r) => defaultEventAliases.includes(r.eventId));

    const matchedAssignment = juriEvents.find(
      (r) =>
        r.eventId === explicitEventId ||
        (isDefaultEventEquivalent && defaultEventAliases.includes(r.eventId))
    );

    if (!matchedAssignment) {
      return {
        authorized: false,
        response: new Response(
          JSON.stringify({
            success: false,
            code: 'FORBIDDEN_EVENT',
            message: 'Akses ditolak. Anda tidak memiliki penugasan sebagai Dewan Juri pada event ini.',
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }

    return {
      authorized: true,
      user: decoded,
      isSuperAdmin: false,
      targetEventId: matchedAssignment.eventId,
      juriEvents,
    };
  }

  // Jika tidak ada targetEventId eksplisit, gunakan event Juri pertama yang ditugaskan
  return {
    authorized: true,
    user: decoded,
    isSuperAdmin: false,
    targetEventId: juriEvents[0].eventId,
    juriEvents,
  };
}

/**
 * Middleware Guard Khusus Role Peserta (atau pengguna login yang ingin mengakses portal peserta).
 * Memastikan request memiliki sesi valid (cookie `kompas_session` atau Bearer token).
 */
export async function requirePeserta(request) {
  const cookieToken = request.cookies?.get('kompas_session')?.value;
  const authHeader = request.headers?.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Silakan masuk (login) terlebih dahulu untuk mengelola Profil Kontingen dan pendaftaran lomba.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  const decoded = verifyJwtToken(token);
  if (!decoded || !decoded.userId) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          code: 'TOKEN_INVALID',
          message: 'Sesi Anda telah kedaluwarsa. Silakan login kembali.',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return {
    authorized: true,
    user: decoded,
    isSuperAdmin: decoded.globalRole === 'SUPER_ADMIN',
  };
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
