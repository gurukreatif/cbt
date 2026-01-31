
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  BookOpen,
  Layers,
  Clock,
  ChevronRight,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';
import { ExamSchedule } from '../types';

interface PackageTableProps {
  schedules: ExamSchedule[];
  onAdd: () => void;
  onEdit: (pkg: ExamSchedule) => void;
  onDelete: (pkg: ExamSchedule) => void;
  onViewContent: (pkg: ExamSchedule) => void;
}

const PackageTable: React.FC<PackageTableProps> = ({ 
  schedules, 
  onAdd, 
  onEdit, 
  onDelete, 
  onViewContent 
}) => {
  const [search, setSearch] = useState('');

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.subject.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [schedules, search]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Definisi Paket Ujian</h2>
          <p className="text-sm text-gray-500 font-medium">Pengelolaan naskah soal dan aturan pengerjaan (APA yang akan diujikan).</p>
        </div>
        <button 
          onClick={onAdd}
          className="px-6 py-2.5 bg-emerald-700 text-white rounded-sm font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-800 border border-emerald-900 shadow-sm transition-all"
        >
          <Plus size={14} /> Buat Definisi Paket Baru
        </button>
      </div>
      
      <div className="gov-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="CARI PAKET BERDASARKAN NAMA, KODE, ATAU MAPEL..."
            className="gov-input w-full pl-10 uppercase tracking-widest text-[10px] font-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchedules.map(pkg => (
          <div key={pkg.id} className="gov-card flex flex-col overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all duration-300 group">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-sm border border-emerald-200">
                  <Layers size={24} />
                </div>
                <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${
                  pkg.status === 'Siap Digunakan' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {pkg.status}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-black text-gray-800 uppercase tracking-tight truncate">{pkg.name}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase">{pkg.subject} - KELAS {pkg.level}</p>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
                   {/* FIX: Changed questionCount to question_count to match type definition */}
                   <span className="flex items-center gap-1.5"><BookOpen size={12}/> {pkg.question_count} Soal</span>
                   <span className="flex items-center gap-1.5"><Clock size={12}/> {pkg.duration} Min</span>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(pkg)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(pkg)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
            <button onClick={() => onViewContent(pkg)} className="w-full bg-gray-900 text-white p-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors">
              Buka Manajer Konten <ChevronRight size={16} />
            </button>
          </div>
        ))}

        {filteredSchedules.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-20">
            <Layers size={32} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm font-bold text-gray-400">Tidak ada paket ujian yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageTable;
