import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';

/**
 * KOMPAS Central Data Service
 * Mendukung akses database Supabase PostgreSQL via Prisma, dengan in-memory fallback
 * otomatis bila database cloud sedang dalam proses unpause / maintenance.
 */

const defaultPasswordHash = bcrypt.hashSync('password123', 10);

// In-Memory Fallback State (Mirror dari schema.prisma & seed.mjs)
const memoryState = {
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
      fullName: 'Budi Santoso (Pos 1 Dokumen - LKBB)',
      phone: '081234567892',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp2',
      email: 'dp2@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Siti Rahma (Pos 2 Photoshoot - LKBB)',
      phone: '081234567893',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp3',
      email: 'dp3@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Agus Wijaya (Pos 3 Persiapan - LKBB)',
      phone: '081234567894',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp4',
      email: 'dp4@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Hendro Kusuma (Pos 4 Panggung Utama - LKBB)',
      phone: '081234567895',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp-forda-1',
      email: 'dp1.forda@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Ahmad Fauzi (Pos 1 Dokumen - FORDA)',
      phone: '081234567851',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp-forda-2',
      email: 'dp2.forda@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Rian Firmansyah (Pos 2 Photoshoot - FORDA)',
      phone: '081234567852',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp-forda-3',
      email: 'dp3.forda@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Dewi Anggraini (Pos 3 Persiapan - FORDA)',
      phone: '081234567853',
      globalRole: 'USER',
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'usr-dp-forda-4',
      email: 'dp4.forda@kompas.id',
      passwordHash: defaultPasswordHash,
      fullName: 'Kapten Joko (Pos 4 Panggung Utama - FORDA)',
      phone: '081234567854',
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
    { id: 'ue-dp-forda-1', userId: 'usr-dp-forda-1', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', role: 'PANITIA_DP', assignedDpId: 'dp-forda-1', isActive: true },
    { id: 'ue-dp-forda-2', userId: 'usr-dp-forda-2', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', role: 'PANITIA_DP', assignedDpId: 'dp-forda-2', isActive: true },
    { id: 'ue-dp-forda-3', userId: 'usr-dp-forda-3', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', role: 'PANITIA_DP', assignedDpId: 'dp-forda-3', isActive: true },
    { id: 'ue-dp-forda-4', userId: 'usr-dp-forda-4', eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19', role: 'PANITIA_DP', assignedDpId: 'dp-forda-4', isActive: true },
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
    {
      id: 'part-forda-1',
      eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19',
      userId: null,
      teamName: 'PASKIBRA GARUDA PANDANARAN',
      schoolName: 'SMAN 1 Semarang',
      registrationNumber: 'REG-FORDA26-001',
      queueNumber: '01',
      scheduledTime: '08:30 WIB',
      status: 'VALIDATED',
      currentDpId: null,
      dpStatus: 'WAITING',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_Kepsek_SMAN1_Semarang.pdf' },
        kartuPelajar: { status: 'VALIDATED', name: '16_Kartu_Pelajar_Pasukan_Semarang.pdf' },
        suratDokter: { status: 'VALIDATED', name: 'Surat_Kesehatan_Puskesmas.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-10T08:00:00Z', by: 'Pembina SMAN 1 Smg' },
        { action: 'VALIDATED', at: '2026-10-12T10:00:00Z', by: 'Panitia FORDA' },
      ],
    },
    {
      id: 'part-forda-2',
      eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19',
      userId: null,
      teamName: 'KARTIKA CANDRADIMUKA',
      schoolName: 'SMA Taruna Nusantara Magelang',
      registrationNumber: 'REG-FORDA26-002',
      queueNumber: '02',
      scheduledTime: '09:00 WIB',
      status: 'VALIDATED',
      currentDpId: null,
      dpStatus: 'WAITING',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_Taruna_Forda.pdf' },
        kartuPelajar: { status: 'VALIDATED', name: 'Kartu_Pelajar_Taruna.pdf' },
        suratDokter: { status: 'VALIDATED', name: 'Medical_Check_Taruna.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-11T09:00:00Z', by: 'Official Taruna' },
      ],
    },
    {
      id: 'part-forda-3',
      eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19',
      userId: null,
      teamName: 'SURYA KUSUMA',
      schoolName: 'SMAN 1 Surakarta',
      registrationNumber: 'REG-FORDA26-003',
      queueNumber: '03',
      scheduledTime: '09:30 WIB',
      status: 'SUBMITTED',
      currentDpId: null,
      dpStatus: 'WAITING',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_SMAN1_Ska.pdf' },
        kartuPelajar: { status: 'PENDING_REVIEW', name: 'Kartu_Pelajar_Scan.pdf' },
        suratDokter: { status: 'PENDING_REVIEW', name: 'Surat_Kesehatan.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-12T11:00:00Z', by: 'Pembina SMAN 1 Ska' },
      ],
    },
    {
      id: 'part-forda-4',
      eventId: '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19',
      userId: null,
      teamName: 'LASKAR MENARA',
      schoolName: 'SMKN 2 Kudus',
      registrationNumber: 'REG-FORDA26-004',
      queueNumber: '04',
      scheduledTime: '10:00 WIB',
      status: 'REVISION_REQUIRED',
      currentDpId: null,
      dpStatus: 'WAITING',
      revisionNote: 'Kartu pelajar untuk danton belum tertera NISN resmi.',
      docs: {
        suratTugas: { status: 'VALIDATED', name: 'Surat_Tugas_SMKN2_Kudus.pdf' },
        kartuPelajar: { status: 'REVISION', name: 'Kartu_Pelajar_Belum_NISN.pdf' },
        suratDokter: { status: 'VALIDATED', name: 'Surat_Sehat.pdf' },
      },
      auditHistory: [
        { action: 'SUBMITTED', at: '2026-10-12T14:00:00Z', by: 'Official Kudus' },
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
};

// Circuit breaker untuk koneksi database
let isDbReachable = true;
let lastDbCheck = 0;
const DB_RETRY_INTERVAL = 60000; // Coba kembali koneksi setiap 60 detik

// Helper untuk eksekusi safe query dengan fallback otomatis
async function withDbFallback(dbFn, fallbackFn) {
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

// -------------------------------------------------------------
// USER & AUTH SERVICES
// -------------------------------------------------------------
export async function findUserByEmail(email) {
  const normalized = email.toLowerCase().trim();
  const getFromMemory = () => {
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
  };

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
      if (u) return u;
      return getFromMemory();
    },
    async () => getFromMemory()
  );
}

export async function findUserById(userId) {
  const getFromMemory = () => {
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
  };

  return withDbFallback(
    async () => {
      const u = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userEvents: {
            where: { isActive: true },
            include: { event: true, assignedDp: true },
          },
        },
      });
      if (u) return u;
      return getFromMemory();
    },
    async () => getFromMemory()
  );
}

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

// -------------------------------------------------------------
// PANITIA DP & ATOMIC MOVEMENT (HARI H)
// -------------------------------------------------------------
export async function getDPStatusData(eventId = 'evt-lkbb-2026') {
  const isTargetEvent = (eId) => {
    if (eId === eventId) return true;
    const isDefault1 = eId === '08007fe4-8f16-4324-b815-2cb8ead844af' || eId === 'evt-lkbb-2026' || eId === 'lkbb-nasional-2026';
    const isDefault2 = eventId === '08007fe4-8f16-4324-b815-2cb8ead844af' || eventId === 'evt-lkbb-2026' || eventId === 'lkbb-nasional-2026';
    if (isDefault1 && isDefault2) return true;

    const isForda1 = eId === '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19' || eId === 'forda';
    const isForda2 = eventId === '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19' || eventId === 'forda';
    if (isForda1 && isForda2) return true;

    return false;
  };

  const dps = memoryState.decisionPoints
    .filter((dp) => isTargetEvent(dp.eventId))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const participants = memoryState.participants.filter((p) => isTargetEvent(p.eventId));

  const defaultOperators = [
    'Budi Santoso (Panitia DP 1)',
    'Siti Rahmawati (Panitia DP 2)',
    'Agus Hermawan (Panitia DP 3)',
    'Kapten Kav. Hendra Wijaya (Pimpinan Lapangan)',
  ];

  const posStatus = dps.map((dp, idx) => {
    const occupiedTeam = participants.find((p) => p.currentDpId === dp.id && p.dpStatus === 'IN_PROGRESS');

    let queueForThisPos = [];
    if (dp.orderIndex === 1) {
      queueForThisPos = participants
        .filter((p) => !p.currentDpId && (p.status === 'VALIDATED' || p.status === 'SUBMITTED' || p.dpStatus === 'WAITING'))
        .map((p) => ({
          orderNumber: p.queueNumber || '01',
          school: p.schoolName || 'Sekolah Peserta',
          teamName: p.teamName,
          status: 'Menunggu di Ruang Tunggu Registrasi',
        }));
    } else {
      const prevDp = dps.find((d) => d.orderIndex === dp.orderIndex - 1);
      if (prevDp) {
        const teamInPrev = participants.filter((p) => p.currentDpId === prevDp.id);
        queueForThisPos = teamInPrev.map((p) => ({
          orderNumber: p.queueNumber || '01',
          school: p.schoolName || 'Sekolah Peserta',
          teamName: p.teamName,
          status: `Menunggu Selesai dari Pos 0${prevDp.orderIndex}`,
        }));
      }
    }

    const isPerforming = dp.orderIndex === 4 && !!occupiedTeam;
    const hasTeam = !!occupiedTeam;

    const badgeColor = isPerforming
      ? { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' }
      : dp.orderIndex === 1
      ? { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }
      : dp.orderIndex === 2
      ? { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' }
      : hasTeam
      ? { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' }
      : { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };

    const statusLabel = isPerforming
      ? 'SEDANG TAMPIL DI LAPANGAN'
      : dp.orderIndex === 1
      ? (hasTeam ? 'SEDANG DIVERIFIKASI' : 'SIAP VERIFIKASI')
      : dp.orderIndex === 2
      ? (hasTeam ? 'SESI FOTO BERLANGSUNG' : 'STUDIO FOTO STERIL')
      : dp.orderIndex === 3
      ? (hasTeam ? 'SEDANG PEMANASAN' : 'KORIDOR STERIL / SIAP TERIMA')
      : (hasTeam ? 'SEDANG BERLANGSUNG' : 'ARENA STERIL');

    const activeTeamFormatted = occupiedTeam ? {
      id: occupiedTeam.id,
      orderNumber: occupiedTeam.queueNumber || '01',
      school: occupiedTeam.schoolName || 'SMAN 1 Jakarta',
      teamName: occupiedTeam.teamName,
      danton: occupiedTeam.danton || 'Danton Peleton',
      members: occupiedTeam.members || 16,
      entryTime: occupiedTeam.entryTime || '08:30 WIB',
      elapsedTime: occupiedTeam.elapsedTime || '05 Menit',
      notes: occupiedTeam.notes || (dp.orderIndex === 1
        ? 'Pemeriksaan berkas SP / SK Kepala Sekolah & cek fisik atribut lengkap.'
        : dp.orderIndex === 2
        ? 'Foto formasi saf depan & close-up danton untuk layar videotron.'
        : dp.orderIndex === 3
        ? 'Mulai pemanasan langkah tegap dan sinkronisasi tempo aba-aba.'
        : 'Sedang memperagakan Formasi Variasi. Dewan Juri aktif menilai.'),
    } : null;

    return {
      id: dp.orderIndex,
      dpId: dp.id,
      posCode: `POS 0${dp.orderIndex}`,
      name: dp.name,
      shortDesc: dp.sop || 'Pos operasional alur lomba.',
      operator: dp.operator || defaultOperators[idx] || 'Panitia Pos DP',
      status: isPerforming ? 'PERFORMING' : hasTeam ? 'IN_PROGRESS' : 'EMPTY',
      statusLabel,
      badgeColor,
      isOccupied: hasTeam,
      capacityAvailable: hasTeam ? 0 : 1,
      activeTeam: activeTeamFormatted,
      queueTeams: queueForThisPos,
    };
  });

  return {
    decisionPoints: posStatus,
    waitingQueue: participants.filter((p) => !p.currentDpId && (p.status === 'VALIDATED' || p.status === 'SUBMITTED')),
  };
}

export async function executeAtomicDPMove({ eventId = 'evt-lkbb-2026', participantId, toDpIndex, operatorName }) {
  const isTargetEvent = (eId) => {
    if (eId === eventId) return true;
    const isDefault1 = eId === '08007fe4-8f16-4324-b815-2cb8ead844af' || eId === 'evt-lkbb-2026' || eId === 'lkbb-nasional-2026';
    const isDefault2 = eventId === '08007fe4-8f16-4324-b815-2cb8ead844af' || eventId === 'evt-lkbb-2026' || eventId === 'lkbb-nasional-2026';
    if (isDefault1 && isDefault2) return true;

    const isForda1 = eId === '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19' || eId === 'forda';
    const isForda2 = eventId === '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19' || eventId === 'forda';
    if (isForda1 && isForda2) return true;

    return false;
  };

  const dps = memoryState.decisionPoints
    .filter((dp) => isTargetEvent(dp.eventId))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Jika participantId adalah 'SIMULATE_NEXT' atau tidak spesifik, jalankan pergeseran maju berantai (pipeline advance)
  if (!participantId || participantId === 'SIMULATE_NEXT') {
    const pInPos4 = memoryState.participants.find((p) => isTargetEvent(p.eventId) && p.currentDpId === dps[3]?.id);
    const pInPos3 = memoryState.participants.find((p) => isTargetEvent(p.eventId) && p.currentDpId === dps[2]?.id);
    const pInPos2 = memoryState.participants.find((p) => isTargetEvent(p.eventId) && p.currentDpId === dps[1]?.id);
    const pInPos1 = memoryState.participants.find((p) => isTargetEvent(p.eventId) && p.currentDpId === dps[0]?.id);
    const nextQueue = memoryState.participants.find((p) => isTargetEvent(p.eventId) && !p.currentDpId && p.dpStatus !== 'FINISHED');

    if (pInPos4) {
      pInPos4.currentDpId = null;
      pInPos4.dpStatus = 'FINISHED';
    }
    if (pInPos3 && dps[3]) {
      pInPos3.currentDpId = dps[3].id;
      pInPos3.dpStatus = 'IN_PROGRESS';
    }
    if (pInPos2 && dps[2]) {
      pInPos2.currentDpId = dps[2].id;
      pInPos2.dpStatus = 'IN_PROGRESS';
    }
    if (pInPos1 && dps[1]) {
      pInPos1.currentDpId = dps[1].id;
      pInPos1.dpStatus = 'IN_PROGRESS';
    }
    if (nextQueue && dps[0]) {
      nextQueue.currentDpId = dps[0].id;
      nextQueue.dpStatus = 'IN_PROGRESS';
    }

    memoryState.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      actor: operatorName || 'Admin Panitia (Simulasi)',
      role: 'ADMIN_PANITIA',
      action: 'SIMULATE_ADVANCE_ALL_POS',
      target: 'Semua Pos DP Banjar',
    });

    return {
      success: true,
      message: 'Simulasi alur berhasil dimajukan satu langkah di semua pos.',
    };
  }

  // Jika toDpIndex > 4, berarti tim telah selesai tampil di Pos 4 (Arena) dan keluar lapangan
  if (toDpIndex > 4) {
    const pIndex = memoryState.participants.findIndex((p) => p.id === participantId);
    if (pIndex !== -1) {
      memoryState.participants[pIndex].currentDpId = null;
      memoryState.participants[pIndex].dpStatus = 'FINISHED';
    }
    return {
      success: true,
      blocked: false,
      message: 'Pasukan telah selesai tampil dan dibubarkan keluar arena. Lapangan utama steril.',
    };
  }

  const targetDp = dps.find((dp) => dp.orderIndex === toDpIndex);
  if (!targetDp) {
    throw new Error(`Pos DP tujuan (Indeks ${toDpIndex}) tidak valid.`);
  }

  // ATOMIC LOCK CHECK: Cek apakah target DP sudah terisi 1 tim!
  const isTargetOccupied = memoryState.participants.some(
    (p) => isTargetEvent(p.eventId) && p.currentDpId === targetDp.id && p.dpStatus === 'IN_PROGRESS' && p.id !== participantId
  );

  if (isTargetOccupied) {
    return {
      success: false,
      blocked: true,
      message: `ATOMIC LOCK AKTIF: ${targetDp.name} sedang terisi 1 tim! Tim tidak dapat dipindahkan sebelum slot tujuan bebas.`,
      targetDp,
    };
  }

  // Jika slot kosong, pindahkan tim secara atomik
  const pIndex = memoryState.participants.findIndex((p) => p.id === participantId);
  if (pIndex === -1) {
    throw new Error('Data tim peserta tidak ditemukan.');
  }

  const previousDp = dps.find((dp) => dp.id === memoryState.participants[pIndex].currentDpId);
  memoryState.participants[pIndex].currentDpId = targetDp.id;
  memoryState.participants[pIndex].dpStatus = 'IN_PROGRESS';

  memoryState.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date(),
    actor: operatorName || 'Operator DP',
    role: 'PANITIA_DP',
    action: `MOVE_TO_${targetDp.code}`,
    target: memoryState.participants[pIndex].teamName,
  });

  return {
    success: true,
    blocked: false,
    message: `Berhasil memindahkan ${memoryState.participants[pIndex].teamName} ke ${targetDp.name}. Slot ${previousDp ? previousDp.name : 'awal'} kini siap untuk tim berikutnya.`,
    participant: memoryState.participants[pIndex],
    targetDp,
  };
}

export async function resetDPMovement(eventId = 'evt-lkbb-2026') {
  const isTargetEvent = (eId) => {
    if (eId === eventId) return true;
    const isDefault1 = eId === '08007fe4-8f16-4324-b815-2cb8ead844af' || eId === 'evt-lkbb-2026' || eId === 'lkbb-nasional-2026';
    const isDefault2 = eventId === '08007fe4-8f16-4324-b815-2cb8ead844af' || eventId === 'evt-lkbb-2026' || eventId === 'lkbb-nasional-2026';
    if (isDefault1 && isDefault2) return true;

    const isForda1 = eId === '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19' || eId === 'forda';
    const isForda2 = eventId === '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19' || eventId === 'forda';
    if (isForda1 && isForda2) return true;

    return false;
  };

  const dps = memoryState.decisionPoints
    .filter((dp) => isTargetEvent(dp.eventId))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const participants = memoryState.participants.filter((p) => isTargetEvent(p.eventId));

  // Reset ke susunan awal
  if (participants[0] && dps[3]) {
    participants[0].currentDpId = dps[3].id;
    participants[0].dpStatus = 'IN_PROGRESS';
  }
  if (participants[1] && dps[1]) {
    participants[1].currentDpId = dps[1].id;
    participants[1].dpStatus = 'IN_PROGRESS';
  }
  if (participants[2] && dps[0]) {
    participants[2].currentDpId = dps[0].id;
    participants[2].dpStatus = 'IN_PROGRESS';
  }
  if (participants[3]) {
    participants[3].currentDpId = null;
    participants[3].dpStatus = 'WAITING';
  }

  for (let i = 4; i < participants.length; i++) {
    participants[i].currentDpId = null;
    participants[i].dpStatus = 'WAITING';
  }

  memoryState.auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date(),
    actor: 'Admin Panitia',
    role: 'ADMIN_PANITIA',
    action: 'RESET_DP_POSITIONS',
    target: 'Semua Pos DP Banjar',
  });

  return { success: true, message: 'Alur pos DP berhasil direset ke susunan awal.' };
}

// -------------------------------------------------------------
// JURI SCORING & LEADERBOARD
// -------------------------------------------------------------
export async function submitJuriScore({ eventId = 'evt-lkbb-2026', participantId, juriId, scores, penaltySeconds = 0 }) {
  const submission = {
    id: `sub-${Date.now()}`,
    eventId,
    participantId,
    juriId,
    scores, // { c1: 85, c2: 90, ... }
    penaltySeconds,
    submittedAt: new Date().toISOString(),
  };

  memoryState.scores.push(submission);

  return {
    success: true,
    message: 'Nilai juri berhasil tersimpan dengan aman ke sistem.',
    submission,
  };
}

export async function saveAIFeedback({ eventId = 'evt-lkbb-2026', participantId, juriId, rawTranscript, refinedText }) {
  const feedback = {
    id: `fb-${Date.now()}`,
    eventId,
    participantId,
    juriId,
    rawTranscript,
    refinedText,
    createdAt: new Date().toISOString(),
  };

  memoryState.feedbacks.push(feedback);
  return feedback;
}

export async function getLeaderboardData(eventId = 'evt-lkbb-2026') {
  const participants = memoryState.participants.filter((p) => p.eventId === eventId);
  
  // Hitung agregat skor per tim
  const leaderboard = participants.map((p, index) => {
    const teamScores = memoryState.scores.filter((s) => s.participantId === p.id);
    let totalScore = 0;
    if (teamScores.length > 0) {
      teamScores.forEach((s) => {
        const sum = Object.values(s.scores).reduce((a, b) => a + b, 0);
        totalScore += sum - (s.penaltySeconds * 2);
      });
    } else {
      // Dummy demo score jika belum ada submission
      totalScore = 365 - index * 7;
    }

    return {
      rank: index + 1,
      participantId: p.id,
      teamName: p.teamName,
      schoolName: p.schoolName,
      queueNumber: p.queueNumber,
      totalScore,
      status: p.status,
    };
  }).sort((a, b) => b.totalScore - a.totalScore)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return leaderboard;
}

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

// -------------------------------------------------------------
// POS DP MANAGEMENT & OPERATOR STAFF SERVICES
// -------------------------------------------------------------
export async function getDecisionPointsList(eventId) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const dps = await prisma.decisionPoint.findMany({
        where: { eventId: targetEventId },
        orderBy: { orderIndex: 'asc' },
      });
      return dps;
    },
    async () => {
      let filtered = memoryState.decisionPoints.filter(
        (dp) => dp.eventId === eventId || dp.eventId === '08007fe4-8f16-4324-b815-2cb8ead844af'
      );
      if (filtered.length === 0) {
        filtered = [
          { id: 1, eventId, orderIndex: 1, code: 'DOC_CHECK', name: 'DP 1 — Pengecekan Dokumen dan Berkas', sop: 'Verifikasi berkas fisik kontingen, surat mandat, kartu tanda pelajar sah, dan pemeriksaan daftar nama anggota peleton.', capacityLimit: 1, isActive: true },
          { id: 2, eventId, orderIndex: 2, code: 'PHOTOSHOOT', name: 'DP 2 — Photoshoot Pasukan', sop: 'Sesi dokumentasi foto resmi peleton lengkap di backdrop resmi dan pemeriksaan kesesuaian nomor dada/atribut.', capacityLimit: 1, isActive: true },
          { id: 3, eventId, orderIndex: 3, code: 'FINAL_PREP', name: 'DP 3 — Daerah Persiapan dan Pemanasan', sop: 'Peregangan, pemanasan langkah perlahan, sinkronisasi aba-aba komandan peleton, dan persiapan memasuki panggung.', capacityLimit: 1, isActive: true },
          { id: 4, eventId, orderIndex: 4, code: 'STAGE_PERFORMANCE', name: 'DP 4 — Panggung Utama', sop: 'Peleton tampil di arena pertandingan dinilai langsung oleh Dewan Juri secara real-time.', capacityLimit: 1, isActive: true },
        ];
        memoryState.decisionPoints.push(...filtered);
      }
      return filtered.sort((a, b) => a.orderIndex - b.orderIndex);
    }
  );
}

export async function saveDecisionPointsList(eventId, dpsList) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      await prisma.decisionPoint.deleteMany({ where: { eventId: targetEventId } });
      const created = await Promise.all(
        dpsList.map((dp, idx) =>
          prisma.decisionPoint.create({
            data: {
              eventId: targetEventId,
              orderIndex: idx + 1,
              code: dp.code || (dp.name?.toLowerCase().includes('dokumen') ? 'DOC_CHECK' : dp.name?.toLowerCase().includes('photo') ? 'PHOTOSHOOT' : dp.name?.toLowerCase().includes('persiapan') ? 'FINAL_PREP' : 'STAGE_PERFORMANCE'),
              name: dp.name,
              capacityLimit: 1,
              isActive: true,
            },
          })
        )
      );
      return created;
    },
    async () => {
      memoryState.decisionPoints = memoryState.decisionPoints.filter((dp) => dp.eventId !== eventId);
      const newDps = dpsList.map((dp, idx) => ({
        id: dp.id || idx + 1,
        eventId,
        orderIndex: idx + 1,
        code: dp.code || (dp.name?.toLowerCase().includes('dokumen') ? 'DOC_CHECK' : dp.name?.toLowerCase().includes('photo') ? 'PHOTOSHOOT' : dp.name?.toLowerCase().includes('persiapan') ? 'FINAL_PREP' : 'STAGE_PERFORMANCE'),
        name: dp.name,
        sop: dp.sop || 'SOP Pos Operasional',
        capacityLimit: 1,
        isActive: true,
      }));
      memoryState.decisionPoints.push(...newDps);
      return newDps;
    }
  );
}

export async function getDPStaffList(eventId) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const uEvents = await prisma.userEvent.findMany({
        where: { eventId: targetEventId, role: 'PANITIA_DP', isActive: true },
        include: { user: true, assignedDp: true },
      });
      return uEvents.map((ue) => ({
        id: ue.id,
        userId: ue.userId,
        name: ue.user.fullName,
        email: ue.user.email,
        assignedDpId: ue.assignedDpId ? (isNaN(Number(ue.assignedDpId)) ? ue.assignedDpId : Number(ue.assignedDpId)) : 1,
        status: ue.isActive ? 'AKTIF' : 'NONAKTIF',
      }));
    },
    async () => {
      let filtered = memoryState.dpStaff.filter((s) => s.eventId === eventId || s.eventId === 'evt-lkbb-2026');
      return filtered;
    }
  );
}

export async function createDPStaff(eventId, { name, email, assignedDpId, password = 'password123' }) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const user = await prisma.user.upsert({
        where: { email },
        update: { fullName: name },
        create: {
          email,
          fullName: name,
          passwordHash: bcrypt.hashSync(password, 10),
          globalRole: 'USER',
        },
      });
      const ue = await prisma.userEvent.upsert({
        where: {
          userId_eventId_role: {
            userId: user.id,
            eventId: targetEventId,
            role: 'PANITIA_DP',
          },
        },
        update: { assignedDpId: String(assignedDpId), isActive: true },
        create: {
          userId: user.id,
          eventId: targetEventId,
          role: 'PANITIA_DP',
          assignedDpId: String(assignedDpId),
          isActive: true,
        },
      });
      const cleanAssignedId = assignedDpId ? (isNaN(Number(assignedDpId)) ? String(assignedDpId) : Number(assignedDpId)) : 1;
      return { id: ue.id, name, email, assignedDpId: cleanAssignedId, status: 'AKTIF' };
    },
    async () => {
      const cleanAssignedId = assignedDpId ? (isNaN(Number(assignedDpId)) ? String(assignedDpId) : Number(assignedDpId)) : 1;
      const newStaff = {
        id: `staff-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        assignedDpId: cleanAssignedId,
        eventId,
        status: 'AKTIF',
      };
      memoryState.dpStaff.push(newStaff);
      return newStaff;
    }
  );
}

export async function updateDPStaff(staffId, { name, email, assignedDpId, status }) {
  return withDbFallback(
    async () => {
      const ue = await prisma.userEvent.findUnique({
        where: { id: staffId },
        include: { user: true },
      });
      if (ue) {
        if (name || email) {
          await prisma.user.update({
            where: { id: ue.userId },
            data: {
              ...(name && { fullName: name }),
              ...(email && { email }),
            },
          });
        }
        const updatedUe = await prisma.userEvent.update({
          where: { id: staffId },
          data: {
            ...(assignedDpId !== undefined && { assignedDpId: String(assignedDpId) }),
            ...(status !== undefined && { isActive: status === 'AKTIF' }),
          },
        });
        const rawAssignedId = assignedDpId !== undefined ? assignedDpId : ue.assignedDpId;
        const cleanAssignedId = rawAssignedId ? (isNaN(Number(rawAssignedId)) ? String(rawAssignedId) : Number(rawAssignedId)) : 1;
        return {
          id: staffId,
          name: name || ue.user.fullName,
          email: email || ue.user.email,
          assignedDpId: cleanAssignedId,
          status: status || (updatedUe.isActive ? 'AKTIF' : 'NONAKTIF'),
        };
      }
      throw new Error('Petugas tidak ditemukan.');
    },
    async () => {
      const idx = memoryState.dpStaff.findIndex((s) => s.id === staffId);
      if (idx === -1) throw new Error('Petugas tidak ditemukan.');
      const cleanAssignedId = assignedDpId !== undefined ? (isNaN(Number(assignedDpId)) ? String(assignedDpId) : Number(assignedDpId)) : undefined;
      memoryState.dpStaff[idx] = {
        ...memoryState.dpStaff[idx],
        ...(name && { name }),
        ...(email && { email }),
        ...(cleanAssignedId !== undefined && { assignedDpId: cleanAssignedId }),
        ...(status && { status }),
      };
      return memoryState.dpStaff[idx];
    }
  );
}

export async function deleteDPStaff(staffId) {
  return withDbFallback(
    async () => {
      await prisma.userEvent.delete({ where: { id: staffId } });
      return { success: true, id: staffId };
    },
    async () => {
      const idx = memoryState.dpStaff.findIndex((s) => s.id === staffId);
      if (idx === -1) throw new Error('Petugas tidak ditemukan.');
      const removed = memoryState.dpStaff.splice(idx, 1);
      return { success: true, deleted: removed[0] };
    }
  );
}

// -------------------------------------------------------------
// KHUSUS POS PENGECEKAN DOKUMEN (DOC_CHECK)
// Siapapun petugas yang ditugaskan di Pos Dokumen ini melihat semua berkas peserta event
// -------------------------------------------------------------
export async function getDocCheckParticipants(eventId = 'evt-lkbb-2026') {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const participants = await prisma.participant.findMany({
        where: { eventId: targetEventId },
        include: {
          documents: true,
          members: true,
        },
        orderBy: { queueNumber: 'asc' },
      });
      return participants;
    },
    async () => {
      const isTargetEvent = (eId) => {
        if (eId === eventId) return true;
        const isDefault1 = eId === '08007fe4-8f16-4324-b815-2cb8ead844af' || eId === 'evt-lkbb-2026' || eId === 'lkbb-nasional-2026';
        const isDefault2 = eventId === '08007fe4-8f16-4324-b815-2cb8ead844af' || eventId === 'evt-lkbb-2026' || eventId === 'lkbb-nasional-2026';
        if (isDefault1 && isDefault2) return true;

        const isForda1 = eId === '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19' || eId === 'forda';
        const isForda2 = eventId === '0b85acba-5fc6-4861-b0ce-e35a3bf4cc19' || eventId === 'forda';
        if (isForda1 && isForda2) return true;

        return false;
      };
      const participants = memoryState.participants.filter(
        (p) => isTargetEvent(p.eventId)
      );
      return participants.map((p) => ({
        id: p.id,
        teamName: p.teamName,
        schoolName: p.schoolName,
        queueNumber: p.queueNumber,
        scheduledTime: p.scheduledTime,
        status: p.status,
        currentDpId: p.currentDpId,
        dpStatus: p.dpStatus,
        docs: p.docs,
        revisionNote: p.revisionNote,
        documents: [
          {
            id: 'doc-1',
            title: 'File Kartu Pelajar (Kolektif Anggota)',
            fileName: p.docs?.kartuPelajar?.name || '16_Kartu_Pelajar_Pasukan.pdf',
            status: p.docs?.kartuPelajar?.status === 'VALIDATED' ? 'VERIFIED' : p.docs?.kartuPelajar?.status === 'REVISION' ? 'REVISION' : 'VERIFIED',
            size: '3.4 MB',
          },
          {
            id: 'doc-2',
            title: 'File Surat Rekomendasi / Pengantar Sekolah',
            fileName: p.docs?.suratTugas?.name || 'Surat_Tugas_Kepsek_SMAN1.pdf',
            status: p.docs?.suratTugas?.status === 'VALIDATED' ? 'VERIFIED' : 'VERIFIED',
            size: '1.2 MB',
          },
          {
            id: 'doc-3',
            title: 'Formulir Pendaftaran & Pakta Integritas Kontingen',
            fileName: p.docs?.suratDokter?.name || 'Formulir_Pakta_Integritas.pdf',
            status: p.docs?.suratDokter?.status === 'REVISION' ? 'REVISION' : 'VERIFIED',
            size: '840 KB',
            note: p.revisionNote || '',
          },
        ],
      }));
    }
  );
}

// -------------------------------------------------------------
// DEWAN JURI (PANEL PENJURIAN) SERVICES
// -------------------------------------------------------------
export const STANDARD_JUDGES_TEMPLATE = [
  {
    name: 'Kolonel (Purn) Bambang S., M.Pd',
    role: 'Ketua Dewan Juri (Juri 1)',
    category: 'PBB Murni',
    specialties: ['PBB Murni', 'Komandan Peleton'],
    institution: 'Purna Paskibra Indonesia (PPI Pusat)',
    pin: '8821',
    status: 'AKTIF',
    email: 'juri1@kompas.id',
  },
  {
    name: 'Mayor Aris Setiawan',
    role: 'Anggota Dewan Juri (Juri 2)',
    category: 'PBB Murni',
    specialties: ['PBB Murni'],
    institution: 'Dispora & Kodam Jaya',
    pin: '4412',
    status: 'AKTIF',
    email: 'juri2@kompas.id',
  },
  {
    name: 'Kapten Kav. Hendra Gunawan',
    role: 'Anggota Dewan Juri (Juri 3)',
    category: 'PBB Murni',
    specialties: ['PBB Murni'],
    institution: 'Pusdiklat Paskibraka Nasional',
    pin: '9120',
    status: 'AKTIF',
    email: 'juri3@kompas.id',
  },
  {
    name: 'Dra. Endang Lestari',
    role: 'Anggota Dewan Juri (Juri 4)',
    category: 'Formasi & Variasi',
    specialties: ['Formasi & Variasi'],
    institution: 'Instruktur Koreografi & Tari Nasional',
    pin: '3318',
    status: 'AKTIF',
    email: 'juri4@kompas.id',
  },
  {
    name: 'Rian Syahputra, S.Sn',
    role: 'Anggota Dewan Juri (Juri 5)',
    category: 'Formasi & Variasi',
    specialties: ['Formasi & Variasi', 'Kerapihan & Kostum'],
    institution: 'Akademi Seni & Budaya Indonesia',
    pin: '7729',
    status: 'AKTIF',
    email: 'juri5@kompas.id',
  },
];

export function normalizeScoringCategory(cat) {
  if (!cat) return 'PBB';
  const upper = String(cat).toUpperCase().trim();
  if (upper === 'PBB' || upper.includes('PBB')) return 'PBB';
  if (upper.includes('VARIASI') || upper.includes('FORMASI')) return 'VARIASI & FORMASI';
  if (upper.includes('DANTON') || upper.includes('PELETON') || upper.includes('KOMANDAN')) return 'DANTON';
  if (
    upper.includes('KOSTUM') ||
    upper.includes('MAKE UP') ||
    upper.includes('MAKEUP') ||
    upper.includes('KERAPIHAN')
  ) {
    return 'MAKE UP / KOSTUM';
  }
  return 'PBB';
}

export function normalizeJudgeSpecialties(specialties, fallbackCategory = 'PBB') {
  let list = [];
  if (Array.isArray(specialties)) {
    list = specialties;
  } else if (typeof specialties === 'string' && specialties.trim()) {
    try {
      const parsed = JSON.parse(specialties);
      list = Array.isArray(parsed) ? parsed : [specialties];
    } catch {
      list = specialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  const normalized = Array.from(
    new Set(list.map((c) => normalizeScoringCategory(c)).filter(Boolean))
  );
  if (normalized.length > 0) return normalized;
  return [normalizeScoringCategory(fallbackCategory)];
}

export async function getJudgesList(eventId) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const uEvents = await prisma.userEvent.findMany({
        where: { eventId: targetEventId, role: 'JURI' },
        include: { user: true },
        orderBy: { assignedAt: 'asc' },
      });
      if (uEvents.length === 0) {
        return getJudgesListMemory(targetEventId);
      }
      return uEvents.map((ue, idx) => {
        const mem = memoryState.judges.find(
          (j) => j.id === ue.id || j.userId === ue.userId || j.email === ue.user.email
        );
        const fallbackCat = mem?.category || (idx < 3 ? 'PBB' : 'VARIASI & FORMASI');
        const specialties = normalizeJudgeSpecialties(
          ue.judgeSpecialties || mem?.specialties,
          fallbackCat
        );
        return {
          id: ue.id,
          userId: ue.userId,
          name: ue.user.fullName,
          email: ue.user.email,
          role:
            ue.judgeRole ||
            mem?.role ||
            (idx === 0 ? 'Ketua Dewan Juri (Juri 1)' : `Anggota Dewan Juri (Juri ${idx + 1})`),
          category: specialties.join(' & '),
          specialties,
          institution: ue.judgeInstitution || mem?.institution || 'Dewan Juri Nasional',
          pin: mem?.pin || ue.user.phone || '8821',
          status: ue.isActive ? 'AKTIF' : 'NONAKTIF',
        };
      });
    },
    async () => {
      return getJudgesListMemory(eventId);
    }
  );
}

function getJudgesListMemory(eventId) {
  let filtered = memoryState.judges.filter(
    (j) => j.eventId === eventId || j.eventId === 'evt-lkbb-2026' || j.eventId === '08007fe4-8f16-4324-b815-2cb8ead844af'
  );
  if (filtered.length === 0) {
    filtered = STANDARD_JUDGES_TEMPLATE.map((tpl, idx) => ({
      id: `juri-${idx + 1}`,
      eventId,
      ...tpl,
    }));
    memoryState.judges.push(...filtered);
  }
  return filtered.map((j) => {
    const specialties = normalizeJudgeSpecialties(j.specialties, j.category);
    return {
      ...j,
      specialties,
      category: specialties.join(' & '),
    };
  });
}

export async function createJudge(eventId, { name, role, category, specialties, institution, pin, email, status = 'AKTIF' }) {
  const cleanEmail = email && email.trim() ? email.trim() : `juri.${Date.now()}@kompas.id`;
  const cleanPin = pin && pin.trim() ? pin.trim() : String(Math.floor(1000 + Math.random() * 9000));
  const normalizedSpecialties = normalizeJudgeSpecialties(specialties, category || 'PBB');
  const displayCategory = normalizedSpecialties.join(' & ');
  const cleanRole = role || 'Anggota Dewan Juri';
  const cleanInstitution = institution || 'Dewan Juri Nasional';

  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      const user = await prisma.user.upsert({
        where: { email: cleanEmail },
        update: { fullName: name, phone: cleanPin },
        create: {
          email: cleanEmail,
          fullName: name,
          phone: cleanPin,
          passwordHash: bcrypt.hashSync('juri1234', 10),
          globalRole: 'USER',
        },
      });
      const ue = await prisma.userEvent.upsert({
        where: {
          userId_eventId_role: {
            userId: user.id,
            eventId: targetEventId,
            role: 'JURI',
          },
        },
        update: {
          isActive: status === 'AKTIF',
          judgeRole: cleanRole,
          judgeInstitution: cleanInstitution,
          judgeSpecialties: JSON.stringify(normalizedSpecialties),
        },
        create: {
          userId: user.id,
          eventId: targetEventId,
          role: 'JURI',
          isActive: status === 'AKTIF',
          judgeRole: cleanRole,
          judgeInstitution: cleanInstitution,
          judgeSpecialties: JSON.stringify(normalizedSpecialties),
        },
      });

      const judgeRecord = {
        id: ue.id,
        userId: user.id,
        eventId: targetEventId,
        name: name.trim(),
        role: cleanRole,
        category: displayCategory,
        specialties: normalizedSpecialties,
        institution: cleanInstitution,
        pin: cleanPin,
        email: cleanEmail,
        status: status || 'AKTIF',
      };

      memoryState.judges.push(judgeRecord);
      return judgeRecord;
    },
    async () => {
      const judgeRecord = {
        id: `juri-${Date.now()}`,
        eventId,
        name: name.trim(),
        role: cleanRole,
        category: displayCategory,
        specialties: normalizedSpecialties,
        institution: cleanInstitution,
        pin: cleanPin,
        email: cleanEmail,
        status: status || 'AKTIF',
      };
      memoryState.judges.push(judgeRecord);
      return judgeRecord;
    }
  );
}

export async function updateJudge(judgeId, updateData) {
  const { name, role, category, specialties, institution, pin, email, status } = updateData;
  const hasSpecialtyUpdate = specialties !== undefined || category !== undefined;
  const normalizedSpecialties = hasSpecialtyUpdate
    ? normalizeJudgeSpecialties(specialties, category || 'PBB')
    : undefined;
  const displayCategory = normalizedSpecialties ? normalizedSpecialties.join(' & ') : undefined;

  return withDbFallback(
    async () => {
      const ue = await prisma.userEvent.findUnique({
        where: { id: judgeId },
        include: { user: true },
      });
      if (ue) {
        if (name || pin || email) {
          await prisma.user.update({
            where: { id: ue.userId },
            data: {
              ...(name && { fullName: name }),
              ...(pin && { phone: pin }),
              ...(email && { email }),
            },
          });
        }
        const ueUpdateData = {};
        if (status !== undefined) ueUpdateData.isActive = status === 'AKTIF';
        if (role !== undefined) ueUpdateData.judgeRole = role;
        if (institution !== undefined) ueUpdateData.judgeInstitution = institution;
        if (normalizedSpecialties !== undefined) {
          ueUpdateData.judgeSpecialties = JSON.stringify(normalizedSpecialties);
        }
        if (Object.keys(ueUpdateData).length > 0) {
          await prisma.userEvent.update({
            where: { id: judgeId },
            data: ueUpdateData,
          });
        }
      }

      const memIdx = memoryState.judges.findIndex((j) => j.id === judgeId || (ue && j.userId === ue.userId));
      const mergedSpecialties =
        normalizedSpecialties ||
        normalizeJudgeSpecialties(
          ue?.judgeSpecialties || (memIdx !== -1 ? memoryState.judges[memIdx].specialties : null),
          category || (memIdx !== -1 ? memoryState.judges[memIdx].category : 'PBB')
        );

      if (memIdx !== -1) {
        memoryState.judges[memIdx] = {
          ...memoryState.judges[memIdx],
          ...updateData,
          specialties: mergedSpecialties,
          category: mergedSpecialties.join(' & '),
        };
        return memoryState.judges[memIdx];
      }

      return {
        id: judgeId,
        userId: ue?.userId,
        name: name || ue?.user.fullName,
        email: email || ue?.user.email,
        role: role || ue?.judgeRole || 'Anggota Dewan Juri',
        category: displayCategory || mergedSpecialties.join(' & '),
        specialties: mergedSpecialties,
        institution: institution !== undefined ? institution : ue?.judgeInstitution || '',
        pin: pin || ue?.user.phone || '8821',
        status: status || (ue?.isActive ? 'AKTIF' : 'NONAKTIF'),
      };
    },
    async () => {
      const idx = memoryState.judges.findIndex((j) => j.id === judgeId);
      if (idx === -1) throw new Error('Dewan Juri tidak ditemukan.');
      const mergedSpecialties =
        normalizedSpecialties ||
        normalizeJudgeSpecialties(memoryState.judges[idx].specialties, memoryState.judges[idx].category);
      memoryState.judges[idx] = {
        ...memoryState.judges[idx],
        ...updateData,
        specialties: mergedSpecialties,
        category: mergedSpecialties.join(' & '),
      };
      return memoryState.judges[idx];
    }
  );
}

export async function deleteJudge(judgeId) {
  return withDbFallback(
    async () => {
      await prisma.userEvent.deleteMany({
        where: { id: judgeId },
      });
      memoryState.judges = memoryState.judges.filter((j) => j.id !== judgeId);
      return { success: true };
    },
    async () => {
      memoryState.judges = memoryState.judges.filter((j) => j.id !== judgeId);
      return { success: true };
    }
  );
}

export async function resetStandardJudges(eventId) {
  return withDbFallback(
    async () => {
      const ev = await prisma.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }] },
      });
      const targetEventId = ev ? ev.id : eventId;
      await prisma.userEvent.deleteMany({
        where: { eventId: targetEventId, role: 'JURI' },
      });
      memoryState.judges = memoryState.judges.filter((j) => j.eventId !== targetEventId);

      const created = [];
      for (let i = 0; i < STANDARD_JUDGES_TEMPLATE.length; i++) {
        const item = STANDARD_JUDGES_TEMPLATE[i];
        const res = await createJudge(targetEventId, item);
        created.push(res);
      }
      return created;
    },
    async () => {
      memoryState.judges = memoryState.judges.filter((j) => j.eventId !== eventId);
      const created = STANDARD_JUDGES_TEMPLATE.map((tpl, idx) => ({
        id: `juri-${Date.now()}-${idx + 1}`,
        eventId,
        ...tpl,
      }));
      memoryState.judges.push(...created);
      return created;
    }
  );
}

async function resolveCanonicalEventForJuri(eventId) {
  const normalizedId =
    !eventId || eventId === 'evt-lkbb-2026' ? 'lkbb-nasional-2026' : eventId;
  const ev = await getEventBySlugOrId(normalizedId);
  if (ev) {
    return {
      id: ev.id,
      name: ev.name,
      slug: ev.slug,
      status: ev.status,
      scoringLocked: Boolean(ev.scoringLocked),
      dpFlowLocked: Boolean(ev.dpFlowLocked),
    };
  }
  const fallback =
    memoryState.events.find(
      (e) => e.id === normalizedId || e.slug === normalizedId
    ) || memoryState.events[0];
  return {
    id: fallback?.id || eventId || '08007fe4-8f16-4324-b815-2cb8ead844af',
    name: fallback?.name || 'LKBB Nasional Paskibra 2026',
    slug: fallback?.slug || 'lkbb-nasional-2026',
    status: fallback?.status || 'REGISTRATION_OPEN',
    scoringLocked: Boolean(fallback?.scoringLocked),
    dpFlowLocked: Boolean(fallback?.dpFlowLocked),
  };
}

function sanitizeJudgeProfile(judge, fallbackEventId) {
  if (!judge) return null;
  const { pin, ...safeJudge } = judge;
  return {
    ...safeJudge,
    eventId: judge.eventId || fallbackEventId,
  };
}

export async function verifyJudgePIN(eventId, pin) {
  const canonicalEvent = await resolveCanonicalEventForJuri(eventId);
  const judges = await getJudgesList(canonicalEvent.id);
  const cleanPin = String(pin || '').trim();
  const found = judges.find(
    (j) => String(j.pin || '').trim() === cleanPin && j.status === 'AKTIF'
  );
  if (!found) {
    return { success: false, message: 'PIN Dewan Juri tidak valid atau status juri nonaktif.' };
  }

  let resolvedUser = found.email ? await findUserByEmail(found.email) : null;
  let resolvedUserId = found.userId || resolvedUser?.id;

  // Pastikan user & penugasan JURI tersedia di memoryState saat mode fallback
  if (!resolvedUser) {
    const memUserId = resolvedUserId || `usr-${found.id}`;
    const existingMemUser = memoryState.users.find(
      (u) => u.id === memUserId || (found.email && u.email.toLowerCase() === found.email.toLowerCase())
    );
    if (existingMemUser) {
      resolvedUser = existingMemUser;
      resolvedUserId = existingMemUser.id;
    } else {
      const newMemUser = {
        id: memUserId,
        email: found.email || `${found.id}@kompas.id`,
        passwordHash: defaultPasswordHash,
        fullName: found.name,
        phone: cleanPin,
        globalRole: 'USER',
        isActive: true,
        createdAt: new Date(),
      };
      memoryState.users.push(newMemUser);
      resolvedUser = newMemUser;
      resolvedUserId = newMemUser.id;
    }

    const hasMemAssignment = memoryState.userEvents.some(
      (ue) => ue.userId === resolvedUserId && ue.eventId === canonicalEvent.id && ue.role === 'JURI'
    );
    if (!hasMemAssignment) {
      memoryState.userEvents.push({
        id: `ue-${found.id}-${Date.now()}`,
        userId: resolvedUserId,
        eventId: canonicalEvent.id,
        role: 'JURI',
        assignedDpId: null,
        isActive: true,
      });
    }
  }

  const assignedRoles = (resolvedUser?.userEvents || [])
    .filter((ue) => ue.isActive !== false)
    .map((ue) => ({
      eventId: ue.eventId,
      role: ue.role,
      assignedDpId: ue.assignedDpId || null,
    }));

  if (!assignedRoles.some((r) => r.eventId === canonicalEvent.id && r.role === 'JURI')) {
    assignedRoles.push({
      eventId: canonicalEvent.id,
      role: 'JURI',
      assignedDpId: null,
    });
  }

  return {
    success: true,
    judge: sanitizeJudgeProfile(
      {
        ...found,
        userId: resolvedUserId,
        email: found.email || resolvedUser?.email,
        eventId: canonicalEvent.id,
      },
      canonicalEvent.id
    ),
    event: canonicalEvent,
    assignedRoles,
  };
}

export async function getJudgeSessionProfile(userId, email, eventId) {
  const canonicalEvent = await resolveCanonicalEventForJuri(eventId);
  const [user, judges] = await Promise.all([
    userId ? findUserById(userId) : email ? findUserByEmail(email) : null,
    getJudgesList(canonicalEvent.id),
  ]);

  const normalizedEmail = (email || user?.email || '').toLowerCase();
  const matchedJudge = judges.find(
    (j) =>
      (userId && (j.userId === userId || j.id === userId)) ||
      (normalizedEmail && j.email && j.email.toLowerCase() === normalizedEmail)
  );

  const judgeProfile = matchedJudge
    ? sanitizeJudgeProfile(
        {
          ...matchedJudge,
          userId: matchedJudge.userId || user?.id || userId,
          email: matchedJudge.email || user?.email || email,
          eventId: canonicalEvent.id,
        },
        canonicalEvent.id
      )
    : user
    ? {
        id: user.id,
        userId: user.id,
        eventId: canonicalEvent.id,
        name: user.fullName,
        email: user.email,
        role: user.globalRole === 'SUPER_ADMIN' ? 'Supervisi Dewan Juri (Super Admin)' : 'Dewan Juri',
        category: 'PBB Murni',
        specialties: ['PBB Murni'],
        institution: 'Dewan Juri Resmi',
        status: user.isActive ? 'AKTIF' : 'NONAKTIF',
      }
    : null;

  const assignedEvents = (user?.userEvents || [])
    .filter((ue) => ue.role === 'JURI' && ue.isActive !== false)
    .map((ue) => ({
      userEventId: ue.id,
      eventId: ue.eventId,
      eventName: ue.event?.name || canonicalEvent.name,
      eventSlug: ue.event?.slug || canonicalEvent.slug,
      eventStatus: ue.event?.status || canonicalEvent.status,
      role: ue.role,
    }));

  return {
    judge: judgeProfile,
    event: canonicalEvent,
    assignedEvents,
  };
}

export async function getJuriParticipantsData(eventId, judgeUserId = null, categoryFilter = null) {
  const canonicalEvent = await resolveCanonicalEventForJuri(eventId);
  const defaultEventAliases = [
    'evt-lkbb-2026',
    '08007fe4-8f16-4324-b815-2cb8ead844af',
    'lkbb-nasional-2026',
  ];
  const isTargetMemoryEvent = (eId) => {
    if (eId === canonicalEvent.id || eId === eventId) return true;
    return (
      defaultEventAliases.includes(eId) &&
      (defaultEventAliases.includes(canonicalEvent.id) || defaultEventAliases.includes(eventId))
    );
  };

  const formatPosInfo = (orderIndex, dpName, dpStatus) => {
    if (dpStatus === 'FINISHED' || (dpStatus === 'COMPLETED' && orderIndex >= 4)) {
      return {
        currentPos: 'SELESAI',
        posLabel: 'Selesai Tampil di Arena',
        dpStatus: 'COMPLETED',
      };
    }
    if (orderIndex) {
      const code = `POS 0${orderIndex}`;
      return {
        currentPos: code,
        posLabel: dpName || `${code} — Pos Operasional`,
        dpStatus: dpStatus || 'IN_PROGRESS',
      };
    }
    return {
      currentPos: 'AREA TUNGGU',
      posLabel: 'Menunggu Panggilan di DP 1',
      dpStatus: dpStatus || 'WAITING',
    };
  };

  const buildResult = (rawList) => {
    const categoriesSet = new Set();
    rawList.forEach((p) => {
      if (p.category) categoriesSet.add(p.category);
    });
    const categories = Array.from(categoriesSet);

    const normalizedFilter = categoryFilter && categoryFilter !== 'ALL'
      ? String(categoryFilter).trim().toLowerCase()
      : null;

    const participants = normalizedFilter
      ? rawList.filter((p) => String(p.category || '').trim().toLowerCase() === normalizedFilter)
      : rawList;

    return {
      event: canonicalEvent,
      categories,
      participants,
      total: participants.length,
      totalAll: rawList.length,
    };
  };

  return withDbFallback(
    async () => {
      const dbParticipants = await prisma.participant.findMany({
        where: { eventId: canonicalEvent.id },
        include: {
          members: true,
          journeys: {
            include: { decisionPoint: true },
            orderBy: { enteredAt: 'desc' },
          },
          scores: judgeUserId
            ? { where: { judgeId: judgeUserId } }
            : true,
          feedbacks: judgeUserId
            ? { where: { judgeId: judgeUserId }, orderBy: { createdAt: 'desc' } }
            : { orderBy: { createdAt: 'desc' } },
        },
        orderBy: [{ queueNumber: 'asc' }, { createdAt: 'asc' }],
      });

      const mapped = dbParticipants.map((p, idx) => {
        const dantonMember =
          p.members?.find((m) => String(m.roleInTeam || '').toUpperCase() === 'DANTON') ||
          p.members?.[0];

        const activeJourney =
          p.journeys?.find((j) => j.status === 'IN_PROGRESS') ||
          p.journeys?.[0] ||
          null;

        const posInfo = activeJourney?.decisionPoint
          ? formatPosInfo(
              activeJourney.decisionPoint.orderIndex,
              activeJourney.decisionPoint.name,
              activeJourney.status
            )
          : formatPosInfo(null, null, 'WAITING');

        const judgeScores = p.scores || [];
        const latestFeedback = p.feedbacks?.[0] || null;
        const scoresMap = {};
        let judgeTotal = 0;
        judgeScores.forEach((s) => {
          scoresMap[s.criterionId] = s.scoreValue;
          judgeTotal += Number(s.scoreValue) || 0;
        });

        const hasJudgeScored = judgeScores.length > 0;
        const isScored = hasJudgeScored || p.status === 'SCORED' || p.status === 'FINALIZED';
        const resolvedTotal = hasJudgeScored
          ? judgeTotal
          : p.totalScore !== null && p.totalScore !== undefined
          ? p.totalScore
          : null;

        const scoredAtRaw = judgeScores[0]?.createdAt || latestFeedback?.sentAt || latestFeedback?.createdAt;
        const scoredAt = scoredAtRaw
          ? new Date(scoredAtRaw).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '';

        return {
          id: p.id,
          eventId: p.eventId,
          level: p.category || 'Umum',
          category: p.category || 'Umum',
          orderNumber:
            p.queueNumber !== null && p.queueNumber !== undefined
              ? String(p.queueNumber).padStart(2, '0')
              : String(idx + 1).padStart(2, '0'),
          queueNumber: p.queueNumber ?? idx + 1,
          registrationNumber: p.registrationNumber || '',
          school: p.schoolName,
          teamName: p.teamName,
          danton: dantonMember?.fullName || 'Komandan Peleton',
          members: p.members?.length || 16,
          regStatus: p.status,
          performanceTime: p.performanceTime,
          currentPos: posInfo.currentPos,
          posLabel: posInfo.posLabel,
          dpStatus: posInfo.dpStatus,
          isScored,
          totalScore: resolvedTotal,
          feedbackStatus: latestFeedback?.status || null,
          scoreData: isScored
            ? {
                scores: scoresMap,
                feedback: latestFeedback?.refinedText || latestFeedback?.rawTranscript || '',
                scoredAt,
              }
            : null,
        };
      });

      return buildResult(mapped);
    },
    async () => {
      const memDps = memoryState.decisionPoints.filter((dp) => isTargetMemoryEvent(dp.eventId));
      const memParticipants = memoryState.participants.filter((p) => isTargetMemoryEvent(p.eventId));
      const defaultCategory =
        canonicalEvent.slug === 'forda' ? 'Tingkat Jawa Tengah' : 'SMA/SMK Sederajat';

      const mapped = memParticipants.map((p, idx) => {
        const dp = memDps.find((d) => d.id === p.currentDpId);
        const posInfo = formatPosInfo(dp?.orderIndex || null, dp?.name || null, p.dpStatus);

        const judgeSubmissions = memoryState.scores.filter(
          (s) => s.participantId === p.id && (!judgeUserId || s.juriId === judgeUserId)
        );
        const latestSubmission = judgeSubmissions[judgeSubmissions.length - 1] || null;
        const latestFeedback =
          memoryState.feedbacks
            .filter((f) => f.participantId === p.id && (!judgeUserId || f.juriId === judgeUserId))
            .slice(-1)[0] || null;

        const isScored = Boolean(latestSubmission) || p.status === 'SCORED' || p.status === 'FINALIZED';
        const totalScore = latestSubmission
          ? Object.values(latestSubmission.scores || {}).reduce((sum, v) => sum + (Number(v) || 0), 0)
          : p.totalScore ?? null;

        const scoredAtRaw = latestSubmission?.submittedAt || latestFeedback?.createdAt;
        const scoredAt = scoredAtRaw
          ? new Date(scoredAtRaw).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '';

        return {
          id: p.id,
          eventId: canonicalEvent.id,
          level: p.category || defaultCategory,
          category: p.category || defaultCategory,
          orderNumber: p.queueNumber ? String(p.queueNumber).padStart(2, '0') : String(idx + 1).padStart(2, '0'),
          queueNumber: Number(p.queueNumber) || idx + 1,
          registrationNumber: p.registrationNumber || '',
          school: p.schoolName,
          teamName: p.teamName,
          danton: p.danton || 'Komandan Peleton',
          members: p.members || 16,
          regStatus: p.status,
          performanceTime: p.scheduledTime || null,
          currentPos: posInfo.currentPos,
          posLabel: posInfo.posLabel,
          dpStatus: posInfo.dpStatus,
          isScored,
          totalScore,
          feedbackStatus: latestFeedback?.status || null,
          scoreData: isScored
            ? {
                scores: latestSubmission?.scores || {},
                feedback: latestFeedback?.refinedText || latestFeedback?.rawTranscript || '',
                scoredAt,
              }
            : null,
        };
      });

      return buildResult(mapped);
    }
  );
}

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
        const normalizedCat = normalizeScoringCategory(c.category || mem?.category || 'PBB');
        const sortedOptions =
          c.options && c.options.length > 0
            ? c.options.map((o) => o.scoreValue).sort((a, b) => a - b)
            : mem?.options || [70, 75, 80, 85, 90, 95, 100];
        return {
          id: c.id,
          eventId: c.eventId,
          name: c.name,
          category: normalizedCat,
          orderIndex: c.orderIndex,
          minScore: c.minScore,
          maxScore: c.maxScore,
          intervalStep: c.intervalStep,
          weight: c.weight,
          isMandatory: mem?.isMandatory !== false,
          description: c.description || mem?.description || '',
          options: sortedOptions,
          assignedJudges: mem?.assignedJudges || [],
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

      const normalizedCategory = normalizeScoringCategory(category);
      const record = await prisma.scoringCriterion.create({
        data: {
          eventId: targetEventId,
          name: name.trim(),
          category: normalizedCategory,
          description: description || '',
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
        category: normalizedCategory,
        orderIndex: record.orderIndex,
        minScore: record.minScore,
        maxScore: record.maxScore,
        intervalStep: record.intervalStep,
        weight: record.weight,
        isMandatory,
        description: record.description || description || '',
        options: record.options?.map((o) => o.scoreValue).sort((a, b) => a - b) || options,
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
      const { name, category, description, minScore, maxScore, intervalStep, weight, options } = updateData;
      const normalizedCat = category !== undefined ? normalizeScoringCategory(category) : undefined;
      await prisma.scoringCriterion.updateMany({
        where: { id: criterionId },
        data: {
          ...(name && { name: name.trim() }),
          ...(normalizedCat !== undefined && { category: normalizedCat }),
          ...(description !== undefined && { description: description || '' }),
          ...(minScore !== undefined && { minScore: parseFloat(minScore) }),
          ...(maxScore !== undefined && { maxScore: parseFloat(maxScore) }),
          ...(intervalStep !== undefined && { intervalStep: parseFloat(intervalStep) }),
          ...(weight !== undefined && { weight: parseFloat(weight) }),
        },
      });

      if (Array.isArray(options) && options.length > 0) {
        const existingCrit = await prisma.scoringCriterion.findUnique({ where: { id: criterionId } });
        if (existingCrit) {
          await prisma.scoreOption.deleteMany({ where: { criterionId } });
          await prisma.scoreOption.createMany({
            data: options.map((val) => ({
              criterionId,
              scoreValue: parseFloat(val),
              isCustom: false,
            })),
          });
        }
      }

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
export async function getJuriCriteriaData(eventId, userId, email, isSuperAdmin = false) {
  const canonicalEvent = await resolveCanonicalEventForJuri(eventId);
  const [sessionProfile, allCriteria] = await Promise.all([
    getJudgeSessionProfile(userId, email, canonicalEvent.id),
    getCriteriaList(canonicalEvent.id),
  ]);

  const judge = sessionProfile.judge;
  const assignedCategories = normalizeJudgeSpecialties(
    judge?.specialties,
    judge?.category || 'PBB'
  );

  const filteredCriteria = isSuperAdmin
    ? allCriteria
    : allCriteria.filter((c) => {
        const critCat = normalizeScoringCategory(c.category);
        if (assignedCategories.includes(critCat)) return true;
        if (
          Array.isArray(c.assignedJudges) &&
          judge &&
          (c.assignedJudges.includes(judge.id) || c.assignedJudges.includes(judge.userId))
        ) {
          return true;
        }
        return false;
      });

  return {
    event: canonicalEvent,
    scoringLocked: Boolean(canonicalEvent.scoringLocked),
    judge,
    assignedCategories,
    totalAll: allCriteria.length,
    total: filteredCriteria.length,
    criteria: filteredCriteria.map((c, idx) => ({
      id: c.id,
      orderIndex: c.orderIndex ?? idx + 1,
      name: c.name,
      category: normalizeScoringCategory(c.category),
      desc: c.description || '',
      description: c.description || '',
      minScore: c.minScore,
      maxScore: c.maxScore,
      intervalStep: c.intervalStep,
      weight: c.weight ?? 1.0,
      isMandatory: c.isMandatory !== false,
      options:
        Array.isArray(c.options) && c.options.length > 0
          ? [...c.options].sort((a, b) => a - b)
          : [70, 75, 80, 85, 90, 95, 100],
    })),
  };
}

export * from './services/tm.service.js';
