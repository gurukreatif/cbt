
import React from 'react';

// Common types
export type UserRole = 'super_admin' | 'admin' | 'guru' | 'proktor' | 'pengawas' | 'siswa' | 'reseller';
export type PackageStatus = 'Draft' | 'Review' | 'Siap' | 'Arsip';

// UI Types
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  label: string;
}

// Data Models (SNAKE_CASE STANDARD)
export interface Reseller {
  id: string;
  referral_id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  commission_rate: number;
  created_at: string;
}

export interface SchoolProfile {
  id?: string;
  school_id: string;
  nama_sekolah: string;
  jenjang: string;
  status: 'pending' | 'approved' | string;
  alamat: string;
  kota_kabupaten: string;
  provinsi: string;
  kode_pos: string;
  telepon: string;
  email: string;
  website: string;
  kop_surat: string;
  kepala_sekolah: string;
  nip_kepala_sekolah: string;
  plan?: 'basic' | 'pro';
  quota?: number;
  quota_used?: number;
  quota_total?: number;
  referral_id?: string;
}

export interface Transaction {
  id: string;
  created_at: string;
  school_id: string;
  invoice_number: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid';
  due_date: string;
  reseller_id?: string;
}

export interface SubjectMaster {
  id: string;
  school_id: string;
  kode: string;
  nama: string;
}

export interface GradeLevel {
  id: string;
  school_id: string;
  nama: string;
}

export interface RombelMaster {
  id: string;
  school_id: string;
  nama: string;
}

export interface ExamRoom {
  id: string;
  school_id: string;
  nama: string;
  kode: string;
  kapasitas: number;
  lokasi: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  nip: string;
  nama: string;
  gelar_depan?: string;
  gelar_belakang?: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  mata_pelajaran: string[];
  status: 'PNS' | 'PPPK' | 'GTT' | 'GTY';
  jabatan: 'Guru Mapel' | 'Wali Kelas' | 'Kepala Sekolah' | 'Wakil Kepala Sekolah' | 'Admin Sistem' | 'Proktor Sesi' | 'Pengawas Ruang';
  email?: string;
  no_hp?: string;
  username?: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export type Proctor = Teacher;
export type Supervisor = Teacher;

export interface Student {
  id: string;
  school_id: string;
  nis: string;
  nama: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  kelas: string;
  rombel: string;
  status: 'Aktif' | 'Tidak Aktif' | 'Pindah' | 'Lulus';
  username: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export type QuestionType = 'pilihan_ganda' | 'pilihan_ganda_kompleks' | 'benar_salah' | 'menjodohkan' | 'esai';

export interface QuestionOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface TrueFalseStatement {
  id: string;
  text: string;
  isTrue: boolean;
}

export interface MatchPair {
  id: string;
  leftText: string;
  rightText: string;
}

export interface Question {
  id: string;
  school_id: string;
  bank_id: string;
  type: QuestionType;
  subject: string;
  levels: string[];
  category: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  question_text: string;
  options?: QuestionOption[];
  statements?: TrueFalseStatement[];
  matching_pairs?: MatchPair[];
  correct_answers?: string[];
  weight: number;
  discussion?: string;
  updated_at?: string;
}

export interface QuestionBank {
  id: string;
  school_id: string;
  subject: string;
  level: string;
  question_count: number;
  is_active: boolean;
}

export interface ExamSchedule {
  id: string;
  school_id: string;
  name: string;
  code: string;
  bank_id: string;
  subject: string;
  level: string;
  question_count: number;
  question_ids?: string[]; // Array of selected question IDs
  duration: number;
  total_weight: number;
  randomize_questions: boolean;
  randomize_options: boolean;
  scoring_mode: 'Standar' | 'Minus';
  passing_grade: number;
  status: string;
}

export interface SessionRoom {
  id: string;
  nama: string;
  kapasitas: number;
  lokasi: string;
  supervisor_ids: string[];
  proctor_id: string;
  student_ids: string[];
  token: string;
}

export interface ExamSession {
  id: string;
  school_id: string;
  name: string;
  schedule_id: string;
  date: string;
  start_time: string;
  end_time: string;
  rooms: SessionRoom[];
  proctor_instructions?: string;
  student_instructions?: string;
  status: 'Disiapkan' | 'Berlangsung' | 'Selesai';
}

export interface StudentAnswer {
  questionId: string;
  answer: any;
  isDoubtful: boolean;
  updatedAt: string;
  manualScore?: number;
  isGraded?: boolean;
}

export interface ExamResult {
  id: string;
  school_id: string;
  session_id: string;
  session_name: string;
  student_id: string;
  student_name: string;
  nis: string;
  start_time: string;
  end_time: string;
  total_questions: number;
  answered: number;
  correct: number;
  incorrect: number;
  score: number;
  max_score: number;
  final_grade: number;
  is_passed: boolean;
  answers: StudentAnswer[];
  status: 'Selesai' | 'Auto-Submit' | 'Tersimpan Lokal' | 'Gagal Sinkron' | 'Menunggu Koreksi';
  synced?: boolean;
}

export interface StudentExamSession {
  studentId: string;
  studentName: string;
  nis: string;
  sessionId: string;
  sessionName: string;
  scheduleId: string;
  roomId: string;
  loginTime: string;
  durationMinutes: number;
  expiryTime: string;
  passingGrade: number;
}

export interface ExamAssignment {
  id: string;
  school_id: string;
  supervisorId: string;
  namaUjian: string;
  tanggal: string;
  ruang: string;
}

export interface StudentMonitoringState {
  studentId: string;
  nis: string;
  nama: string;
  kelas: string;
  status: 'Belum Login' | 'Sedang Ujian' | 'Diblokir' | 'Sudah Dikirim' | 'Tersimpan Lokal' | 'Gagal Sinkron';
  progress: number;
  totalSoal: number;
  loginTime?: string;
  submitTime?: string;
  extraTime: number;
  isBlocked: boolean;
  resultId?: string;
}

export interface AuditProctorLog {
  id: string;
  school_id: string;
  timestamp: string;
  sessionId: string;
  roomId: string;
  studentId: string;
  studentName: string;
  action: 'TAMBAH WAKTU' | 'RESET' | 'SUBMIT' | 'BLOCK' | 'UNBLOCK';
  detail: string;
  proctorId: string;
  proctorName: string;
}

export interface ItemAnalysisResult {
  questionId: number;
  difficulty: number;
  classification: 'Mudah' | 'Sedang' | 'Sukar';
  recommendation: 'Pertahankan' | 'Revisi';
}