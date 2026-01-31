
import React, { useMemo } from 'react';
import { Archive, AlertTriangle, DownloadCloud, Database, Calendar } from 'lucide-react';
import { ExamSession, ExamSchedule, ExamResult } from '../types';

interface BackupDataPageProps {
  sessions: ExamSession[];
  schedules: ExamSchedule[];
  results: ExamResult[];
  onBackupAndDelete: (sessionId: string) => void;
}

const BackupDataPage: React.FC<BackupDataPageProps> = ({ sessions, schedules, results, onBackupAndDelete }) => {
  
  const completedSessions = useMemo(() => {
    return sessions.filter(s => s.status === 'Selesai');
  }, [sessions]);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-700 text-white rounded-sm shadow-sm"><Archive size={20} /></div>
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Arsip & Manajemen Data</h2>
      </div>

      <div className="p-6 bg-orange-50 border-l-4 border-orange-500 rounded-r-sm shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} className="text-orange-600" />
          <h3 className="text-sm font-black text-orange-800 uppercase tracking-widest">Kebijakan Retensi Data</h3>
        </div>
        <p className="text-xs text-orange-700 font-bold leading-relaxed tracking-tight">
          Untuk menjaga performa sistem dan keamanan data jangka panjang, sesi ujian yang telah selesai **WAJIB diarsipkan** secara berkala (maksimal 7 hari setelah ujian).
          Proses "Backup & Hapus" akan mengunduh arsip data ke komputer Anda, lalu **MENGHAPUS DATA SECARA PERMANEN** dari server aktif untuk menjaga kelancaran sistem.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest border-b pb-3">Sesi Ujian Selesai (Siap Diarsip)</h3>
        {completedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedSessions.map(session => {
              // FIX: Changed scheduleId to schedule_id to match type definition
              const schedule = schedules.find(s => s.id === session.schedule_id);
              // FIX: Changed sessionId to session_id to match type definition
              const resultCount = results.filter(r => r.session_id === session.id).length;

              return (
                <div key={session.id} className="gov-card p-6 bg-white shadow-md border border-gray-200 flex flex-col gap-4">
                  <div>
                    <h4 className="font-black text-gray-800 uppercase text-sm truncate">{session.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Paket: {schedule?.name || 'N/A'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400"/>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Tanggal</p>
                        <p className="text-xs font-black text-gray-700">{session.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database size={16} className="text-gray-400"/>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Hasil Peserta</p>
                        <p className="text-xs font-black text-gray-700">{resultCount} Data</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onBackupAndDelete(session.id)}
                    className="mt-4 w-full py-3 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:bg-red-700 shadow-lg transition-all"
                  >
                    <DownloadCloud size={16} /> Backup & Hapus Permanen
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="gov-card p-12 text-center bg-gray-50/50 border-2 border-dashed border-gray-200 mt-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <Archive size={32} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Tidak Ada Data Untuk Diarsip</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto font-bold uppercase">
              Belum ada sesi ujian yang selesai dan siap untuk di-backup.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupDataPage;
