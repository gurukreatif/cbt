
import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  Search, 
  Clock, 
  MapPin, 
  Users, 
  Edit2, 
  Trash2, 
  Printer,
  ChevronRight,
  BookOpen,
  ChevronLeft,
  X,
  FileText,
  ClipboardCheck,
  UserSquare2,
  Monitor,
  Play,
  Square
} from 'lucide-react';
import { ExamSession, ExamSchedule, ExamRoom } from '../types';

interface ExamSessionHubProps {
  sessions: ExamSession[];
  packages: ExamSchedule[];
  roomsMaster: ExamRoom[];
  onAddSession?: () => void;
  onEditSession?: (s: ExamSession) => void;
  onDeleteSession?: (s: ExamSession) => void;
  onPrintRequest?: (type: 'BERITA_ACARA' | 'DAFTAR_HADIR' | 'KARTU', session: ExamSession, roomId: string) => void;
  isMonitoringView?: boolean;
  onMonitorSession?: (s: ExamSession) => void;
  onUpdateStatus?: (sessionId: string, status: string) => void;
}

const ExamSessionHub: React.FC<ExamSessionHubProps> = ({ 
  sessions, 
  packages, 
  roomsMaster,
  onAddSession, 
  onEditSession, 
  onDeleteSession,
  onPrintRequest,
  isMonitoringView = false,
  onMonitorSession,
  onUpdateStatus
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [activePrintMenu, setActivePrintMenu] = useState<{ id: string, rect: DOMRect } | null>(null);
  const [roomSelectModal, setRoomSelectModal] = useState<{ session: ExamSession, type: 'BERITA_ACARA' | 'DAFTAR_HADIR' | 'KARTU' } | null>(null);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // FIX: Changed scheduleId to schedule_id to match type definition
      const pkg = packages.find(p => p.id === s.schedule_id);
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || (pkg?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === '' || s.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [sessions, packages, search, filterStatus]);

  const StatusBadge = ({ status }: { status: ExamSession['status'] }) => {
    const colors = {
      'Disiapkan': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Berlangsung': 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
      'Selesai': 'bg-gray-50 text-gray-500 border-gray-200'
    };
    return (
      <span className={`px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const activePrintSession = useMemo(() => {
    return sessions.find(s => s.id === activePrintMenu?.id);
  }, [sessions, activePrintMenu]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{isMonitoringView ? 'Pusat Kontrol Pelaksanaan' : 'Pelaksanaan & Jadwal Sesi Ujian'}</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{isMonitoringView ? 'Monitor sesi yang sedang atau akan berlangsung.' : 'Konfigurasi waktu pengerjaan (Ruang/Peserta ditarik dari Profil Siswa)'}</p>
        </div>
        {!isMonitoringView && onAddSession && (
          <button 
            onClick={onAddSession}
            className="px-6 py-2.5 bg-emerald-700 text-white rounded-sm font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-800 border border-emerald-900 shadow-sm transition-all active:scale-95"
          >
            <Plus size={14} /> Buat Jadwal Sesi Baru
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between">
        <h3 className="text-sm font-black uppercase text-gray-700 tracking-widest">Daftar Sesi Ujian</h3>
        <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="CARI SESI..." 
                className="gov-input pl-8 py-1.5 text-[10px] w-48 font-black uppercase" 
              />
            </div>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="gov-input py-1.5 text-[10px] uppercase font-black"
            >
              <option value="">SEMUA STATUS</option>
              <option value="Disiapkan">DISIAPKAN</option>
              <option value="Berlangsung">BERLANGSUNG</option>
              <option value="Selesai">SELESAI</option>
            </select>
        </div>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th className="w-12 text-center">No</th>
              <th>Waktu Pelaksanaan</th>
              <th>Nama Sesi & Paket Referensi</th>
              <th className="text-center">Status</th>
              <th className="text-right w-48">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.length > 0 ? filteredSessions.map((s, idx) => {
              // FIX: Changed scheduleId to schedule_id to match type definition
              const pkg = packages.find(p => p.id === s.schedule_id);
              const isPrinting = activePrintMenu?.id === s.id;
              
              return (
                <tr key={s.id} className="relative">
                  <td className="text-center text-xs font-bold text-gray-500">{idx + 1}</td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-emerald-800 uppercase leading-none mb-1">{s.date}</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                        {/* FIX: Changed startTime to start_time and endTime to end_time to match type definition */}
                        <Clock size={10} /> {s.start_time} - {s.end_time}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-black text-gray-900 uppercase text-xs tracking-tight">{s.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-gray-400">
                        <BookOpen size={10} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">DEF: {pkg?.name || 'ERR'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-center"><StatusBadge status={s.status} /></td>
                  <td className="text-right">
                    {isMonitoringView ? (
                        <div className="flex justify-end gap-1.5">
                            <button onClick={() => onMonitorSession && onMonitorSession(s)} className="px-3 py-1.5 bg-blue-600 text-white rounded-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Monitor size={12}/> Monitor</button>
                            {s.status === 'Disiapkan' && <button onClick={() => onUpdateStatus && onUpdateStatus(s.id, 'Berlangsung')} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-sm" title="Mulai Sesi"><Play size={12}/></button>}
                            {s.status === 'Berlangsung' && <button onClick={() => onUpdateStatus && onUpdateStatus(s.id, 'Selesai')} className="p-1.5 bg-red-100 text-red-700 rounded-sm" title="Akhiri Sesi"><Square size={12}/></button>}
                        </div>
                    ) : (
                        <div className="flex justify-end gap-1.5">
                            <button onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setActivePrintMenu(activePrintMenu?.id === s.id ? null : { id: s.id, rect }); }} className={`p-1.5 border rounded-sm transition-all ${isPrinting ? 'bg-emerald-700 text-white border-emerald-800 shadow-inner' : 'border-gray-200 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50'}`} title="Cetak Dokumen"><Printer size={12} /></button>
                            <button onClick={() => onEditSession && onEditSession(s)} className="p-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 text-gray-400 hover:text-emerald-700" title="Edit Jadwal"><Edit2 size={12} /></button>
                            <button onClick={() => onDeleteSession && onDeleteSession(s)} className="p-1.5 border border-gray-200 rounded-sm hover:bg-red-50 text-gray-400 hover:text-red-700" title="Hapus"><Trash2 size={12} /></button>
                        </div>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={5} className="text-center py-24 bg-gray-50/30"><CalendarIcon size={32} className="mx-auto text-gray-200 mb-2" /><p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Data Sesi Pelaksanaan Belum Ditemukan</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {activePrintMenu && activePrintSession && onPrintRequest && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setActivePrintMenu(null)}></div>
          <div style={{ position: 'fixed', top: `${activePrintMenu.rect.bottom + 4}px`, left: `${activePrintMenu.rect.right - 208}px`, width: '208px' }} className="bg-white border border-gray-300 shadow-2xl z-[9999] rounded-sm py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50 mb-1"><p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Opsi Dokumen Resmi</p></div>
            <button onClick={() => { setRoomSelectModal({ session: activePrintSession, type: 'KARTU' }); setActivePrintMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-[10px] font-bold uppercase text-gray-700"><UserSquare2 size={14} className="text-emerald-600" /> Cetak Kartu Peserta</button>
            <button onClick={() => { setRoomSelectModal({ session: activePrintSession, type: 'BERITA_ACARA' }); setActivePrintMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-[10px] font-bold uppercase text-gray-700"><FileText size={14} className="text-emerald-600" /> Cetak Berita Acara</button>
            <button onClick={() => { setRoomSelectModal({ session: activePrintSession, type: 'DAFTAR_HADIR' }); setActivePrintMenu(null); }} className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-[10px] font-bold uppercase text-gray-700"><ClipboardCheck size={14} className="text-emerald-600" /> Cetak Daftar Hadir</button>
          </div>
        </>
      )}

      {roomSelectModal && onPrintRequest && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-sm shadow-2xl w-full max-w-md animate-in zoom-in duration-200 border border-gray-300">
              <div className="p-6 text-center border-b bg-gray-50"><div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4"><Printer size={24} /></div><h3 className="text-sm font-black uppercase tracking-tight text-gray-800">Pilih Ruang Ujian</h3><p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Filter dokumen berdasarkan lokasi master ruang:</p></div>
              <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                 {roomsMaster.map(room => (<button key={room.id} onClick={() => { onPrintRequest(roomSelectModal.type, roomSelectModal.session, room.id); setRoomSelectModal(null); }} className="w-full p-4 border border-gray-200 rounded-sm hover:bg-emerald-50 hover:border-emerald-200 text-left transition-all group flex items-center justify-between"><div><p className="text-[10px] font-black text-gray-700 uppercase group-hover:text-emerald-800">Ruang: {room.nama}</p><p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{room.kode}</p></div><ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-600" /></button>))}
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-end"><button onClick={() => setRoomSelectModal(null)} className="px-6 py-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">Batal</button></div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ExamSessionHub;
