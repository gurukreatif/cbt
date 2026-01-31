
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  ArrowLeft,
  Database,
  WifiOff,
  Cloud,
  Loader2,
  Clock,
  RefreshCw,
  Lock,
  PlayCircle,
  AlertOctagon,
  Key,
  ArrowUpCircle
} from 'lucide-react';
import { 
  ExamSession, 
  ExamSchedule, 
  Student, 
  StudentMonitoringState, 
  ExamResult
} from '../types';

interface ExamMonitoringDashboardProps {
  session: ExamSession;
  pkg: ExamSchedule;
  students: Student[];
  results: ExamResult[];
  onBack: () => void;
  onUpdateStatus?: (sessionId: string, status: string) => void;
  onResetResult?: (resultId: string) => void;
  onForceSubmit?: (resultId: string) => void;
  onConfirmAction: (config: { title: string; message: string; onConfirm: () => void; type?: 'danger'|'warning' }) => void;
  readOnly?: boolean;
}

const ExamMonitoringDashboard: React.FC<ExamMonitoringDashboardProps> = ({ 
  session, 
  pkg, 
  students, 
  results,
  onBack, 
  onUpdateStatus,
  onResetResult,
  onForceSubmit,
  onConfirmAction,
  readOnly = false
}) => {
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const monitoringData = useMemo(() => {
    // FIX: Changed camelCase studentIds to snake_case student_ids to match type definitions
    const enrolledIds = new Set(session.rooms.flatMap(r => r.student_ids));
    const scheduledStudents = students.filter(s => enrolledIds.has(s.id));

    return scheduledStudents.map(s => {
      const result = results.find(r => r.student_id === s.id && r.session_id === session.id);
      
      let status: StudentMonitoringState['status'] = 'Belum Login';
      if (result) {
        if(result.synced === true) status = 'Sudah Dikirim';
        else if (result.status === 'Tersimpan Lokal') status = 'Tersimpan Lokal';
        else if (result.status === 'Gagal Sinkron') status = 'Gagal Sinkron';
        else if (result.status === 'Selesai' || result.status === 'Auto-Submit') status = 'Sudah Dikirim';
        else status = 'Sedang Ujian';
      }

      return {
        studentId: s.id,
        nis: s.nis,
        nama: s.nama,
        kelas: s.kelas,
        status: status,
        progress: result ? result.answered : 0,
        // FIX: Changed questionCount to question_count to match type definition
        totalSoal: pkg.question_count,
        loginTime: result?.start_time,
        submitTime: result?.end_time,
        extraTime: 0,
        isBlocked: false,
        resultId: result?.id
      } as StudentMonitoringState;
    });
  }, [session, pkg, students, results]);

  const stats = useMemo(() => ({
    total: monitoringData.length,
    synced: monitoringData.filter(d => d.status === 'Sudah Dikirim').length,
    tersimpanLokal: monitoringData.filter(d => d.status === 'Tersimpan Lokal').length,
    active: monitoringData.filter(d => d.status === 'Sedang Ujian').length,
    absent: monitoringData.filter(d => d.status === 'Belum Login').length
  }), [monitoringData]);

  const filteredList = monitoringData.filter(d => {
    return (d.nama + d.nis).toLowerCase().includes(search.toLowerCase());
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefresh(new Date());
    }, 800);
  };

  const getStatusConfig = (status: StudentMonitoringState['status']) => {
    switch(status) {
      case 'Sudah Dikirim': return { text: 'SYNC OK', color: 'border-emerald-500 bg-emerald-50', icon: <CheckCircle2 size={16} className="text-emerald-600"/> };
      case 'Sedang Ujian': return { text: 'MENGERJAKAN (OFFLINE)', color: 'border-blue-500 bg-blue-50 animate-pulse', icon: <PlayCircle size={16} className="text-blue-600"/> };
      case 'Tersimpan Lokal': return { text: 'SELESAI (LOKAL)', color: 'border-amber-500 bg-amber-50', icon: <ArrowUpCircle size={16} className="text-amber-600"/> };
      case 'Gagal Sinkron': return { text: 'GAGAL SYNC', color: 'border-red-500 bg-red-50', icon: <WifiOff size={16} className="text-red-600"/> };
      case 'Diblokir': return { text: 'DIBLOKIR', color: 'border-red-500 bg-red-50', icon: <AlertOctagon size={16} className="text-red-600"/> };
      default: return { text: 'BELUM LOGIN', color: 'border-gray-300 bg-gray-50', icon: <Clock size={16} className="text-gray-400"/> };
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-gray-800">
          <ArrowLeft size={14}/> Kembali ke Sesi
        </button>
        <div className="flex gap-2">
          {readOnly && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-sm font-black text-[9px] uppercase tracking-widest">
              <Lock size={12}/> Mode Pantau (Read-Only)
            </div>
          )}
          <button onClick={handleRefresh} disabled={isRefreshing} className="px-5 py-2 bg-gray-900 text-white rounded-sm font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black shadow-md">
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Refresh Data
          </button>
        </div>
      </div>

      <div className="gov-card p-6 bg-white border-l-4 border-l-emerald-700 shadow-md flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <span className="px-2 py-0.5 bg-gray-900 text-white text-[10px] font-black rounded-sm uppercase tracking-widest">MONITORING RUANG</span>
             <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{session.name}</h2>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Paket: {pkg.name} | Sesi: {session.start_time} WIB</p>
        </div>
        <div className="flex items-center gap-6">
            <div className="flex flex-col items-end justify-center">
               <div className="flex items-center gap-2 text-amber-700">
                 <ArrowUpCircle size={20} />
                 <span className="text-2xl font-black">{stats.tersimpanLokal}</span>
               </div>
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Menunggu Sinkron</p>
            </div>
            <div className="flex flex-col items-end justify-center">
               <div className="flex items-center gap-2 text-emerald-700">
                 <Database size={20} />
                 <span className="text-2xl font-black">{stats.synced} / {stats.total}</span>
               </div>
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Jawaban di Cloud</p>
            </div>
        </div>
      </div>

      <div className="gov-card p-4 bg-white shadow-sm border border-gray-200 flex items-center justify-between">
         <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} className="gov-input w-full pl-10 text-[10px] font-black uppercase" placeholder="Cari NIS atau Nama Peserta..." />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-gray-400 uppercase">Update Terakhir: {lastRefresh.toLocaleTimeString()}</span>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredList.map(d => {
          const status = getStatusConfig(d.status);
          return (
            <div key={d.studentId} className={`gov-card bg-white border-2 ${status.color} transition-all shadow-sm group`}>
              <div className="p-4 border-b border-gray-100">
                 <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-gray-800 uppercase truncate pr-4">{d.nama}</h4>
                      <p className="text-[9px] font-mono text-gray-400 font-bold">{d.nis}</p>
                    </div>
                    {status.icon}
                 </div>
                 <div className="flex justify-between items-center mt-3">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{status.text}</p>
                   <p className="text-[10px] font-black text-gray-700">{d.progress} / {d.totalSoal}</p>
                 </div>
                 <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mt-1">
                   <div className="bg-emerald-500 h-full" style={{ width: `${(d.progress/d.totalSoal)*100}%` }}></div>
                 </div>
              </div>
              {!readOnly && (
                <div className="p-2 flex justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => onConfirmAction({ title:'Reset Login Peserta', message:`Konfirmasi reset login untuk ${d.nama}? Peserta akan dapat login kembali di perangkat lain.`, type:'warning', onConfirm:() => onResetResult && onResetResult(d.resultId || '')})} 
                     className="p-1.5 hover:bg-orange-50 text-orange-400 hover:text-orange-600 rounded-sm transition-colors" title="Reset Login">
                     <Key size={14} />
                   </button>
                   <button className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-sm transition-colors" title="Blokir Peserta">
                     <AlertOctagon size={14} />
                   </button>
                   <button className="p-1.5 hover:bg-blue-50 text-blue-400 hover:text-blue-600 rounded-sm transition-colors" title="Tambah Waktu">
                     <Clock size={14} />
                   </button>
                   <button 
                    onClick={() => onConfirmAction({
                      title: 'Submit Paksa Jawaban',
                      message: `Anda akan memaksa submit jawaban untuk ${d.nama}. Sesi peserta akan berakhir.`,
                      type: 'warning',
                      onConfirm: () => onForceSubmit && onForceSubmit(d.resultId || '')
                    })}
                    className="p-1.5 hover:bg-emerald-50 text-emerald-400 hover:text-emerald-600 rounded-sm transition-colors" title="Submit Paksa">
                     <CheckCircle2 size={14} />
                   </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default ExamMonitoringDashboard;
