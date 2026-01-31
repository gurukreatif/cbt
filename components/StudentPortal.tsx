import React, { useState, useEffect, useMemo } from 'react';
import { STUDENT_MENU_ITEMS, SCHOOL_NAME, LOGO_URL } from '../constants.tsx';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';
import Breadcrumb from './Breadcrumb.tsx';
import { StudentExamInterface } from './StudentExamInterface.tsx';
import ExamResultView from './ExamResultView.tsx';
import DetailedResultView from './DetailedResultView.tsx';
import { supabase } from '../lib/supabase.ts';
import { CBTDatabase } from '../db.ts';
import { 
  Calendar, 
  History, 
  Loader2, 
  PlayCircle, 
  Clock, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  DownloadCloud,
  CheckCircle,
  Database,
  ChevronRight,
  Monitor,
  User,
  GraduationCap,
  Hash,
  School,
  CloudOff,
  AlertCircle
} from 'lucide-react';
import { ExamResult, StudentExamSession, Question, SchoolProfile } from '../types.ts';

interface StudentPortalProps {
  user: any;
  onLogout: () => void;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ user, onLogout }) => {
  const [activePath, setActivePath] = useState('/');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('emes_sidebar_collapsed') === 'true');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [now, setNow] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  
  const [sessions, setSessions] = useState([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [cachedBankIds, setCachedBankIds] = useState(new Set());

  const [currentExam, setCurrentExam] = useState<any>(null);
  const [examResultData, setExamResultData] = useState<ExamResult | null>(null);
  const [detailedResult, setDetailedResult] = useState<{result: ExamResult, questions: Question[]} | null>(null);

  const cbtDb = useMemo(() => {
    if (!user?.school_id) return null;
    return new CBTDatabase(user.school_id);
  }, [user?.school_id]);

  useEffect(() => {
    document.body.classList.add('anbk-bg-pattern');
    return () => {
      document.body.classList.remove('anbk-bg-pattern');
    };
  }, []);

  const syncPendingResults = async (signal?: AbortSignal) => {
    const localResults: ExamResult[] = JSON.parse(localStorage.getItem(`emes_res_${user.id}`) || '[]');
    const pending = localResults.filter(r => !r.synced);

    if (pending.length > 0 && navigator.onLine) {
      setIsSyncing(true);
      try {
        const query = supabase
          .from('exam_results')
          .insert(pending.map(({ synced, ...rest }) => ({ ...rest, school_id: user.school_id })))
          .abortSignal(signal);

        const { error } = await query;
        if (signal?.aborted) return;
        if (error) throw error;

        const updatedLocalResults = localResults.map(r => pending.find(p => p.id === r.id) ? { ...r, synced: true } : r);
        localStorage.setItem(`emes_res_${user.id}`, JSON.stringify(updatedLocalResults));
        if (signal?.aborted) return;
        setResults(updatedLocalResults);
      } catch (err: any) {
        const isAbortError = err.name === 'AbortError' || 
                            String(err.message || '').toLowerCase().includes('abort') ||
                            String(err.message || '').toLowerCase().includes('cancel');
        if (isAbortError) return;
        console.error("Sync failed:", err);
      } finally {
        if (!signal?.aborted) {
          setIsSyncing(false);
        }
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const timer = setInterval(() => setNow(new Date()), 10000);
    const handleStatusChange = () => {
      const onlineStatus = navigator.onLine;
      setIsOnline(onlineStatus);
      if (onlineStatus) {
        syncPendingResults(signal);
      }
    };
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    syncPendingResults(signal);

    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [user.id]);

  const loadPortalData = async (signal?: AbortSignal) => {
    if (!cbtDb) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const localSess = await cbtDb.getSchedules();
      const localResults = JSON.parse(localStorage.getItem(`emes_res_${user.id}`) || '[]');
      const localQuestions = await cbtDb.perform('questions', 'readonly', (s: any) => s.getAll());
      const cachedIds = new Set(localQuestions.map((q: any) => q.bank_id));
      
      if (signal?.aborted) return;
      setSessions(localSess as any);
      setResults(localResults);
      setCachedBankIds(cachedIds);

      if (navigator.onLine) {
        await syncPendingResults(signal);
        
        const { data: onlineProfile } = await supabase
          .from('school_profiles')
          .select('*')
          .eq('school_id', user.school_id)
          .abortSignal(signal)
          .maybeSingle();
        
        const { data: onlineSess } = await supabase
          .from('exam_sessions')
          .select('*, pkg:exam_schedules(*)')
          .eq('school_id', user.school_id)
          .neq('status', 'Disiapkan')
          .abortSignal(signal);
        
        const { data: onlineResults } = await supabase
          .from('exam_results')
          .select('*')
          .eq('student_id', user.id)
          .eq('school_id', user.school_id)
          .abortSignal(signal);

        if (signal?.aborted) return;
        
        if (onlineProfile) setSchoolProfile(onlineProfile as any);
        
        if (onlineSess) {
          const enrolledSessions = onlineSess.filter((s: any) => {
             const rooms = Array.isArray(s.rooms) ? s.rooms : JSON.parse(s.rooms || '[]');
             return rooms.some((r: any) => r.student_ids?.includes(user.id));
          });
          setSessions(enrolledSessions as any);
          await cbtDb.saveSchedules(enrolledSessions);
        }
        if (onlineResults) {
          const localUnsynced = localResults.filter((r: ExamResult) => !r.synced);
          const onlineIds = new Set(onlineResults.map((r: any) => r.id));
          const merged = [
            ...onlineResults.map((r: any) => ({ ...r, synced: true })),
            ...localUnsynced.filter(r => !onlineIds.has(r.id))
          ];
          setResults(merged);
          localStorage.setItem(`emes_res_${user.id}`, JSON.stringify(merged));
        }
      }

      const activeState = localStorage.getItem(`emes_active_exam_${user.id}`);
      if (activeState) {
        setCurrentExam(JSON.parse(activeState));
      }

    } catch (err: any) {
      const isAbortError = err.name === 'AbortError' || 
                          String(err.message || '').toLowerCase().includes('abort') ||
                          String(err.message || '').toLowerCase().includes('cancel');
      if (isAbortError) return;
      console.error(err);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadPortalData(controller.signal);

    const channel = supabase.channel(`student-portal-changes:${user.school_id}:${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'exam_sessions',
          filter: `school_id=eq.${user.school_id}`
        },
        (payload) => {
          console.log('Realtime session change received, refreshing student data...', payload);
          loadPortalData();
        }
      ).subscribe();

    return () => {
      controller.abort();
      supabase.removeChannel(channel);
    }
  }, [user.id, cbtDb]);

  const handleFinishExam = async (result: ExamResult) => {
    setIsSyncing(true);
    const resultToSave: ExamResult = { ...result, school_id: user.school_id, synced: false };
    
    const localResults: ExamResult[] = JSON.parse(localStorage.getItem(`emes_res_${user.id}`) || '[]');
    const updatedResults = [resultToSave, ...localResults.filter(r => r.id !== result.id)];
    localStorage.setItem(`emes_res_${user.id}`, JSON.stringify(updatedResults));
    setResults(updatedResults);
    
    localStorage.removeItem(`emes_active_exam_${user.id}`);
    localStorage.removeItem(`emes_exam_state_${user.id}_${result.session_id}`);

    if (navigator.onLine) {
      try {
        const { synced, ...payload } = resultToSave;
        const { error } = await supabase.from('exam_results').insert([payload]).select();
        if (error) throw error;
        
        const finalResults = JSON.parse(localStorage.getItem(`emes_res_${user.id}`) || '[]');
        const resultIndex = finalResults.findIndex((r: any) => r.id === resultToSave.id);
        if (resultIndex > -1) {
          finalResults[resultIndex].synced = true;
          localStorage.setItem(`emes_res_${user.id}`, JSON.stringify(finalResults));
          setResults(finalResults);
        }
      } catch (err) {
        console.error("Immediate sync failed:", err);
      }
    }
    
    setIsSyncing(false);
    setCurrentExam(null);
    setExamResultData(result);
  };

  const handleSyncBank = async (bankId: string) => {
    if (!isOnline) return alert("Offline: Butuh internet.");
    if (!cbtDb) return;
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.from('questions').select('*').eq('bank_id', bankId).eq('school_id', user.school_id);
      if (error) throw error;
      if (data) {
        await cbtDb.saveQuestions(data);
        const nextIds = new Set(cachedBankIds);
        nextIds.add(bankId);
        setCachedBankIds(nextIds);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMassSync = async () => {
    if (!isOnline) return alert("Offline: Butuh internet.");
    if (!cbtDb) return;
    setIsSyncing(true);
    try {
      const bankIds = [...new Set(sessions.map((s: any) => s.pkg?.bank_id))].filter(Boolean);
      const { data, error } = await supabase.from('questions').select('*').in('bank_id', bankIds).eq('school_id', user.school_id);
      if (error) throw error;
      if (data) {
        await cbtDb.saveQuestions(data);
        setCachedBankIds(new Set(data.map(q => q.bank_id)));
      }
      await syncPendingResults();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartExam = async (session: any) => {
    if (!session.canStart || !cbtDb) return;
    
    setIsLoading(true);
    try {
      const questions = await cbtDb.getQuestionsByBankId(session.pkg.bank_id);
      const room = session.rooms.find((r: any) => r.student_ids?.includes(user.id));
      
      const activeExam = {
        session: {
          studentId: user.id,
          studentName: user.nama,
          nis: user.nis,
          sessionId: session.id,
          sessionName: session.name,
          scheduleId: session.schedule_id,
          roomId: room?.id || '',
          loginTime: new Date().toISOString(),
          durationMinutes: session.pkg.duration,
          expiryTime: new Date(Date.now() + session.pkg.duration * 60000).toISOString(),
          passingGrade: session.pkg.passing_grade
        },
        questions
      };
      localStorage.setItem(`emes_active_exam_${user.id}`, JSON.stringify(activeExam));
      setCurrentExam(activeExam as any);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat soal.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewResultDetails = async (result: ExamResult) => {
    if (!cbtDb) return;
    setIsLoading(true);
    try {
        const session = sessions.find((s: any) => s.id === result.session_id) as any;
        if (!session || !session.pkg) throw new Error("Sesi ujian tidak ditemukan.");
        
        let questions = await cbtDb.getQuestionsByBankId(session.pkg.bank_id);
        if (!questions || questions.length === 0) {
          if(!isOnline) throw new Error("Data soal tidak ditemukan di perangkat (Offline).");
          const { data, error } = await supabase.from('questions').select('*').eq('bank_id', session.pkg.bank_id).eq('school_id', user.school_id);
          if (error) throw error;
          questions = data || [];
        }
        
        setDetailedResult({ result, questions });
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const examItems = useMemo(() => {
    return sessions.map((s: any) => {
      const pkg = s.pkg;
      const hasFinished = results.some((r: any) => r.session_id === s.id);
      const isSynced = cachedBankIds.has(pkg?.bank_id);
      const todayStr = new Date().toISOString().split('T')[0];
      const curMin = now.getHours() * 60 + now.getMinutes();
      const [sh, sm] = s.start_time.split(':').map(Number);
      const [eh, em] = s.end_time ? s.end_time.split(':').map(Number) : [23, 59];
      const smin = sh * 60 + sm;
      const emin = eh * 60 + em;

      let progressStatus = 'BELUM_DIMULAI';
      if (hasFinished) progressStatus = 'SELESAI';
      else if (s.date < todayStr || (s.date === todayStr && curMin > emin)) progressStatus = 'SELESAI';
      else if (s.date === todayStr && curMin >= smin && curMin <= emin) progressStatus = 'BERLANGSUNG';

      let canStart = false;
      let lockReason = "";
      if (hasFinished) lockReason = "Sudah Selesai";
      else if (!isSynced) lockReason = "Soal Belum Sinkron";
      else if (s.date > todayStr) lockReason = `Mulai ${s.date}`;
      else if (s.date === todayStr && curMin < smin) lockReason = `Mulai Jam ${s.start_time}`;
      else if (s.date < todayStr || (s.date === todayStr && curMin > emin)) lockReason = "Waktu Habis";
      else canStart = true;

      return { ...s, progressStatus, canStart, lockReason, isSynced };
    }).sort((a,b) => {
      if (a.progressStatus === 'BERLANGSUNG' && b.progressStatus !== 'BERLANGSUNG') return -1;
      if (b.progressStatus === 'BERLANGSUNG' && a.progressStatus !== 'BERLANGSUNG') return 1;
      return 0;
    });
  }, [sessions, results, now, cachedBankIds]);

  function renderContent() {
    switch (activePath) {
      case '/': return (
          <div className="flex flex-col h-full space-y-4 animate-in fade-in">
             <div className="gov-card p-5 md:p-10 bg-[#064e3b] text-white border-none shadow-xl relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-6 opacity-5"><ShieldCheck size={180} /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-2 py-0.5 bg-emerald-50 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-sm text-emerald-800">v7.5 EMES</div>
                    {isOnline ? <Wifi size={12} className="text-emerald-300"/> : <WifiOff size={12} className="text-orange-400"/>}
                  </div>
                  <h2 className="text-lg md:text-3xl font-black uppercase leading-tight">Halo, {user.nama.split(' ')[0]}</h2>
                  <p className="text-emerald-300 text-[9px] md:text-xs font-bold uppercase tracking-widest opacity-80">Kelas {user.kelas}</p>
                  
                  <div className="mt-6 md:mt-10 flex gap-2">
                     <button onClick={() => setActivePath('/jadwal-ujian-siswa')} className="flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 bg-white text-emerald-700 font-black text-[9px] md:text-[11px] uppercase tracking-widest rounded-lg transition-all active:scale-95 shadow-lg">
                       Jadwal
                     </button>
                     <button onClick={handleMassSync} disabled={isSyncing || !isOnline} className="flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 bg-emerald-600/30 text-emerald-50 border border-emerald-500/50 font-black text-[9px] md:text-[11px] uppercase tracking-widest rounded-lg disabled:opacity-30">
                       {isSyncing ? <RefreshCw size={14} className="animate-spin"/> : <DownloadCloud size={14} />} Sinkron
                     </button>
                  </div>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3 md:gap-8 shrink-0">
                <div onClick={() => setActivePath('/jadwal-ujian-siswa')} className="cursor-pointer gov-card p-4 md:p-8 bg-white border-l-4 md:border-l-8 border-l-emerald-600 active:bg-gray-50">
                   <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 md:mb-4">Ujian Aktif</p>
                   <h3 className="text-xl md:text-4xl font-black text-slate-800">{examItems.filter(i => i.progressStatus === 'BERLANGSUNG').length}</h3>
                </div>
                <div onClick={() => setActivePath('/riwayat-hasil')} className="cursor-pointer gov-card p-4 md:p-8 bg-white border-l-4 md:border-l-8 border-l-slate-800 active:bg-gray-50">
                   <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 md:mb-4">Selesai</p>
                   <h3 className="text-xl md:text-4xl font-black text-slate-800">{results.length}</h3>
                </div>
             </div>
             <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-100 p-4 overflow-hidden flex flex-col">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 shrink-0 flex items-center gap-2"><Monitor size={14}/> Sesi Terbaru</h4>
                <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                  {examItems.slice(0,3).map((it: any) => (
                    <div key={it.id} className="p-3 border border-gray-50 bg-gray-50/30 rounded-lg flex items-center justify-between">
                       <div className="min-w-0 pr-2">
                          <p className="text-[10px] font-bold text-gray-800 truncate uppercase">{it.pkg?.name}</p>
                          <p className="text-[8px] text-gray-400 font-bold">{it.start_time} WIB</p>
                       </div>
                       <ChevronRight size={14} className="text-gray-300"/>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        );
      case '/profil-user': return (
          <div className="flex flex-col h-full animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6 shrink-0">
               <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg"><User size={20}/></div>
               <h2 className="text-sm md:text-xl font-black text-slate-900 uppercase">Informasi Akun</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
              <div className="gov-card p-6 md:p-10 bg-white border-t-4 border-emerald-700 shadow-sm space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <User size={40} />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-black text-gray-900 uppercase tracking-tight leading-tight">{user.nama}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Status: {user.status || 'Aktif'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 text-emerald-600"><Hash size={16} /></div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">NIS / Identitas</p>
                      <p className="text-sm font-black text-gray-800 font-mono">{user.nis}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 text-emerald-600"><GraduationCap size={16} /></div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kelas & Rombel</p>
                      <p className="text-sm font-black text-gray-800 uppercase">{user.kelas} - {user.rombel}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 text-emerald-600"><School size={16} /></div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Instansi</p>
                      <p className="text-sm font-black text-gray-800 uppercase truncate max-w-[200px] md:max-w-none">{schoolProfile ? schoolProfile.nama_sekolah : SCHOOL_NAME}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg border border-gray-200 text-emerald-600"><User size={16} /></div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Username Login</p>
                      <p className="text-sm font-black text-gray-800 font-mono">{user.username}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case '/jadwal-ujian-siswa':
        return (
          <div className="flex flex-col h-full animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4 shrink-0">
               <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg"><Calendar size={20}/></div>
               <h2 className="text-sm md:text-xl font-black text-slate-900 uppercase">Jadwal Ujian</h2>
            </div>
            {examItems.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                 <Calendar size={48} className="text-gray-200 mb-4"/>
                 <h3 className="text-sm font-black text-gray-800 uppercase">Belum Ada Jadwal</h3>
                 <p className="text-xs text-gray-400 mt-1 max-w-xs">Tidak ada sesi ujian yang dijadwalkan untuk Anda saat ini. Silakan hubungi proktor.</p>
              </div>
            )}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide pb-20">
               {examItems.map((item: any) => (
                 <div key={item.id} className={`gov-card p-4 md:p-6 flex flex-col md:flex-row items-center justify-between transition-all border-l-4 md:border-l-8 ${
                   item.progressStatus === 'BERLANGSUNG' ? 'border-l-emerald-600 bg-white' : item.progressStatus === 'SELESAI' ? 'border-l-gray-300 bg-gray-50/70' : 'border-l-blue-400 bg-white'
                 }`}>
                    <div className="w-full md:w-auto space-y-2 mb-4 md:mb-0">
                       <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[7px] md:text-[9px] font-black uppercase tracking-widest border ${
                            item.isSynced ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : isOnline ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            {item.isSynced ? 'SYNC OK' : isOnline ? 'BELUM SINKRON' : 'OFFLINE'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[7px] md:text-[9px] font-black uppercase tracking-widest border ${
                            item.progressStatus === 'BERLANGSUNG' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-400 border-gray-200'
                          }`}>
                            {item.progressStatus.replace('_', ' ')}
                          </span>
                       </div>
                       <p className="text-xs md:text-base font-black uppercase text-slate-800 tracking-tight leading-tight">{item.pkg?.name}</p>
                       <div className="flex items-center gap-3 text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">
                          <span className="flex items-center gap-1"><Clock size={12}/> {item.start_time}</span>
                          <span className="flex items-center gap-1 border-l pl-3"><ShieldCheck size={12}/> {item.pkg?.duration}m</span>
                       </div>
                    </div>
                    <div className="w-full md:w-auto flex flex-col gap-2">
                      {item.canStart ? (
                        <button onClick={() => handleStartExam(item)} className="w-full md:px-10 py-3 bg-emerald-700 text-white rounded-lg font-black text-[10px] md:text-[11px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
                          <PlayCircle size={16}/> Mulai
                        </button>
                      ) : (
                        <div className="flex flex-col gap-1.5 items-center">
                           {!item.isSynced && isOnline && (
                             <button onClick={() => handleSyncBank(item.pkg.bank_id)} className="w-full py-2.5 bg-red-600 text-white font-black text-[8px] md:text-[10px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2">
                               <DownloadCloud size={14}/> Sinkron Soal
                             </button>
                           )}
                           <div className="w-full px-8 py-2.5 bg-gray-200 text-gray-500 font-black text-[9px] uppercase text-center rounded-lg border border-gray-300">
                             {item.lockReason}
                           </div>
                        </div>
                      )}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        );
      case '/riwayat-hasil':
        return (
          <div className="flex flex-col h-full animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4 shrink-0">
               <div className="p-2 bg-slate-800 text-white rounded-lg shadow-lg"><History size={20}/></div>
               <h2 className="text-sm md:text-xl font-black text-slate-900 uppercase">Riwayat Hasil</h2>
            </div>
            {results.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <History size={48} className="text-gray-200 mb-4"/>
                    <h3 className="text-sm font-black text-gray-800 uppercase">Riwayat Kosong</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">Anda belum menyelesaikan ujian apa pun.</p>
                </div>
            )}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide pb-20">
               {results.map((r: ExamResult) => (
                 <button key={r.id} onClick={() => handleViewResultDetails(r)} className="w-full gov-card p-4 flex items-center justify-between border-l-4 border-l-slate-800 bg-white hover:bg-gray-50/50 transition-colors">
                    <div className="min-w-0 pr-4 text-left">
                       <p className="text-[10px] md:text-xs font-black text-slate-800 truncate uppercase mb-1">{r.session_name || 'Ujian Selesai'}</p>
                       <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-wider">{new Date(r.end_time).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                       <div className="text-right">
                          <div className="flex items-center gap-2">
                            {!r.synced && <span title="Belum sinkron"><AlertCircle size={12} className="text-red-400" /></span>}
                            <p className="text-lg md:text-2xl font-black text-emerald-700 leading-none">{r.final_grade.toFixed(0)}</p>
                          </div>
                          <p className="text-[7px] font-black text-gray-300 uppercase">Skor</p>
                       </div>
                       <div className={`p-1.5 rounded-full ${r.synced ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-400'}`}>
                         {r.synced ? <CheckCircle size={16}/> : <CloudOff size={16}/>}
                       </div>
                    </div>
                 </button>
               ))}
            </div>
          </div>
        );
      default: return null;
    }
  }

  if (currentExam) return <StudentExamInterface user={user} session={currentExam.session} questions={currentExam.questions} onFinish={handleFinishExam} />;
  
  if (detailedResult) return <DetailedResultView result={detailedResult.result} questions={detailedResult.questions} onBack={() => { setDetailedResult(null); setExamResultData(null); }} />;
  
  if (examResultData) return <ExamResultView result={examResultData} onNavigate={(action) => {
    if (action === 'exit') onLogout();
    if (action === 'details') handleViewResultDetails(examResultData);
  }} />;

  return (
    <div className="h-full flex flex-col anbk-bg-pattern">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} onLogout={onLogout} onNavigate={setActivePath} user={user} schoolName={schoolProfile ? schoolProfile.nama_sekolah : null} />
      <div className="flex flex-1 pt-20 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          isCollapsed={isSidebarCollapsed} 
          activePath={activePath} 
          menuItems={STUDENT_MENU_ITEMS} 
          onNavigate={setActivePath} 
          onLogout={onLogout} 
          onCloseMobile={() => setIsSidebarOpen(false)} 
          onToggleCollapse={() => {
            const newState = !isSidebarCollapsed;
            setIsSidebarCollapsed(newState);
            localStorage.setItem('emes_sidebar_collapsed', String(newState));
          }}
        />
        <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} overflow-hidden`}>
          <div className="hidden md:block shrink-0"><Breadcrumb items={[{ label: STUDENT_MENU_ITEMS.find(i => i.path === activePath)?.label || 'Beranda' }]} onNavigateHome={() => setActivePath('/')} /></div>
          <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full overflow-hidden">
             {isLoading ? (
               <div className="h-full flex flex-col items-center justify-center gap-4">
                  <Loader2 size={40} className="animate-spin text-emerald-600 opacity-20"/>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sinkronisasi Server...</p>
               </div>
             ) : renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentPortal;