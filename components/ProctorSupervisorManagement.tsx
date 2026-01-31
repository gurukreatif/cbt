import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Key, 
  Trash2, 
  Calendar, 
  MapPin,
  X
} from 'lucide-react';
import { Proctor, Supervisor, Teacher, ExamAssignment, ExamRoom } from '../types';

const RoleRow: React.FC<{
  idx: number;
  item: Proctor | Supervisor;
  onDelete: (id: string) => void;
  onResetPass: () => void;
  onAssign?: () => void;
}> = ({ idx, item, onDelete, onResetPass, onAssign }) => (
  <tr className="hover:bg-gray-50/80 transition-all group">
    <td className="px-6 py-4 text-center text-sm text-gray-500 font-bold">{idx + 1}</td>
    <td className="px-6 py-4">
      <div className="flex flex-col">
        <span className="font-bold text-gray-900">{item.nama}</span>
        <span className="text-xs text-gray-400">{item.nip || 'Manual Input'}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-col text-xs font-mono">
        <span className="text-emerald-700 font-bold">@{item.username}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2">
        {onAssign && (
          <button onClick={onAssign} className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Tugaskan"><Calendar size={16} /></button>
        )}
        <button onClick={onResetPass} className="p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Reset Password"><Key size={16} /></button>
        <button onClick={() => onDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Hapus Akses"><Trash2 size={16} /></button>
      </div>
    </td>
  </tr>
);

const AssignmentRow: React.FC<{
  item: ExamAssignment;
  supervisor: Supervisor | undefined;
  onDelete: (id: string) => void;
}> = ({ item, supervisor, onDelete }) => (
  <tr className="hover:bg-gray-50 transition-all">
    <td className="px-6 py-4"><div className="flex flex-col"><span className="font-bold text-gray-900">{supervisor?.nama || 'N/A'}</span><span className="text-xs text-emerald-600">@{supervisor?.username || '-'}</span></div></td>
    <td className="px-6 py-4"><div className="flex flex-col"><span className="font-bold text-gray-800">{item.namaUjian}</span><span className="text-[10px] text-gray-400 font-bold uppercase">{item.tanggal}</span></div></td>
    <td className="px-6 py-4 text-sm font-bold text-gray-700 flex items-center gap-1.5"><MapPin size={12} className="text-blue-500" /> {item.ruang}</td>
    <td className="px-6 py-4 text-right"><button onClick={() => onDelete(item.id)} className="text-red-600 text-xs font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg">Batalkan</button></td>
  </tr>
);

interface ManagementProps {
  teachers: Teacher[];
  proctors: Proctor[];
  supervisors: Supervisor[];
  assignments: ExamAssignment[];
  rooms: ExamRoom[];
  onAddProctor: (data: Proctor) => void;
  onAddSupervisor: (data: Supervisor) => void;
  onDeleteProctor: (id: string) => void;
  onDeleteSupervisor: (id: string) => void;
  onAddAssignment: (data: ExamAssignment) => void;
  onDeleteAssignment: (id: string) => void;
}

const ProctorSupervisorManagement: React.FC<ManagementProps> = ({
  teachers, proctors, supervisors, assignments, rooms,
  onAddProctor, onAddSupervisor, onDeleteProctor, onDeleteSupervisor,
  onAddAssignment, onDeleteAssignment
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'proctor' | 'supervisor' | 'assignment'>('proctor');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resetPassData, setResetPassData] = useState<{username: string, pass: string} | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Manajemen Hak Akses & Tugas</h3>
          <p className="text-sm text-gray-500">Konfigurasi akun monitoring dan jadwal pengawasan.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg"
        >
          <Plus size={18} /> Tambah {activeSubTab === 'assignment' ? 'Tugas' : activeSubTab === 'proctor' ? 'Proktor' : 'Pengawas'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-100 mb-6">
         {['proctor', 'supervisor', 'assignment'].map((t) => (
           <button 
             key={t}
             onClick={() => setActiveSubTab(t as any)}
             className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeSubTab === t ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
           >
             {t === 'proctor' ? 'Data Proktor' : t === 'supervisor' ? 'Data Pengawas' : 'Penugasan Pengawas'}
           </button>
         ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            {activeSubTab === 'assignment' ? (
              <tr><th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Pengawas</th><th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Sesi</th><th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ruang</th><th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Aksi</th></tr>
            ) : (
              <tr><th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-12 text-center">No</th><th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Identitas</th><th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Username</th><th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Aksi</th></tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activeSubTab === 'proctor' && proctors.map((item, idx) => (
              <RoleRow key={item.id} idx={idx} item={item} onDelete={onDeleteProctor} onResetPass={() => setResetPassData({ username: item.username, pass: 'ABC12345' })} />
            ))}
            {activeSubTab === 'supervisor' && supervisors.map((item, idx) => (
              <RoleRow key={item.id} idx={idx} item={item} onDelete={onDeleteSupervisor} onResetPass={() => setResetPassData({ username: item.username, pass: 'ABC12345' })} />
            ))}
            {activeSubTab === 'assignment' && assignments.map((item) => (
              <AssignmentRow key={item.id} item={item} supervisor={supervisors.find(s => s.id === item.supervisorId)} onDelete={onDeleteAssignment} />
            ))}
            {((activeSubTab === 'proctor' && proctors.length === 0) || (activeSubTab === 'supervisor' && supervisors.length === 0) || (activeSubTab === 'assignment' && assignments.length === 0)) && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-sm">Data belum tersedia dari Master Data.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 uppercase tracking-tight">Formulir {activeSubTab === 'assignment' ? 'Tugas' : 'Akses'} Baru</h3>
              
              {activeSubTab === 'assignment' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Pilih Pengawas</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">-- Pilih --</option>
                      {supervisors.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Pilih Ruang Ujian (Dari Master)</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">-- Pilih Ruang --</option>
                      {rooms.map(rm => <option key={rm.id} value={rm.nama}>{rm.nama} ({rm.kode})</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">Pilih guru untuk diberikan hak akses sebagai {activeSubTab === 'proctor' ? 'Proktor' : 'Pengawas'}.</p>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">-- Pilih Guru --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl">Batal</button>
                <button className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Simpan Data</button>
              </div>
           </div>
        </div>
      )}

      {resetPassData && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in">
            <Key size={48} className="mx-auto text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Akses Berhasil Dibuat</h3>
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 mb-6">
              <p className="text-xs text-gray-400 font-bold">USERNAME: <span className="text-gray-900">{resetPassData.username}</span></p>
              <p className="text-xs text-gray-400 font-bold">PASSWORD: <span className="text-emerald-700 font-mono text-lg">{resetPassData.pass}</span></p>
            </div>
            <button onClick={() => setResetPassData(null)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold">Selesai</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctorSupervisorManagement;