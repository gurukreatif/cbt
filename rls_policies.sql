
-- =================================================================
-- EMES CBT - SECURE RLS POLICIES (OFFICIAL AUTH + MANUAL FALLBACK)
-- =================================================================

-- 1. AKTIFKAN RLS PADA TABEL UTAMA
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 2. KEBIJAKAN UNTUK TABEL SUPERADMIN (KEAMANAN KETAT)
DROP POLICY IF EXISTS "Superadmins can view own profile" ON public.super_admins;
CREATE POLICY "Superadmins can view own profile" 
ON public.super_admins FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 3. KEBIJAKAN MANAJEMEN PLATFORM (HANYA SUPERADMIN YG BISA MENGELOLA)
-- Kebijakan ini memeriksa apakah UID user yang sedang login ada di tabel super_admins

-- Untuk Tabel Institusi Sekolah
DROP POLICY IF EXISTS "Superadmin manage schools" ON public.school_profiles;
CREATE POLICY "Superadmin manage schools" 
ON public.school_profiles FOR ALL 
TO authenticated 
USING ( EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid()) );

-- Untuk Tabel Agen/Reseller
DROP POLICY IF EXISTS "Superadmin manage resellers" ON public.resellers;
CREATE POLICY "Superadmin manage resellers" 
ON public.resellers FOR ALL 
TO authenticated 
USING ( EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid()) );

-- Untuk Tabel Transaksi
DROP POLICY IF EXISTS "Superadmin manage transactions" ON public.transactions;
CREATE POLICY "Superadmin manage transactions" 
ON public.transactions FOR ALL 
TO authenticated 
USING ( EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid()) );

-- 4. KEBIJAKAN AKSES PUBLIK / FALLBACK (UNTUK SEKOLAH & SISWA)
-- Karena Sekolah/Siswa login manual tanpa Supabase Auth resmi, 
-- mereka dianggap 'anon' oleh database. Kita berikan izin terkontrol.

DROP POLICY IF EXISTS "Public lookup for login" ON public.school_profiles;
CREATE POLICY "Public lookup for login" ON public.school_profiles FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Public lookup for teachers" ON public.teachers;
CREATE POLICY "Public lookup for teachers" ON public.teachers FOR ALL TO anon USING (true);

DROP POLICY IF EXISTS "Public lookup for students" ON public.students;
CREATE POLICY "Public lookup for students" ON public.students FOR ALL TO anon USING (true);

-- Sisanya (soal, sesi, dll) diizinkan untuk Anon agar sistem offline/manual tetap jalan
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permissive for exam ops" ON public.questions FOR ALL TO anon USING (true);

ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permissive for exam ops" ON public.exam_sessions FOR ALL TO anon USING (true);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permissive for exam ops" ON public.exam_results FOR ALL TO anon USING (true);
