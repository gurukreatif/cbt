
import React from 'react';
import { 
  School, 
  Users, 
  FileText, 
  Calendar, 
  PlayCircle, 
  ClipboardCheck, 
  BarChart3, 
  Settings,
  LayoutDashboard,
  Layers,
  User,
  History,
  Building2,
  GraduationCap,
  BookOpen,
  MapPin,
  UserCheck,
  SlidersHorizontal,
  CreditCard,
  Smartphone,
  Archive,
  Database,
  Edit2,
  Monitor,
  Share2
} from 'lucide-react';
import { MenuItem } from './types';

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { 
    id: 'school-profile', 
    label: 'Konfigurasi Awal', 
    icon: <SlidersHorizontal size={20} />, 
    path: '/profil-sekolah',
    children: [
      { id: 'profile-identity', label: 'Profil Sekolah', icon: <School size={16} />, path: '/profil-sekolah' },
      { id: 'profile-master', label: 'Data Master', icon: <Database size={16} />, path: '/konfigurasi/master' },
    ]
  },
  { 
    id: 'data-users', 
    label: 'Data Pengguna', 
    icon: <Users size={20} />, 
    path: '/data-pengguna',
    children: [
      { id: 'users-pengelola', label: 'Pengelola', icon: <UserCheck size={16} />, path: '/data-pengguna' },
      { id: 'users-peserta', label: 'Peserta Didik', icon: <User size={16} />, path: '/data-pengguna/peserta' },
    ]
  },
  { id: 'question-bank', label: 'Bank Soal', icon: <FileText size={20} />, path: '/bank-soal' },
  { id: 'exam-packages', label: 'Paket Ujian', icon: <Layers size={20} />, path: '/paket-ujian' },
  { id: 'exam-execution-pkgs', label: 'Jadwal Ujian', icon: <Calendar size={20} />, path: '/jadwal-ujian' },
  { 
    id: 'exam-ops', 
    label: 'Operasional Ujian', 
    icon: <PlayCircle size={20} />, 
    path: '/pelaksanaan',
    children: [
      { id: 'exam-execution', label: 'Pelaksanaan Sesi', icon: <Monitor size={16} />, path: '/pelaksanaan' },
      { id: 'exam-correction', label: 'Koreksi Esai', icon: <Edit2 size={16} />, path: '/koreksi-esai' },
    ]
  },
  { id: 'reports', label: 'Laporan', icon: <BarChart3 size={20} />, path: '/laporan' },
  { 
    id: 'settings', 
    label: 'Pengaturan', 
    icon: <Settings size={20} />, 
    path: '/pengaturan',
    children: [
      { id: 'settings-system', label: 'Sistem & Cetak', icon: <Smartphone size={16} />, path: '/pengaturan' },
      { id: 'settings-billing', label: 'Billing & Kuota', icon: <CreditCard size={16} />, path: '/pengaturan/billing' },
      { id: 'settings-backup', label: 'Backup & Hapus Data', icon: <Archive size={16} />, path: '/pengaturan/backup' }
    ]
  },
];

// Menu untuk Superadmin - MEMASTIKAN "RESELLERS" ADA
export const SUPERADMIN_MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18}/>, path: 'dashboard' },
  { id: 'schools', label: 'Daftar Sekolah', icon: <Building2 size={18}/>, path: 'schools' },
  { id: 'resellers', label: 'Manajemen Agen', icon: <Share2 size={18}/>, path: 'resellers' },
  { id: 'billing', label: 'Billing & Keuangan', icon: <CreditCard size={18}/>, path: 'billing' },
];

export const STUDENT_MENU_ITEMS: MenuItem[] = [
  { id: 'student-dash', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { id: 'student-exams', label: 'Jadwal Ujian', icon: <Calendar size={20} />, path: '/jadwal-ujian-siswa' },
  { id: 'student-results', label: 'Riwayat Hasil', icon: <History size={20} />, path: '/riwayat-hasil' },
  { id: 'student-profile', label: 'Profil Saya', icon: <User size={20} />, path: '/profil-user' },
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['dashboard', 'school-profile', 'data-users', 'question-bank', 'exam-packages', 'exam-execution-pkgs', 'exam-execution', 'exam-correction', 'reports', 'settings', 'settings-system', 'settings-billing', 'settings-backup', 'profil-user', 'pengaturan', 'profile-master', 'exam-ops'],
  guru: ['question-bank', 'exam-packages', 'reports', 'profil-user', 'exam-correction', 'exam-ops'],
  proktor: ['exam-execution-pkgs', 'exam-execution', 'profil-user', 'exam-correction', 'exam-ops'],
  pengawas: ['exam-execution', 'profil-user', 'exam-ops'],
};

export const SCHOOL_NAME = "SMP Negeri 1 Contoh";
export const LOGO_URL = "https://i.imgur.com/VDNLrbw.png";

export const PKT_STATUS_DRAFT = 'Draft';
export const PKT_STATUS_READY = 'Siap Digunakan';

export const SUBJECTS_LIST = [
  'Matematika', 'IPA', 'IPS', 'Bahasa Indonesia', 'Bahasa Inggris', 
  'PAI', 'PKn', 'PJOK', 'Seni Budaya', 'Prakarya', 'Informatika'
];

export const EMPLOYMENT_STATUSES = ['PNS', 'PPPK', 'GTT', 'GTY'];
export const POSITIONS = [
  'Admin Sistem',
  'Kepala Sekolah', 
  'Wakil Kepala Sekolah',
  'Guru Mapel', 
  'Proktor Sesi',
  'Pengawas Ruang',
  'Wali Kelas'
];

export const ROMBELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
export const STUDENT_STATUSES = ['Aktif', 'Tidak Aktif', 'Pindah', 'Lulus'];

export const EXAM_TYPES = ['PH', 'PTS', 'PAS', 'PAT', 'Try Out', 'Ujian Sekolah', 'Remedial', 'Pengayaan'];

export const getClassesByJenjang = (jenjang: string) => {
  switch (jenjang) {
    case 'SD/MI': return ['1', '2', '3', '4', '5', '6'];
    case 'SMP/MTs': return ['7', '8', '9'];
    case 'SMA/MA':
    case 'SMK': return ['10', '11', '12'];
    default: return ['7', '8', '9'];
  }
};
