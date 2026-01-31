import React, { useState, useEffect, useMemo } from 'react';
import { ADMIN_MENU_ITEMS, PKT_STATUS_READY, SCHOOL_NAME, ROLE_PERMISSIONS } from '../constants.tsx';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';
import Breadcrumb from './Breadcrumb.tsx';
import ProfileForm from './ProfileForm.tsx';
import ProfilePreview from './ProfilePreview.tsx';
import TeacherTable from './TeacherTable.tsx';
import TeacherForm from './TeacherForm.tsx';
import TeacherImportModal from './TeacherImportModal.tsx';
import StudentTable from './StudentTable.tsx';
import StudentForm from './StudentForm.tsx';
import StudentImportModal from './StudentImportModal.tsx';
import QuestionBankTable from './QuestionBankTable.tsx';
import QuestionBankForm from './QuestionBankForm.tsx';
import QuestionListTable from './QuestionListTable.tsx';
import QuestionForm from './QuestionForm.tsx';
import PackageTable from './PackageTable.tsx';
import PackageForm from './PackageForm.tsx';
import PackageContentManager from './PackageContentManager.tsx';
import ExamSessionHub from './ExamSessionHub.tsx';
import ExamSessionForm from './ExamSessionForm.tsx';
import ExamMonitoringDashboard from './ExamMonitoringDashboard.tsx';
import ReportDashboard from './ReportDashboard.tsx';
import MasterDataForm from './MasterDataForm.tsx';
import ConfirmModal from './ConfirmModal.tsx';
import PrintService from './PrintService.tsx';
import BillingPage from './BillingPage.tsx';
import BackupDataPage from './BackupDataPage.tsx'; 
import EssayCorrection from './EssayCorrection.tsx'; 
import TeacherDashboard from './TeacherDashboard.tsx'; 
import { PrintLedgerNilai, PrintAnalisisButir } from './PrintLayouts.tsx';
import { supabase } from '../lib/supabase.ts';
import { 
  Users, Layers, MapPin, BookOpen, Loader2, Cloud, 
  Edit2, Trash2, User, ShieldCheck, Monitor, Lock, 
  CheckCircle2, Building2, Key, Info, FileText, 
  PlayCircle, ClipboardCheck, BarChart3, ArrowLeft,
  Clock, Search, Calendar, Filter, RotateCcw,
  Wifi, ShieldAlert, Database, ArrowUpCircle,
  Settings, Smartphone, Award, Printer, Save, CheckCircle,
  ToggleLeft, ToggleRight, Scale, Type, Layout, GraduationCap,
  AlertTriangle,
  Trophy,
  RefreshCw,
  MoreVertical,
  CreditCard,
  Archive
} from 'lucide-react';
import { 
  SchoolProfile, Teacher, Student, Question, QuestionBank, 
  ExamSchedule, ExamSession, GradeLevel, RombelMaster, 
  SubjectMaster, ExamRoom, ExamResult, StudentAnswer, SessionRoom
} from '../types.ts';

interface AdminPortalProps {
  user: any;
  role: 'admin' | 'guru' | 'proktor' | 'pengawas';
  onLogout: () => void;
}

const TABLE_MAP: { [key: string]: string } = {
  'school_profile': 'school_profiles',
  'teachers': 'teachers',
  'students': 'students',
  'question_banks': 'question_banks',
  'questions': 'questions',
  'exam_schedules': 'exam_schedules',
  'exam_sessions': 'exam_sessions',
  'master_kelas': 'master_kelas',
  'master_rombel': 'master_rombel',
  'master_mapel': 'master_mapel',
  'master_ruang': 'master_ruang',
  'exam_results': 'exam_results'
};

const SCHEMA_COLUMNS: { [key: string]: string[] } = {
  'school_profiles': ['id', 'school_id', 'nama_sekolah', 'jenjang', 'status', 'alamat', 'kota_kabupaten', 'provinsi', 'kode_pos', 'telepon', 'email', 'website', 'kop_surat', 'kepala_sekolah', 'nip_kepala_sekolah', 'plan', 'quota_total', 'quota_used'],
  'teachers': ['id', 'school_id', 'nip', 'nama', 'gelar_depan', 'gelar_belakang', 'jenis_kelamin', 'mata_pelajaran', 'status', 'jabatan', 'email', 'no_hp', 'username', 'password'],
  'students': ['id', 'school_id', 'nis', 'nama', 'jenis_kelamin', 'kelas', 'rombel', 'status', 'username', 'password', 'updated_at'],
  'question_banks': ['id', 'school_id', 'subject', 'level', 'question_count', 'is_active'],
  'questions': ['id', 'school_id', 'bank_id', 'type', 'subject', 'levels', 'category', 'difficulty', 'question_text', 'options', 'statements', 'matching_pairs', 'correct_answers', 'weight', 'discussion', 'updated_at'],
  'exam_schedules': ['id', 'school_id', 'name', 'code', 'bank_id', 'subject', 'level', 'question_count', 'question_ids', 'duration', 'total_weight', 'randomize_questions', 'randomize_options', 'scoring_mode', 'passing_grade', 'status'],
  'exam_sessions': ['id', 'school_id', 'name', 'schedule_id', 'date', 'start_time', 'end_time', 'rooms', 'proctor_instructions', 'student_instructions', 'status'],
  'master_kelas': ['id', 'school_id', 'nama'],
  'master_rombel': ['id', 'school_id', 'nama'],
  'master_mapel': ['id', 'school_id', 'kode', 'nama'],
  'master_ruang': ['id', 'school_id', 'nama', 'kode', 'kapasitas', 'lokasi'],
  'exam_results': ['id', 'school_id', 'session_id', 'session_name', 'student_id', 'student_name', 'nis', 'start_time', 'end_time', 'total_questions', 'answered', 'correct', 'incorrect', 'score', 'max_score', 'final_grade', 'is_passed', 'answers', 'status']
};

const AdminPortal: React.FC<AdminPortalProps> = ({ user, role, onLogout }) => {
  const [activePath, setActivePath] = useState('/');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('emes_sidebar_collapsed') === 'true');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [schoolProfile, setSchoolProfile] = useState<any>(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);
  const [examSessions, setExamSessions] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [masterKelas, setMasterKelas] = useState([]);
  const [masterRombel, setMasterRombel] = useState([]);
  const [masterMapel, setMasterMapel] = useState([]);
  const [masterRuang, setMasterRuang] = useState([]);

  const [activePrintJob, setActivePrintJob] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [activeMonitoringSession, setActiveMonitoringSession] = useState(null);
  const [activeReportSchedule, setActiveReportSchedule] = useState(null);
  
  const [masterModal, setMasterModal] = useState(null);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState('sistem');
  
  const [activePackageView, setActivePackageView] = useState<'list' | 'form' | 'contentManager'>('list');
  const [selectedPackage, setSelectedPackage] = useState<ExamSchedule | null>(null);

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('emes_cbt_config');
    return saved ? JSON.parse(saved) : {
      examMode: 'hybrid',
      allowManualSync: true,
      defaultDuration: 90,
      useRounding: true,
      showPredicate: true,
      useKop: true,
      leftSignTitle: 'Proktor / Pengawas',
      leftSignName: '',
      leftSignNip: '',
      rightSignTitle: 'Kepala Sekolah'
    };
  });

  const saveConfig = () => {
    localStorage.setItem('emes_cbt_config', JSON.stringify(config));
    alert("Konfigurasi Sistem Berhasil Disimpan.");
  };

  const [monSearch, setMonSearch] = useState('');
  const [monStatus, setMonStatus] = useState('');

  const filteredMenuItems = useMemo(() => {
    const allowedIds = ROLE_PERMISSIONS[role] || [];
    return ADMIN_MENU_ITEMS.filter(item => {
        if(item.children) {
            return item.children.some(child => allowedIds.includes(child.id)) || allowedIds.includes(item.id)
        }
        return allowedIds.includes(item.id)
    }).map(item => {
        if(item.children) {
            return {
                ...item,
                children: item.children.filter(child => allowedIds.includes(child.id))
            }
        }
        return item
    });
  }, [role]);

  useEffect(() => {
    if (activePath === '/profil-user' || activePath === '/pengaturan' || activePath === '/pengaturan/billing' || activePath === '/pengaturan/backup') return;
    
    const isAllowed = filteredMenuItems.some(item => 
      item.path === activePath || 
      item.children?.some(child => child.path === activePath)
    );

    if (!isAllowed) {
      if (filteredMenuItems.length > 0) {
        setActivePath(filteredMenuItems[0].path);
      }
    }
  }, [activePath, role, filteredMenuItems]);

  const refreshData = async (signal?: AbortSignal) => {
    setIsSyncing(true);
    try {
      const resultsPromises = [
        supabase.from('school_profiles').select('*').eq('school_id', user.school_id).order('id', { ascending: false }).limit(1).abortSignal(signal).maybeSingle(),
        supabase.from('teachers').select('*').eq('school_id', user.school_id).abortSignal(signal),
        supabase.from('students').select('*').eq('school_id', user.school_id).abortSignal(signal),
        supabase.from('question_banks').select('*').eq('school_id', user.school_id).abortSignal(signal),
        supabase.from('questions').select('*').eq('school_id', user.school_id).abortSignal(signal),
        supabase.from('exam_schedules').select('*').eq('school_id', user.school_id).abortSignal(signal),
        supabase.from('exam_sessions').select('*').eq('school_id', user.school_id).abortSignal(signal),
        supabase.from('exam_results').select('*').eq('school_id', user.school_id).abortSignal(signal),
        supabase.from('master_kelas').select('*').eq('school_id', user.school_id).abortSignal(signal),
        supabase.from('master_rombel').select('*').eq('school_id', user.school_id).abortSignal(signal),
        supabase.from('master_mapel').select('*').eq('school_id', user.school_id).abortSignal(signal),
        supabase.from('master_ruang').select('*').eq('school_id', user.school_id).abortSignal(signal)
      ];

      const allResults = await Promise.all(resultsPromises);
      if (signal?.aborted) return;
      
      const errors = allResults.map(res => res.error).filter(Boolean);
      if (errors.length > 0) throw new Error(errors.map(e => e.message).join(', '));
      
      const [
        profileResult, teachersResult, studentsResult, questionBanksResult, questionsResult,
        examSchedulesResult, examSessionsResult, examResultsResult, masterKelasResult,
        masterRombelResult, masterMapelResult, masterRuangResult
      ] = allResults;

      setSchoolProfile(profileResult.data || null);
      setTeachers(teachersResult.data || []);
      setStudents(studentsResult.data || []);
      setQuestionBanks(questionBanksResult.data || []);
      setQuestions(questionsResult.data || []);
      setExamSchedules(examSchedulesResult.data || []);
      setExamSessions(examSessionsResult.data || []);
      setExamResults(examResultsResult.data || []);
      setMasterKelas(masterKelasResult.data || []);
      setMasterRombel(masterRombelResult.data || []);
      setMasterMapel(masterMapelResult.data || []);
      setMasterRuang(masterRuangResult.data || []);

    } catch (e: any) {
      const isAbortError = e.name === 'AbortError' || 
                          String(e.message || '').toLowerCase().includes('abort') ||
                          String(e.message || '').toLowerCase().includes('cancel');
      if (isAbortError) return;
      console.error("Critical Restore Error:", e.message);
    } finally {
      if (!signal?.aborted) {
        setIsSyncing(false);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    refreshData(controller.signal);

    const channel = supabase.channel(`admin-portal-changes:${user.school_id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public',
          filter: `school_id=eq.${user.school_id}` 
        }, 
        (payload) => {
          console.log('Realtime change received, refreshing admin data...', payload);
          refreshData();
        }
      ).subscribe();

    return () => {
      controller.abort();
      supabase.removeChannel(channel);
    };
  }, [user.school_id]);

  const augmentedQuestionBanks = useMemo(() => {
    return questionBanks.map((bank: any) => ({
      ...bank,
      questionCount: questions.filter((q: any) => q.bank_id === bank.id).length
    }));
  }, [questionBanks, questions]);

  const reportableSchedules = useMemo(() => {
    const finishedSessionScheduleIds = new Set(
      examSessions
        .filter((s: ExamSession) => s.status === 'Selesai')
        .map((s: ExamSession) => s.schedule_id)
    );
    return examSchedules.filter((sch: ExamSchedule) => finishedSessionScheduleIds.has(sch.id));
  }, [examSchedules, examSessions]);

  const saveToDb = async (stateKey: string, data: any, setter: Function, forceInsert: boolean = false): Promise<void> => {
    setIsSyncing(true);
    const tableName = TABLE_MAP[stateKey];
    
    const filterData = (item: any) => {
      const filtered: any = { ...item, school_id: user.school_id }; 
      const result: any = {};
      const schema = SCHEMA_COLUMNS[tableName] || Object.keys(item);
      schema.forEach(key => { if (key in filtered) result[key] = filtered[key]; });
      return result;
    };

    try {
      let payload = Array.isArray(data) ? data.map(filterData) : filterData(data);
      
      if (stateKey === 'school_profile') {
        const cleanPayload = Array.isArray(payload) ? payload[0] : payload;
        const existingId = schoolProfile?.id;

        let query;
        if (existingId) {
          query = supabase.from(tableName).update(cleanPayload).eq('id', existingId).eq('school_id', user.school_id);
        } else {
          query = supabase.from(tableName).insert([cleanPayload]);
        }

        const { error } = await query;
        if (error) throw error;

        const { data: updated } = await supabase.from(tableName).select('*').eq('school_id', user.school_id).order('id', { ascending: false }).limit(1).maybeSingle();
        setSchoolProfile(updated || null);
        alert("Profil Sekolah Berhasil Diperbarui.");
      } else {
        const query = forceInsert 
          ? supabase.from(tableName).insert(payload)
          : supabase.from(tableName).upsert(payload, { onConflict: 'id' });

        const { error } = await query;
        if (error) throw error;

        const { data: updated } = await supabase.from(tableName).select('*').eq('school_id', user.school_id);
        setter(updated || []);
      }
    } catch (err: any) {
      alert(`GAGAL SINKRONISASI: ${err.message}`);
      throw err; 
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteFromDb = async (stateKey: string, id: string, setter: Function) => {
    setConfirmAction({
      title: 'Konfirmasi Hapus Data',
      message: 'Apakah Anda yakin ingin menghapus data ini secara permanen dari server? Tindakan ini tidak dapat dibatalkan.',
      onConfirm: async () => {
        setIsSyncing(true);
        const tableName = TABLE_MAP[stateKey];
        try {
          const { error } = await supabase.from(tableName).delete().eq('id', id).eq('school_id', user.school_id);
          if (error) throw error;
          const { data: updated } = await supabase.from(tableName).select('*').eq('school_id', user.school_id);
          setter(updated || []);
        } catch (err: any) {
          alert(`GAGAL MENGHAPUS: ${err.message}`);
        } finally {
          setIsSyncing(false);
          setConfirmAction(null);
        }
      },
      onCancel: () => setConfirmAction(null)
    });
  };
  
  const handleResetTeacherPassword = async (teacherId: string) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ password: 'password123' })
        .eq('id', teacherId)
        .eq('school_id', user.school_id);
      if (error) throw error;
    } catch (err: any) {
      alert(`Gagal mereset password: ${err.message}`);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSession = async (sessionData: ExamSession) => {
    const quotaTotal = schoolProfile?.quota_total || 0;
    const quotaUsed = schoolProfile?.quota_used || 0;
    const quotaRemaining = quotaTotal - quotaUsed;

    const oldSession = examSessions.find((s: ExamSession) => s.id === sessionData.id);
    const oldStudentCount = oldSession ? oldSession.rooms.reduce((acc: any, r: any) => acc + (r.student_ids?.length || 0), 0) : 0;
    const newStudentCount = sessionData.rooms.reduce((acc: any, r: any) => acc + (r.student_ids?.length || 0), 0);
    
    const quotaChange = newStudentCount - oldStudentCount;

    if (quotaChange > 0 && quotaRemaining < quotaChange) {
        alert(`Kuota tidak mencukupi. Dibutuhkan: ${quotaChange}, Tersisa: ${quotaRemaining}. Silakan tambah kuota atau kurangi jumlah peserta.`);
        return;
    }

    setIsSyncing(true);
    try {
        await saveToDb('exam_sessions', sessionData, setExamSessions);

        if (quotaChange !== 0 && schoolProfile?.id) {
            const newQuotaUsed = quotaUsed + quotaChange;
            const { error: quotaError } = await supabase
                .from('school_profiles')
                .update({ quota_used: newQuotaUsed })
                .eq('id', schoolProfile.id)
                .eq('school_id', user.school_id);
            if (quotaError) throw quotaError;
        }
        
        setIsEditing(false);
        setSelectedItem(null);
        await refreshData();
    } catch (e: any) {
        alert(`Gagal menyimpan sesi: ${e.message}`);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleBackupAndDelete = (sessionId: string) => {
    const session = examSessions.find((s: any) => s.id === sessionId);
    if (!session) return;

    setConfirmAction({
      title: 'Konfirmasi Backup & Hapus Data',
      message: `Anda akan mengunduh arsip untuk sesi "${(session as any).name}" dan kemudian MENGHAPUS PERMANEN seluruh data sesi ini dan hasil jawaban pesertanya dari server cloud. Tindakan ini tidak dapat dibatalkan.`,
      type: 'danger',
      onConfirm: async () => {
        setIsSyncing(true);
        setConfirmAction(null);
        try {
          const sessionData = examSessions.find((s: any) => s.id === sessionId);
          const scheduleData = examSchedules.find((p: any) => p.id === (sessionData as any).schedule_id);
          const resultsData = examResults.filter((r: any) => r.session_id === sessionId);
          
          const backupData = {
            session: sessionData,
            schedule: scheduleData,
            results: resultsData
          };

          const jsonString = JSON.stringify(backupData, null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const href = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = href;
          link.download = `backup_emes_cbt_${(sessionData as any).name.replace(/\s+/g, '_')}_${(sessionData as any).date}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(href);

          const { error: resultsError } = await supabase.from('exam_results').delete().eq('session_id', sessionId).eq('school_id', user.school_id);
          if (resultsError) throw resultsError;

          const { error: sessionError } = await supabase.from('exam_sessions').delete().eq('id', sessionId).eq('school_id', user.school_id);
          if (sessionError) throw sessionError;

          await refreshData();
          alert('Backup berhasil diunduh dan data telah dihapus dari server.');

        } catch (err: any) {
          alert(`Proses backup & hapus gagal: ${err.message}`);
        } finally {
          setIsSyncing(false);
        }
      },
      onCancel: () => setConfirmAction(null)
    });
  };

  const handleUpdateSessionStatus = async (sessionId: string, newStatus: string) => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('exam_sessions').update({ status: newStatus }).eq('id', sessionId).eq('school_id', user.school_id);
      if (error) throw error;
      await refreshData();
    } catch (err: any) {
      alert(`GAGAL UPDATE STATUS: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleForceSubmit = async (resultId: string) => {
    if (!resultId) {
      alert("Gagal: Data hasil ujian tidak ditemukan untuk peserta ini.");
      return;
    }
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('exam_results')
        .update({ status: 'Auto-Submit', end_time: new Date().toISOString() })
        .eq('id', resultId)
        .eq('school_id', user.school_id);

      if (error) throw error;
      await refreshData();
    } catch (err: any) {
      alert(`GAGAL SUBMIT PAKSA: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleNavigate = (path: string) => {
    setActivePath(path);
    setIsEditing(false);
    setIsAddingBank(false);
    setSelectedItem(null);
    setSelectedBankId(null);
    setActiveMonitoringSession(null);
    setActiveReportSchedule(null);
    setActivePackageView('list');
    setSelectedPackage(null);
    setIsSidebarOpen(false);
    setIsImporting(false);
  };

  const breadcrumbItems = useMemo(() => {
    const items = [];
    const parent = ADMIN_MENU_ITEMS.find(p => p.children?.some(c => c.path === activePath));
    const currentItem = ADMIN_MENU_ITEMS.flatMap(i => i.children || i).find(i => i.path === activePath);
    
    if (parent) {
      items.push({ label: parent.label });
    }
    
    if (currentItem && currentItem.path !== '/' && (!parent || parent.label !== currentItem.label)) {
      items.push({ label: currentItem.label });
    }

    if (items.length === 0 && currentItem && currentItem.path !== '/') {
      items.push({ label: currentItem.label });
    }
    
    if (activePath === '/pengaturan/backup') items.push({label: 'Backup & Hapus Data'});
    else if (activePath === '/pengaturan/billing') items.push({label: 'Billing & Kuota'});
    else if (activePath === '/pengaturan') items.push({label: 'Pengaturan'});
    if (activePath === '/profil-user') items.push({label: 'Profil Saya'});

    return items;
  }, [activePath]);

  function renderMaster(t: string, d: any[], k: string, s: Function, i: any, f: any[]) {
    return (
      <div className="gov-card p-6 space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-2 font-black text-gray-800 uppercase text-xs">{i} {t}</div>
          <button onClick={() => setMasterModal({ isOpen: true, title: t, fields: f, stateKey: k, setter: s, item: null })} className="text-[9px] font-black uppercase bg-gray-900 text-white px-3 py-1 rounded-sm">Tambah</button>
        </div>
        <div className="gov-table-container">
          <table className="gov-table">
            <thead><tr>{f.map((cl: any) => <th key={cl.key}>{cl.label}</th>)}<th className="text-right">Aksi</th></tr></thead>
            <tbody>{d.map((it: any) => <tr key={it.id}>{f.map((cl: any) => <td key={cl.key} className="text-xs font-bold uppercase">{it[cl.key]}</td>)}<td className="text-right"><button onClick={() => deleteFromDb(k, it.id, s)} className="text-red-600"><Trash2 size={12}/></button></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    );
  }
  
  const quotaRemaining = useMemo(() => {
    const quotaTotal = schoolProfile?.quota_total ?? 100;
    const quotaUsed = schoolProfile?.quota_used || 0;
    return quotaTotal - quotaUsed;
  }, [schoolProfile]);

  function renderViewContent() {
    switch (activePath) {
      case '/':
        if (role === 'guru') {
          return <TeacherDashboard 
            user={user}
            questionBanks={augmentedQuestionBanks}
            examSessions={examSessions}
            examSchedules={examSchedules}
            examResults={examResults}
            onNavigate={handleNavigate}
          />
        }
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {ROLE_PERMISSIONS[role].includes('settings-billing') && (
              <div onClick={() => handleNavigate('/pengaturan/billing')} className="cursor-pointer gov-card p-6 border-l-4 border-emerald-600 hover:shadow-lg transition-all">
                <CreditCard size={20} className="text-emerald-700 mb-2"/>
                <h3 className="text-4xl font-black text-gray-800">{quotaRemaining}</h3>
                <p className="text-[10px] font-black uppercase text-gray-400">Sisa Kuota Ujian</p>
              </div>
            )}
            {ROLE_PERMISSIONS[role].includes('data-users') && (
              <div onClick={() => handleNavigate('/data-pengguna/peserta')} className="cursor-pointer gov-card p-6 border-l-4 border-indigo-600 hover:shadow-lg transition-all">
                <User size={20} className="text-indigo-700 mb-2"/>
                <h3 className="text-4xl font-black text-gray-800">{students.length}</h3>
                <p className="text-[10px] font-black uppercase text-gray-400">Peserta Terdaftar</p>
              </div>
            )}
            {ROLE_PERMISSIONS[role].includes('question-bank') && (
              <div onClick={() => handleNavigate('/bank-soal')} className="cursor-pointer gov-card p-6 border-l-4 border-orange-600 hover:shadow-lg transition-all">
                <FileText size={20} className="text-orange-700 mb-2"/>
                <h3 className="text-4xl font-black text-gray-800">{questionBanks.length}</h3>
                <p className="text-[10px] font-black uppercase text-gray-400">Bank Soal Aktif</p>
              </div>
            )}
            {ROLE_PERMISSIONS[role].includes('exam-packages') && (
              <div onClick={() => handleNavigate('/paket-ujian')} className="cursor-pointer gov-card p-6 border-l-4 border-teal-600 hover:shadow-lg transition-all">
                <Layers size={20} className="text-teal-700 mb-2"/>
                <h3 className="text-4xl font-black text-gray-800">{examSchedules.length}</h3>
                <p className="text-[10px] font-black uppercase text-gray-400">Paket Ujian</p>
              </div>
            )}
            {ROLE_PERMISSIONS[role].includes('exam-execution') && (
              <div onClick={() => handleNavigate('/pelaksanaan')} className="cursor-pointer gov-card p-6 border-l-4 border-blue-600 hover:shadow-lg transition-all">
                <PlayCircle size={20} className="text-blue-700 mb-2"/>
                <h3 className="text-4xl font-black text-gray-800">{examSessions.filter((s: any) => s.status === 'Berlangsung').length}</h3>
                <p className="text-[10px] font-black uppercase text-gray-400">Sesi Berlangsung</p>
              </div>
            )}
             {ROLE_PERMISSIONS[role].includes('data-users') && (
              <div onClick={() => handleNavigate('/data-pengguna')} className="cursor-pointer gov-card p-6 border-l-4 border-slate-600 hover:shadow-lg transition-all">
                <Users size={20} className="text-slate-700 mb-2"/>
                <h3 className="text-4xl font-black text-gray-800">{teachers.length}</h3>
                <p className="text-[10px] font-black uppercase text-gray-400">Tenaga Pengelola</p>
              </div>
            )}
          </div>
        );
      case '/profil-sekolah':
        return isEditing ? <ProfileForm initialData={schoolProfile} onSave={(d) => { saveToDb('school_profile', d, setSchoolProfile); setIsEditing(false); }} onCancel={() => setIsEditing(false)} /> : <ProfilePreview data={schoolProfile} onEdit={() => setIsEditing(true)} onDelete={() => deleteFromDb('school_profile', schoolProfile?.id || '', setSchoolProfile)} onGoToForm={() => setIsEditing(true)} />;
      case '/konfigurasi/master':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderMaster('Tingkat Kelas', masterKelas, 'master_kelas', setMasterKelas, <GraduationCap size={14}/>, [{key: 'nama', label: 'Nama Kelas'}])}
              {renderMaster('Rombel', masterRombel, 'master_rombel', setMasterRombel, <Users size={14}/>, [{key: 'nama', label: 'Nama Rombel'}])}
              {renderMaster('Mata Pelajaran', masterMapel, 'master_mapel', setMasterMapel, <BookOpen size={14}/>, [{key: 'kode', label: 'Kode'}, {key: 'nama', label: 'Nama Mapel'}])}
              {renderMaster('Ruang Ujian', masterRuang, 'master_ruang', setMasterRuang, <MapPin size={14}/>, [{key: 'kode', label: 'Kode Ruang'}, {key: 'nama', label: 'Nama Ruang'}, {key: 'kapasitas', label: 'Kapasitas', type: 'number'}])}
            </div>
          </div>
        );
      case '/data-pengguna':
        if (isImporting) {
            return <TeacherImportModal 
                existingNips={teachers.map((t: Teacher) => t.nip)} 
                subjects={masterMapel}
                onImport={async ({ teachers: newTeachers }) => {
                    if (newTeachers.length > 0) {
                        await saveToDb('teachers', newTeachers, setTeachers, true);
                    }
                    setIsImporting(false);
                }}
                onCancel={() => setIsImporting(false)} 
            />;
        }
        if (isEditing) {
            return <TeacherForm 
                initialData={selectedItem}
                existingNips={teachers.map((t: Teacher) => t.nip)}
                subjects={masterMapel}
                onSave={async (data) => {
                    await saveToDb('teachers', data, setTeachers);
                    setIsEditing(false);
                    setSelectedItem(null);
                }}
                onCancel={() => { setIsEditing(false); setSelectedItem(null); }}
            />;
        }
        return <TeacherTable 
            data={teachers} 
            subjects={masterMapel}
            onAdd={() => { setSelectedItem(null); setIsEditing(true); }}
            onImport={() => setIsImporting(true)}
            onEdit={(teacher) => { setSelectedItem(teacher); setIsEditing(true); }}
            onDelete={(teacher) => deleteFromDb('teachers', teacher.id, setTeachers)}
            onToggleStatus={() => {}}
            onResetPassword={handleResetTeacherPassword}
            onConfirmAction={setConfirmAction}
        />;
      case '/data-pengguna/peserta':
        if (isImporting) {
            return <StudentImportModal 
                jenjang={schoolProfile?.jenjang}
                existingNis={students.map((s: Student) => s.nis)} 
                gradeLevels={masterKelas}
                rombels={masterRombel}
                onImport={async (newStudents) => {
                    if (newStudents.length > 0) {
                        await saveToDb('students', newStudents, setStudents, true);
                    }
                    setIsImporting(false);
                }}
                onCancel={() => setIsImporting(false)} 
            />;
        }
        if (isEditing) {
            return <StudentForm 
                initialData={selectedItem}
                existingNis={students.map((s: Student) => s.nis)}
                gradeLevels={masterKelas}
                rombels={masterRombel}
                roomsMaster={masterRuang}
                jenjang={schoolProfile?.jenjang}
                onSave={async (data) => {
                    await saveToDb('students', data, setStudents);
                    setIsEditing(false);
                    setSelectedItem(null);
                }}
                onCancel={() => { setIsEditing(false); setSelectedItem(null); }}
            />;
        }
        return <StudentTable
            data={students}
            gradeLevels={masterKelas}
            rombels={masterRombel}
            roomsMaster={masterRuang}
            jenjang={schoolProfile?.jenjang}
            onAdd={() => { setSelectedItem(null); setIsEditing(true); }}
            onImport={() => setIsImporting(true)}
            onEdit={(student) => { setSelectedItem(student); setIsEditing(true); }}
            onDelete={(student) => deleteFromDb('students', student.id, setStudents)}
            onConfirmAction={setConfirmAction}
        />;
      case '/bank-soal':
        const selectedBank = augmentedQuestionBanks.find((b: any) => b.id === selectedBankId);

        if (isEditing && selectedBank) {
            return <QuestionForm 
                initialData={selectedItem}
                bankContext={selectedBank}
                onSave={async (data, reset) => {
                    await saveToDb('questions', data, setQuestions);
                    if (!reset) {
                        setIsEditing(false);
                        setSelectedItem(null);
                    } else {
                        setSelectedItem(null); 
                    }
                }}
                onCancel={() => { setIsEditing(false); setSelectedItem(null); }}
            />
        }
        if (selectedBank) {
            return <QuestionListTable 
                bank={selectedBank}
                questions={questions.filter((q: any) => q.bank_id === selectedBankId)}
                onBack={() => setSelectedBankId(null)}
                onAddQuestion={() => { setSelectedItem(null); setIsEditing(true); }}
                onImportQuestions={async (newQuestions) => {
                    if (newQuestions.length > 0) {
                        await saveToDb('questions', newQuestions, setQuestions, true);
                    }
                }}
                onEditQuestion={(q) => { setSelectedItem(q); setIsEditing(true); }}
                onDeleteQuestion={(q) => deleteFromDb('questions', q.id, setQuestions)}
            />
        }
        if (isAddingBank) {
            return <QuestionBankForm 
                subjects={masterMapel}
                gradeLevels={masterKelas}
                existingBanks={questionBanks}
                onSave={async (data) => {
                    await saveToDb('question_banks', { ...data, id: `bank_${Date.now()}`, is_active: true }, setQuestionBanks, true);
                    setIsAddingBank(false);
                }}
                onCancel={() => setIsAddingBank(false)}
            />;
        }
        return <QuestionBankTable 
            data={augmentedQuestionBanks as any} 
            subjects={masterMapel}
            onAdd={() => setIsAddingBank(true)}
            onEdit={(bank) => {
            }}
            onDelete={(bank) => deleteFromDb('question_banks', bank.id, setQuestionBanks)}
            onViewDetails={(bank) => setSelectedBankId(bank.id)}
        />;
      case '/paket-ujian':
        if (activePackageView === 'contentManager' && selectedPackage) {
            return <PackageContentManager 
                pkg={selectedPackage}
                allQuestions={questions}
                onBack={() => {
                    setActivePackageView('list');
                    setSelectedPackage(null);
                }}
                onSave={async (updatedPkg) => {
                    await saveToDb('exam_schedules', updatedPkg, setExamSchedules);
                    setActivePackageView('list');
                    setSelectedPackage(null);
                }}
            />;
        }
        if (activePackageView === 'form') {
            return <PackageForm
                initialData={selectedPackage as any}
                questionBanks={questionBanks}
                questions={questions}
                onSave={async (d) => {
                    await saveToDb('exam_schedules', d, setExamSchedules);
                    setActivePackageView('list');
                    setSelectedPackage(null);
                }}
                onCancel={() => {
                    setActivePackageView('list');
                    setSelectedPackage(null);
                }}
            />;
        }
        return <PackageTable
            schedules={examSchedules}
            onAdd={() => {
                setSelectedPackage(null);
                setActivePackageView('form');
            }}
            onEdit={(pkg) => {
                setSelectedPackage(pkg);
                setActivePackageView('form');
            }}
            onDelete={(pkg) => deleteFromDb('exam_schedules', pkg.id, setExamSchedules)}
            onViewContent={(pkg) => {
                setSelectedPackage(pkg);
                setActivePackageView('contentManager');
            }}
        />;
        case '/jadwal-ujian':
            if (isEditing) {
                return <ExamSessionForm 
                    initialData={selectedItem}
                    packages={examSchedules.filter((p: any) => p.status === PKT_STATUS_READY)}
                    teachers={teachers}
                    roomsMaster={masterRuang}
                    students={students}
                    onSave={handleSaveSession}
                    onCancel={() => { setIsEditing(false); setSelectedItem(null); }}
                    schoolProfile={schoolProfile}
                />;
            }
            return <ExamSessionHub 
                sessions={examSessions}
                packages={examSchedules}
                roomsMaster={masterRuang}
                onAddSession={() => { setSelectedItem(null); setIsEditing(true); }}
                onEditSession={(s) => { setSelectedItem(s); setIsEditing(true); }}
                onDeleteSession={(s) => deleteFromDb('exam_sessions', s.id, setExamSessions)}
                onPrintRequest={(type, session, roomId) => {
                    const studentsInRoom = students.filter((std: any) => session.rooms.find(r => r.id === roomId)?.student_ids.includes(std.id));
                    setActivePrintJob({
                        type: 'OFFICIAL_DOC',
                        data: { type, school: schoolProfile, session, schedule: examSchedules.find((p: any) => p.id === session.schedule_id), students: studentsInRoom, selectedRoomId: roomId }
                    });
                }}
            />;
        case '/pelaksanaan':
            if (activeMonitoringSession) {
                const session = examSessions.find((s: any) => s.id === activeMonitoringSession);
                const pkg = examSchedules.find((p: any) => p.id === (session as any)?.schedule_id);
                if (!session || !pkg) return <div>Data sesi tidak ditemukan.</div>;

                return <ExamMonitoringDashboard 
                    session={session} pkg={pkg} students={students} results={examResults}
                    onBack={() => setActiveMonitoringSession(null)}
                    onUpdateStatus={handleUpdateSessionStatus}
                    onForceSubmit={handleForceSubmit}
                    onConfirmAction={setConfirmAction}
                />
            }
            return <ExamSessionHub 
                sessions={examSessions.filter((s: ExamSession) => s.status !== 'Selesai')}
                packages={examSchedules}
                roomsMaster={masterRuang}
                isMonitoringView={true}
                onMonitorSession={(session) => setActiveMonitoringSession(session.id)}
                onUpdateStatus={handleUpdateSessionStatus}
            />;
      case '/koreksi-esai':
        return <EssayCorrection 
            sessions={examSessions}
            results={examResults}
            questions={questions}
            schedules={examSchedules}
            onSaveResult={async (result) => {
              await saveToDb('exam_results', result, setExamResults);
            }}
            onBack={() => {}}
        />;
        case '/laporan':
            if (activeReportSchedule) {
                const schedule = examSchedules.find((s: any) => s.id === activeReportSchedule);
                if (!schedule) return <div>Jadwal tidak ditemukan.</div>;
                
                const relevantResults = examResults.filter((r: any) => 
                    examSessions.some((sess: any) => sess.schedule_id === (schedule as any).id && sess.id === r.session_id)
                );

                return <ReportDashboard 
                    schedule={schedule as any} results={relevantResults}
                    questions={questions.filter((q: any) => q.bank_id === (schedule as any).bank_id)}
                    students={students} school={schoolProfile}
                    onBack={() => setActiveReportSchedule(null)}
                    onPrintLeger={(payload) => setActivePrintJob({ type: 'LEGER', data: payload })}
                    onPrintAnalysis={(payload) => setActivePrintJob({ type: 'ANALISIS', data: payload })}
                />
            }

            return (
                <div className="space-y-4">
                    <div className="gov-card p-4 flex items-center justify-between bg-white shadow-sm">
                       <h2 className="text-sm font-black uppercase tracking-widest text-gray-700">Pilih Sesi Ujian Selesai</h2>
                    </div>
                    {reportableSchedules.length > 0 ? reportableSchedules.map((sch: ExamSchedule) => (
                        <div key={sch.id} className="gov-card p-4 flex justify-between items-center bg-white shadow-sm hover:bg-gray-50/50 transition-colors">
                            <div>
                                <p className="font-black text-gray-800 uppercase text-xs tracking-tight">{sch.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{sch.subject} - Kelas {sch.level}</p>
                            </div>
                            <button onClick={() => setActiveReportSchedule(sch.id)} className="px-5 py-2 bg-emerald-700 text-white rounded-sm font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                               <BarChart3 size={14}/> Lihat Laporan
                            </button>
                        </div>
                    )) : (
                       <div className="text-center py-20 text-gray-400 font-bold uppercase text-xs">
                          Tidak ada laporan yang tersedia.
                       </div>
                    )}
                </div>
            );
      default:
        return <div className="py-20 text-center text-gray-400 font-black uppercase text-[10px]">Pusat Kontrol Administratif</div>;
    }
  }

  if (activePrintJob) {
    const job: any = activePrintJob;
    if (job.type === 'LEGER') return <PrintLedgerNilai school={job.data.school} examName={job.data.examName} data={job.data.data} onDone={() => setActivePrintJob(null)} />;
    if (job.type === 'ANALISIS') return <PrintAnalisisButir school={job.data.school} schedule={job.data.schedule} data={job.data.data} onDone={() => setActivePrintJob(null)} />;
    if (job.type === 'OFFICIAL_DOC') return <PrintService type={job.data.type} school={job.data.school} session={job.data.session} schedule={job.data.schedule} students={job.data.students} selectedRoomId={job.data.selectedRoomId} onDone={() => setActivePrintJob(null)} />;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 overflow-hidden">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} onLogout={onLogout} onNavigate={handleNavigate} user={user} schoolName={schoolProfile?.nama_sekolah} quotaRemaining={quotaRemaining} />
      <div className="flex flex-1 pt-20 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          isCollapsed={isSidebarCollapsed} 
          activePath={activePath} 
          menuItems={filteredMenuItems}
          onNavigate={handleNavigate} 
          onLogout={onLogout} 
          onCloseMobile={() => setIsSidebarOpen(false)} 
          onToggleCollapse={() => {
            const newState = !isSidebarCollapsed;
            setIsSidebarCollapsed(newState);
            localStorage.setItem('emes_sidebar_collapsed', String(newState));
          }} 
        />
        <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} overflow-hidden`}>
          <div className="hidden md:block shrink-0">
            <Breadcrumb items={breadcrumbItems} onNavigateHome={() => handleNavigate('/')} />
          </div>
          <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto scrollbar-hide">
            {isSyncing && <div className="fixed bottom-6 right-6 bg-emerald-900 text-white px-4 py-2 rounded-full z-[100] flex items-center gap-2 shadow-2xl border border-emerald-400"><Cloud size={14} className="animate-pulse"/><span className="text-[9px] font-black uppercase">Sinkronisasi Cloud...</span></div>}
            {isLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-emerald-700 opacity-20" size={48}/></div> : renderViewContent()}
          </div>
           <footer className="px-10 pb-2 text-right shrink-0">
             <p className="text-[10px] font-bold text-slate-400">© 2026 Emes EduTech</p>
          </footer>
        </main>
      </div>
      {masterModal && <MasterDataForm title={(masterModal as any).title} item={(masterModal as any).item} fields={(masterModal as any).fields} onSave={(d) => { saveToDb((masterModal as any).stateKey, d, (masterModal as any).setter); setMasterModal(null); }} onCancel={() => setMasterModal(null)} />}
      {confirmAction && <ConfirmModal {...confirmAction} onCancel={() => setConfirmAction(null)} />}
    </div>
  );
};

export default AdminPortal;