
-- =================================================================
-- EMES CBT - ROW LEVEL SECURITY (RLS) POLICIES - PERBAIKAN KOLOM
-- =================================================================

-- Menonaktifkan RLS untuk tabel yang dikelola Superadmin
ALTER TABLE public.school_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resellers DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 1. HELPER FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION public.requesting_school_id()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::JSONB -> 'app_metadata' ->> 'school_id', '')::TEXT;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.requesting_user_role()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::JSONB -> 'app_metadata' ->> 'role', '')::TEXT;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.requesting_user_record_id()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::JSONB -> 'app_metadata' ->> 'user_record_id', '')::TEXT;
$$ LANGUAGE SQL STABLE;

-- =============================================
-- 2. TABLE POLICIES
-- =============================================

-- ---------------------------------------------
-- Table: students
-- ---------------------------------------------
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage students in their school" ON public.students;
CREATE POLICY "Staff can manage students in their school" ON public.students
  FOR ALL
  USING (public.requesting_school_id() = school_id AND public.requesting_user_role() IN ('admin', 'proktor', 'guru'))
  WITH CHECK (public.requesting_school_id() = school_id AND public.requesting_user_role() IN ('admin', 'proktor', 'guru'));

DROP POLICY IF EXISTS "Students can view their own data" ON public.students;
CREATE POLICY "Students can view their own data" ON public.students
  FOR SELECT
  USING (public.requesting_school_id() = school_id AND public.requesting_user_role() = 'siswa' AND id::text = public.requesting_user_record_id());

-- ---------------------------------------------
-- Table: question_banks & questions
-- ---------------------------------------------
ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant Isolation for Question Banks" ON public.question_banks;
CREATE POLICY "Tenant Isolation for Question Banks" ON public.question_banks
  FOR ALL
  USING (public.requesting_school_id() = school_id)
  WITH CHECK (public.requesting_school_id() = school_id);

DROP POLICY IF EXISTS "Tenant Isolation for Questions" ON public.questions;
CREATE POLICY "Tenant Isolation for Questions" ON public.questions
  FOR ALL
  USING (public.requesting_school_id() = school_id)
  WITH CHECK (public.requesting_school_id() = school_id);

-- ---------------------------------------------
-- Table: exam_schedules & exam_sessions
-- ---------------------------------------------
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage schedules" ON public.exam_schedules;
CREATE POLICY "Staff can manage schedules" ON public.exam_schedules
  FOR ALL
  USING (public.requesting_school_id() = school_id AND public.requesting_user_role() IN ('admin', 'proktor', 'guru'))
  WITH CHECK (public.requesting_school_id() = school_id);

DROP POLICY IF EXISTS "Staff can manage sessions" ON public.exam_sessions;
CREATE POLICY "Staff can manage sessions" ON public.exam_sessions
  FOR ALL
  USING (public.requesting_school_id() = school_id AND public.requesting_user_role() IN ('admin', 'proktor', 'guru'))
  WITH CHECK (public.requesting_school_id() = school_id);

DROP POLICY IF EXISTS "Students can view schedules" ON public.exam_schedules;
CREATE POLICY "Students can view schedules" ON public.exam_schedules 
  FOR SELECT 
  USING (public.requesting_school_id() = school_id);

DROP POLICY IF EXISTS "Students can view sessions" ON public.exam_sessions;
CREATE POLICY "Students can view sessions" ON public.exam_sessions 
  FOR SELECT 
  USING (public.requesting_school_id() = school_id);

-- ---------------------------------------------
-- Table: exam_results (MENGGUNAKAN studentid)
-- ---------------------------------------------
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view all results" ON public.exam_results;
CREATE POLICY "Staff can view all results" ON public.exam_results
  FOR SELECT
  USING (public.requesting_school_id() = school_id AND public.requesting_user_role() IN ('admin', 'proktor', 'guru'));

DROP POLICY IF EXISTS "Staff can update results" ON public.exam_results;
CREATE POLICY "Staff can update results" ON public.exam_results
  FOR UPDATE
  USING (public.requesting_school_id() = school_id AND public.requesting_user_role() IN ('admin', 'proktor'));

DROP POLICY IF EXISTS "Staff can delete results" ON public.exam_results;
CREATE POLICY "Staff can delete results" ON public.exam_results
  FOR DELETE
  USING (public.requesting_school_id() = school_id AND public.requesting_user_role() IN ('admin', 'proktor'));

DROP POLICY IF EXISTS "Students can view their own results" ON public.exam_results;
CREATE POLICY "Students can view their own results" ON public.exam_results
  FOR SELECT
  USING (public.requesting_school_id() = school_id AND studentid::text = public.requesting_user_record_id());

DROP POLICY IF EXISTS "Students can insert their own results" ON public.exam_results;
CREATE POLICY "Students can insert their own results" ON public.exam_results
  FOR INSERT
  WITH CHECK (public.requesting_school_id() = school_id AND studentid::text = public.requesting_user_record_id());

-- ---------------------------------------------
-- Table: Master Data
-- ---------------------------------------------
ALTER TABLE public.master_kelas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant Isolation on master_kelas" ON public.master_kelas;
CREATE POLICY "Tenant Isolation on master_kelas" ON public.master_kelas FOR ALL USING (public.requesting_school_id() = school_id) WITH CHECK (public.requesting_school_id() = school_id);

ALTER TABLE public.master_rombel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant Isolation on master_rombel" ON public.master_rombel;
CREATE POLICY "Tenant Isolation on master_rombel" ON public.master_rombel FOR ALL USING (public.requesting_school_id() = school_id) WITH CHECK (public.requesting_school_id() = school_id);

ALTER TABLE public.master_mapel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant Isolation on master_mapel" ON public.master_mapel;
CREATE POLICY "Tenant Isolation on master_mapel" ON public.master_mapel FOR ALL USING (public.requesting_school_id() = school_id) WITH CHECK (public.requesting_school_id() = school_id);

ALTER TABLE public.master_ruang ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant Isolation on master_ruang" ON public.master_ruang;
CREATE POLICY "Tenant Isolation on master_ruang" ON public.master_ruang FOR ALL USING (public.requesting_school_id() = school_id) WITH CHECK (public.requesting_school_id() = school_id);
