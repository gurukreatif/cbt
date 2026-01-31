-- =================================================================
-- EMES CBT - SKEMA DATABASE DEFINITIF (SNAKE_CASE STANDARD)
-- =================================================================
-- FILE INI ADALAH SUMBER KEBENARAN TUNGGAL UNTUK STRUKTUR DATABASE.
-- Jalankan di Supabase SQL Editor untuk membuat tabel yang hilang
-- dan memastikan semua kolom konsisten.
-- =================================================================

-- 1. TABEL AGEN/RESELLER BARU
CREATE TABLE IF NOT EXISTS public.resellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    password TEXT, -- DITAMBAHKAN UNTUK LOGIN PORTAL
    commission_rate NUMERIC DEFAULT 0.1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Membuat tabel jika belum ada untuk menghindari error.
CREATE TABLE IF NOT EXISTS public.school_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL UNIQUE,
    nama_sekolah TEXT NOT NULL,
    jenjang TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- DITAMBAHKAN UNTUK PERSETUJUAN
    alamat TEXT NOT NULL,
    kota_kabupaten TEXT NOT NULL,
    provinsi TEXT NOT NULL,
    kode_pos TEXT,
    telepon TEXT,
    email TEXT,
    website TEXT,
    kop_surat TEXT,
    kepala_sekolah TEXT NOT NULL,
    nip_kepala_sekolah TEXT NOT NULL,
    plan TEXT DEFAULT 'basic',
    quota_total INT DEFAULT 100,
    quota_used INT DEFAULT 0,
    -- 2. MENAMBAHKAN KOLOM REFERRAL
    referral_id TEXT REFERENCES public.resellers(referral_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    nip TEXT NOT NULL,
    nama TEXT NOT NULL,
    gelar_depan TEXT,
    gelar_belakang TEXT,
    jenis_kelamin TEXT NOT NULL,
    mata_pelajaran TEXT[],
    status TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    email TEXT,
    no_hp TEXT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(school_id, nip)
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    nis TEXT NOT NULL,
    nama TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    kelas TEXT NOT NULL,
    rombel TEXT NOT NULL,
    status TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(school_id, nis)
);

CREATE TABLE IF NOT EXISTS public.question_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    level TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    bank_id UUID REFERENCES public.question_banks(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    subject TEXT,
    levels TEXT[],
    category TEXT,
    difficulty TEXT,
    question_text TEXT NOT NULL,
    options JSONB,
    statements JSONB,
    matching_pairs JSONB,
    correct_answers TEXT[],
    weight NUMERIC DEFAULT 1,
    discussion TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exam_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    bank_id UUID REFERENCES public.question_banks(id) ON DELETE SET NULL,
    subject TEXT,
    level TEXT,
    question_ids UUID[],
    duration INT NOT NULL,
    total_weight NUMERIC DEFAULT 100,
    randomize_questions BOOLEAN DEFAULT true,
    randomize_options BOOLEAN DEFAULT true,
    scoring_mode TEXT DEFAULT 'Standar',
    passing_grade NUMERIC DEFAULT 75,
    status TEXT DEFAULT 'Draft'
);

CREATE TABLE IF NOT EXISTS public.exam_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    name TEXT NOT NULL,
    schedule_id UUID REFERENCES public.exam_schedules(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    rooms JSONB,
    proctor_instructions TEXT,
    student_instructions TEXT,
    status TEXT DEFAULT 'Disiapkan'
);

CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    session_id UUID NOT NULL,
    session_name TEXT,
    student_id TEXT NOT NULL,
    student_name TEXT,
    nis TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    total_questions INT,
    answered INT,
    correct INT,
    incorrect INT,
    score NUMERIC,
    max_score NUMERIC,
    final_grade NUMERIC,
    is_passed BOOLEAN,
    answers JSONB,
    status TEXT,
    synced BOOLEAN DEFAULT false
);

-- INI YANG HILANG SEBELUMNYA
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    school_id TEXT NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    due_date DATE,
    -- 3. MENAMBAHKAN KOLOM UNTUK KOMISI
    reseller_id UUID REFERENCES public.resellers(id) ON DELETE SET NULL
);

-- Master Data Tables
CREATE TABLE IF NOT EXISTS public.master_kelas ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), school_id TEXT NOT NULL, nama TEXT NOT NULL );
CREATE TABLE IF NOT EXISTS public.master_rombel ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), school_id TEXT NOT NULL, nama TEXT NOT NULL );
CREATE TABLE IF NOT EXISTS public.master_mapel ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), school_id TEXT NOT NULL, kode TEXT, nama TEXT NOT NULL );
CREATE TABLE IF NOT EXISTS public.master_ruang ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), school_id TEXT NOT NULL, nama TEXT NOT NULL, kode TEXT, kapasitas INT, lokasi TEXT );
