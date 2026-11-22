import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';

/**
 * KOMPAS Central Data Service
 * Mendukung akses database Supabase PostgreSQL via Prisma, dengan in-memory fallback
 * otomatis bila database cloud sedang dalam proses unpause / maintenance.
 */

const defaultPasswordHash = bcrypt.hashSync('password123', 10);

// In-Memory Fallback State (Mirror dari schema.prisma & seed.mjs)
export const memoryState = {
  users: [
    {
      id: 'usr-admin-1',
      email: 'admin@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Super Admin Pusat KOMPAS',
      phone: '081234567890',
      globalRole: 'SUPER_ADMIN',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-panitia-1',
      email: 'panitia@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Rian Pratama (Admin Panitia)',
      phone: '081234567891',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp1',
      email: 'dp1@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Budi Santoso (Operator DP 1)',
      phone: '081234567892',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp2',
      email: 'dp2@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Siti Rahma (Operator DP 2)',
      phone: '081234567893',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp3',
      email: 'dp3@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Agus Wijaya (Operator DP 3)',
      phone: '081234567894',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp4',
      email: 'dp4@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Hendro Kusuma (Operator DP 4)',
      phone: '081234567895',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-juri1',
      email: 'juri1@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Kolonel (Purn) Bambang S., M.Pd (Juri 1)',
      phone: '081234567896',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-juri2',
      email: 'juri2@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Mayor Aris Setiawan (Juri 2)',
      phone: '081234567897',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-juri3',
      email: 'juri3@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Dra. Endang Lestari (Juri 3)',
      phone: '081234567898',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-peserta1',
      email: 'peserta@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Dimas Aditya (Danton Garuda Sakti)',
      phone: '081234567899',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: '3010e994-c470-4c92-91cb-ced03ba4fc59',
      email: 'abdel@gmail.com',
      passwordHash: defaultPasswordHash,
      fullName: 'abdel Forda',
      phone: '081234567800',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: '23250b0a-03db-4a5a-9fb6-0fc6e0dba379',
      email: 'admin.walikota@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Rian Pratama Walikota',
      phone: '081234567800',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
  ],

  events: [
    {
      id: '08007fe4-8f16-4324-b815-2cb8ead844af',
      name: 'LKBB Nasional Paskibra 2026',
      slug: 'lkbb-nasional-2026',
      description: 'Lomba Kreasi Baris Berbaris Terbuka Tingkat Nasional SMA/SMK Sederajat.',
      category: 'SMA/SMK Sederajat',
      bannerUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80',
      eventDate: new Date('2026-11-15T08:00:00Z'),
      location: 'GOR Remaja Jakarta Timur',
      quota: '32 Tim',
      fee: 'Rp 650.000 / Tim',
      status: 'REGISTRATION_OPEN',
      dpFlowLocked: false,
      scoringLocked: false,
      resultsPublished: false,
      judges: [
        {
          id: 'juri-1',
          name: 'Kolonel (Purn) Bambang S., M.Pd',
          role: 'Ketua Dewan Juri / PBB Murni',
          institution: 'Purna Paskibra Indonesia (PPI Pusat)',
          verified: true,
        },
        {
          id: 'juri-2',
          name: 'Mayor Aris Setiawan',
          role: 'Anggota Juri / Formasi & Variasi',
          institution: 'Dispora & Kodam Jaya',
          verified: true,
        },
        {
          id: 'juri-3',
          name: 'Dra. Endang Lestari',
          role: 'Anggota Juri / Danton & Artikulasi',
          institution: 'Instruktur Protokoler & Kepemudaan Nasional',
          verified: true,
        },
      ],
      createdAt: new Date(),
    },
    {
      id: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19',
      name: 'FORDA',
      slug: 'forda',
      description: 'Tingkatan Lomba dengan peserta dari seluruh perwakilan dari Setiap kabupaten di Jawa Tengah',
      category: 'Tingkat Jawa Tengah',
      bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
      eventDate: new Date('2026-12-05T00:00:00Z'),
      location: 'Tanah Wakaf UNISULA',
      quota: '40 Tim',
      fee: 'Rp 500.000 / Tim',
      status: 'REGISTRATION_OPEN',
      dpFlowLocked: false,
      scoringLocked: false,
      resultsPublished: false,
      judges: [],
      createdAt: new Date(),
    },
    {
      id: '61def7c6-40a7-4506-8e6b-35a7e3ccd4a9',
      name: 'Piala Walikota Paskibra 2026',
      slug: 'piala-walikota-2026',
      description: 'Kompetisi Baris Berbaris & Variasi Formasi Pelajar Tingkat Kota Bekasi.',
      category: 'Pelajar Kota Bekasi',
      bannerUrl: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=1000&q=80',
      eventDate: new Date('2026-12-28T08:00:00Z'),
      location: 'Stadion Patriot, Bekasi',
      quota: '32 Tim',
      fee: 'Rp 550.000 / Tim',
      status: 'REGISTRATION_OPEN',
      dpFlowLocked: false,
      scoringLocked: false,
      resultsPublished: false,
      judges: [],
      createdAt: new Date(),
    },
  ],

  userEvents: [
    { id: 'ue-panitia-1', userId: 'usr-panitia-1', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', role: 'ADMIN_PANITIA', assignedDpId: null, isActive: true },
    { id: 'ue-panitia-forda', userId: '3010e994-c470-4c92-91cb-ced03ba4fc59', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', role: 'ADMIN_PANITIA', assignedDpId: null, isActive: true },
    { id: 'ue-panitia-walikota', userId: '23250b0a-03db-4a5a-9fb6-0fc6e0dba379', eventId: '61def7c6-40a7-4506-8e6b-35a7e3ccd4a9', role: 'ADMIN_PANITIA', assignedDpId: null, isActive: true },
    { id: 'ue-dp1', userId: 'usr-dp1', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', role: 'PANITIA_DP', assignedDpId: 'dp-1', isActive: true },
    { id: 'ue-dp2', userId: 'usr-dp2', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', role: 'PANITIA_DP', assignedDpId: 'dp-2', isActive: true },
    { id: 'ue-dp3', userId: 'usr-dp3', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', role: 'PANITIA_DP', assignedDpId: 'dp-3', isActive: true },
    { id: 'ue-dp4', userId: 'usr-dp4', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', role: 'PANITIA_DP', assignedDpId: 'dp-4', isActive: true },
    { id: 'ue-juri1', userId: 'usr-juri1', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', role: 'JURI', assignedDpId: null, isActive: true },
    { id: 'ue-juri2', userId: 'usr-juri2', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', role: 'JURI', assignedDpId: null, isActive: true },
    { id: 'ue-juri3', userId: 'usr-juri3', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', role: 'JURI', assignedDpId: null, isActive: true },
    { id: 'ue-peserta1', userId: 'usr-peserta1', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', role: 'PESERTA', assignedDpId: null, isActive: true },
  ],

  decisionPoints: [
    { id: 'dp-1', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', orderIndex: 1, code: 'DOC_CHECK', name: 'DP 1 - Pengecekan Dokumen & Berkas', capacityLimit: 1, isActive: true },
    { id: 'dp-2', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', orderIndex: 2, code: 'PHOTOSHOOT', name: 'DP 2 - Photoshoot Resmi Pasukan', capacityLimit: 1, isActive: true },
    { id: 'dp-3', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', orderIndex: 3, code: 'FINAL_PREP', name: 'DP 3 - Persiapan Terakhir & Pemanasan', capacityLimit: 1, isActive: true },
    { id: 'dp-4', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', orderIndex: 4, code: 'STAGE_PERFORMANCE', name: 'DP 4 - Penampilan Lapangan Utama', capacityLimit: 1, isActive: true },
    { id: 'dp-forda-1', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', orderIndex: 1, code: 'DOC_CHECK', name: 'DP 1 - Pengecekan Dokumen FORDA', capacityLimit: 1, isActive: true },
    { id: 'dp-forda-2', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', orderIndex: 2, code: 'PHOTOSHOOT', name: 'DP 2 - Photoshoot Kontingen', capacityLimit: 1, isActive: true },
    { id: 'dp-forda-3', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', orderIndex: 3, code: 'FINAL_PREP', name: 'DP 3 - Persiapan & Pemanasan', capacityLimit: 1, isActive: true },
    { id: 'dp-forda-4', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', orderIndex: 4, code: 'STAGE_PERFORMANCE', name: 'DP 4 - Lapangan Utama', capacityLimit: 1, isActive: true },
    { id: 'dp-wlk-1', eventId: '61def7c6-40a7-4506-8e6b-35a7e3ccd4a9', orderIndex: 1, code: 'DOC_CHECK', name: 'DP 1 - Pengecekan Dokumen', capacityLimit: 1, isActive: true },
    { id: 'dp-wlk-2', eventId: '61def7c6-40a7-4506-8e6b-35a7e3ccd4a9', orderIndex: 2, code: 'PHOTOSHOOT', name: 'DP 2 - Photoshoot Pasukan', capacityLimit: 1, isActive: true },
    { id: 'dp-wlk-3', eventId: '61def7c6-40a7-4506-8e6b-35a7e3ccd4a9', orderIndex: 3, code: 'FINAL_PREP', name: 'DP 3 - Persiapan & Pemanasan', capacityLimit: 1, isActive: true },
    { id: 'dp-wlk-4', eventId: '61def7c6-40a7-4506-8e6b-35a7e3ccd4a9', orderIndex: 4, code: 'STAGE_PERFORMANCE', name: 'DP 4 - Gelanggang Utama', capacityLimit: 1, isActive: true },
  ],

  criteria: [
    { id: 'crit-1', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', name: '1. Langkah Tegap & Hormat Kanan', minScore: 70, maxScore: 100, weight: 1.0 },
    { id: 'crit-2', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', name: '2. Kerapihan Saf, Banjar & Pasukan', minScore: 70, maxScore: 100, weight: 1.0 },
    { id: 'crit-3', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', name: '3. Variasi Formasi & Kekompakan', minScore: 70, maxScore: 100, weight: 1.0 },
    { id: 'crit-4', eventId: '08007fe4-8f16-4324-b815-2cb8ead844af', name: '4. Artikulasi & Intonasi Danton', minScore: 70, maxScore: 100, weight: 1.0 },
    { id: 'crit-forda-1', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', name: '1. PBB Dasar & Gerakan di Tempat', minScore: 70, maxScore: 100, weight: 1.0 },
    { id: 'crit-forda-2', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', name: '2. Gerakan Berjalan & Hormat Kanan', minScore: 70, maxScore: 100, weight: 1.0 },
    { id: 'crit-forda-3', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', name: '3. Variasi Formasi', minScore: 70, maxScore: 100, weight: 1.0 },
  ],

  participants: [
    {
      id: 'part-1',
      eventId: 'evt-lkbb-2026',
      userId: 'usr-peserta1',
      teamName: 'PASKIBRA GARUDA SAKTI',
      schoolName: 'SMAN 1 Jakarta',
      registrationNumber: 'REG-LKBB26-001',
      queueNumber: '01',
      scheduledTime: '08:30 WIB',
      status: 'VALIDATED', // DRAFT, SUBMITTED, REVISION_REQUIRED, VALIDATED, SCHEDULED, SCORED, FINALIZED
      currentDpId: 'dp-1',
      dpStatus: 'IN_PROGRESS',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_Kepsek_SMAN1.pdf' },
        kartuPelajar: { status: 'VALIDATED', name: '16_Kartu_Pelajar_Pasukan.pdf' },
        suratDokter: { status: 'VALIDATED', name: 'Surat_Kesehatan_Puskesmas.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-01T10:00:00Z', by: 'Dimas Aditya' },
        { action: 'VALIDATED', at: '2026-10-02T14:30:00Z', by: 'Rian Pratama (Admin Panitia)' },
      ],
    },
    {
      id: 'part-2',
      eventId: 'evt-lkbb-2026',
      userId: null,
      teamName: 'SATRIA BHAYANGKARA',
      schoolName: 'SMAN 3 Bandung',
      registrationNumber: 'REG-LKBB26-002',
      queueNumber: '02',
      scheduledTime: '09:00 WIB',
      status: 'SUBMITTED',
      currentDpId: null,
      dpStatus: 'WAITING',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_SMAN3_Bdg.pdf' },
        kartuPelajar: { status: 'PENDING_REVIEW', name: 'KTP_Pelajar_Scan.pdf' },
        suratDokter: { status: 'PENDING_REVIEW', name: 'Surat_Kesehatan.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-03T09:15:00Z', by: 'Official SMAN 3' },
      ],
    },
    {
      id: 'part-3',
      eventId: 'evt-lkbb-2026',
      userId: null,
      teamName: 'KARTIKA WIRATAMA',
      schoolName: 'SMKN 2 Surabaya',
      registrationNumber: 'REG-LKBB26-003',
      queueNumber: '03',
      scheduledTime: '09:30 WIB',
      status: 'REVISION_REQUIRED',
      currentDpId: null,
      dpStatus: 'WAITING',
      revisionNote: 'Surat keterangan dokter untuk 2 anggota cadangan belum ditandatangani dokter pemeriksa.',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_SMKN2.pdf' },
        kartuPelajar: { status: 'VALIDATED', name: 'Kartu_Pelajar_Lengkap.pdf' },
        suratDokter: { status: 'REVISION', name: 'Surat_Dokter_Kurang_Ttd.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-02T11:00:00Z', by: 'Pembina SMKN 2' },
        { action: 'REVISION_REQUIRED', at: '2026-10-03T16:00:00Z', by: 'Rian Pratama' },
      ],
    },
    {
      id: 'part-4',
      eventId: 'evt-lkbb-2026',
      userId: null,
      teamName: 'PASKIBRA PANDU NUSANTARA',
      schoolName: 'SMA Taruna Nusantara Magelang',
      registrationNumber: 'REG-LKBB26-004',
      queueNumber: '04',
      scheduledTime: '10:00 WIB',
      status: 'VALIDATED',
      currentDpId: null,
      dpStatus: 'WAITING',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_Taruna.pdf' },
        kartuPelajar: { status: 'VALIDATED', name: 'ID_Cards_Taruna.pdf' },
        suratDokter: { status: 'VALIDATED', name: 'Medical_Check_Taruna.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-04T08:00:00Z', by: 'Danton SMA TN' },
        { action: 'VALIDATED', at: '2026-10-04T12:00:00Z', by: 'Rian Pratama' },
      ],
    },
  ],

  scores: [],
  feedbacks: [],
  documentRequirements: [
    {
      id: 'req-doc-1',
      eventId: 'evt-lkbb-2026',
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
      id: 'req-doc-2',
      eventId: 'evt-lkbb-2026',
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
      id: 'req-doc-3',
      eventId: 'evt-lkbb-2026',
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
  ],
  dpStaff: [
    { id: 'staff-1', name: 'Budi Santoso', email: 'panitia.dp1@kompas.id', assignedDpId: 1, eventId: 'evt-lkbb-2026', status: 'AKTIF' },
    { id: 'staff-2', name: 'Rian Firmansyah', email: 'panitia.dp2@kompas.id', assignedDpId: 2, eventId: 'evt-lkbb-2026', status: 'AKTIF' },
    { id: 'staff-3', name: 'Dewi Anggraini', email: 'panitia.dp3@kompas.id', assignedDpId: 3, eventId: 'evt-lkbb-2026', status: 'AKTIF' },
    { id: 'staff-4', name: 'Ahmad Fauzi', email: 'panitia.dp4@kompas.id', assignedDpId: 4, eventId: 'evt-lkbb-2026', status: 'AKTIF' },
  ],
  customDpNames: [
    'Pengecekan Dokumen dan Berkas',
    'Photoshoot Pasukan',
    'Daerah Persiapan dan Pemanasan',
    'Panggung Utama',
  ],
  judges: [
    {
      id: 'juri-1',
      eventId: 'evt-lkbb-2026',
      name: 'Kolonel (Purn) Bambang S., M.Pd',
      role: 'Ketua Dewan Juri (Juri 1)',
      category: 'PBB Murni',
      specialties: ['PBB Murni', 'Komandan Peleton'],
      institution: 'Purna Paskibra Indonesia (PPI Pusat)',
      pin: '8821',
      email: 'juri1@kompas.id',
      status: 'AKTIF',
    },
    {
      id: 'juri-2',
      eventId: 'evt-lkbb-2026',
      name: 'Mayor Aris Setiawan',
      role: 'Anggota Dewan Juri (Juri 2)',
      category: 'PBB Murni',
      specialties: ['PBB Murni'],
      institution: 'Dispora & Kodam Jaya',
      pin: '4412',
      email: 'juri2@kompas.id',
      status: 'AKTIF',
    },
    {
      id: 'juri-3',
      eventId: 'evt-lkbb-2026',
      name: 'Kapten Kav. Hendra Gunawan',
      role: 'Anggota Dewan Juri (Juri 3)',
      category: 'PBB Murni',
      specialties: ['PBB Murni'],
      institution: 'Pusdiklat Paskibraka Nasional',
      pin: '9120',
      email: 'juri3@kompas.id',
      status: 'AKTIF',
    },
    {
      id: 'juri-4',
      eventId: 'evt-lkbb-2026',
      name: 'Dra. Endang Lestari',
      role: 'Anggota Dewan Juri (Juri 4)',
      category: 'Formasi & Variasi',
      specialties: ['Formasi & Variasi'],
      institution: 'Instruktur Koreografi & Tari Nasional',
      pin: '3318',
      email: 'juri4@kompas.id',
      status: 'AKTIF',
    },
    {
      id: 'juri-5',
      eventId: 'evt-lkbb-2026',
      name: 'Rian Syahputra, S.Sn',
      role: 'Anggota Dewan Juri (Juri 5)',
      category: 'Formasi & Variasi',
      specialties: ['Formasi & Variasi', 'Kerapihan & Kostum'],
      institution: 'Akademi Seni & Budaya Indonesia',
      pin: '7729',
      email: 'juri5@kompas.id',
      status: 'AKTIF',
    },
  ],
  auditLogs: [
    { id: 'log-1', timestamp: new Date(Date.now() - 1000 * 60 * 30), actor: 'Rian Pratama', role: 'ADMIN_PANITIA', action: 'VALIDATE_PARTICIPANT', target: 'PASKIBRA GARUDA SAKTI' },
    { id: 'log-2', timestamp: new Date(Date.now() - 1000 * 60 * 15), actor: 'Budi Santoso', role: 'PANITIA_DP_1', action: 'CHECKIN_TEAM', target: 'PASKIBRA GARUDA SAKTI' },
  ],
  technicalMeetings: [
    {
      eventId: 'evt-lkbb-2026',
      meetingInfo: {
        platform: 'Zoom Meeting',
        zoomUrl: 'https://zoom.us/j/89241109928?pwd=kompasLKBB2026official',
        meetingId: '892 4110 9928',
        passcode: 'LKBB2026',
        date: '2026-11-14',
        time: '13:30',
        timezone: 'WIB',
        instructions: 'Format nama akun Zoom: [No Urut] - [Nama Sekolah] - [Nama Official/Danton]. Harap memasuki ruang virtual 15 menit sebelum acara dimulai. Setiap kontingen maksimal mengirimkan 2 akun delegasi.',
        isPublished: true,
      },
      documents: [
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
      ],
      summaryNotes: `1. Batas waktu tampil peleton maksimal 10 menit (Peluit 1: Mulai panggung, Peluit 2: Peringatan sisa 2 menit, Peluit 3: Waktu habis).
2. Toleransi keterlambatan kehadiran di DP 1 (Cek Dokumen & Fisik) maksimal 5 menit dari jadwal tampil.
3. Seluruh nomor urut undian tampil bersifat final dan mengikat sesuai Berita Acara terlampir.
4. Musik pengiring variasi & formasi wajib diserahkan ke meja operator sound paling lambat saat gladi kotor H-1.
5. Kostum Danton wajib mengenakan PDH resmi pangkalan satuan masing-masing.`,
    },
  ],
};

// Circuit breaker untuk koneksi database
let isDbReachable = true;
let lastDbCheck = 0;
const DB_RETRY_INTERVAL = 60000; // Coba kembali koneksi setiap 60 detik

// Helper untuk eksekusi safe query dengan fallback otomatis
export async function withDbFallback(dbFn, fallbackFn) {
  // Jika explicitly disabled via env (misal USE_IN_MEMORY_DB=true)
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    return await fallbackFn();
  }

  const now = Date.now();
  // Jika sebelumnya database tidak terjangkau dan belum lewat retry interval,
  // langsung layani dari in-memory state tanpa menunggu timeout lambat.
  if (!isDbReachable && now - lastDbCheck < DB_RETRY_INTERVAL) {
    return await fallbackFn();
  }

  try {
    const result = await dbFn();
    if (!isDbReachable) {
      console.log('[KOMPAS DATA SERVICE] Database Supabase kembali terhubung secara online.');
      isDbReachable = true;
    }
    return result;
  } catch (err) {
    lastDbCheck = now;
    if (isDbReachable) {
      // Log ringkas satu kali agar terminal bersih dan informatif
      const cleanReason = err.message?.includes("Can't reach database server")
        ? "Tidak dapat menjangkau server Supabase (db.qvuqdeloxrsaggseijhz.supabase.co:5432). Pastikan project Supabase aktif / tidak paused."
        : (err.message?.split('\n')?.[0] || 'Koneksi database terputus');

      console.warn(`[KOMPAS DATA SERVICE] Database offline -> beralih ke in-memory state: ${cleanReason}`);
      isDbReachable = false;
    }
    return await fallbackFn();
  }
}

export { prisma, defaultPasswordHash };
