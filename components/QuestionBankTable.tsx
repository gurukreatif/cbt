
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  Layers, 
  CheckCircle, 
  XCircle,
  Filter,
  BookOpen
} from 'lucide-react';
import { QuestionBank, SubjectMaster } from '../types';

interface QuestionBankTableProps {
  data: QuestionBank[];
  subjects: SubjectMaster[];
  onAdd: () => void;
  onEdit: (bank: QuestionBank) => void;
  onDelete: (bank: QuestionBank) => void;
  onViewDetails: (bank: QuestionBank) => void;
}

const QuestionBankTable: React.FC<QuestionBankTableProps> = ({ 
  data, 
  subjects,
  onAdd, 
  onEdit, 
  onDelete, 
  onViewDetails 
}) => {
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(bank => {
      const matchSearch = bank.subject.toLowerCase().includes(search.toLowerCase());
      const matchSubject = filterSubject === '' || bank.subject === filterSubject;
      return matchSearch && matchSubject;
    });
  }, [data, search, filterSubject]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="gov-card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Mata Pelajaran..."
            className="gov-input w-full pl-10"
          />
        </div>
        <select 
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="gov-input min-w-[180px] font-bold text-xs uppercase"
        >
          <option value="">Semua Mapel</option>
          {subjects.map(s => <option key={s.id} value={s.nama}>{s.nama}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map(bank => (
          <div key={bank.id} className="gov-card flex flex-col overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all duration-300">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-sm border border-emerald-200">
                  <BookOpen size={24} />
                </div>
                {/* FIX: Changed isActive to is_active to match type definition */}
                <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${
                  bank.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {/* FIX: Changed isActive to is_active to match type definition */}
                  {bank.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-black text-gray-800 uppercase tracking-tight">{bank.subject}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase">Kelas {bank.level}</p>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Jumlah Soal</p>
                  {/* FIX: Changed questionCount to question_count to match type definition */}
                  <p className="text-xl font-black text-emerald-800">{bank.question_count}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => onDelete(bank)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"><Trash2 size={16} /></button>
                  <button onClick={() => onEdit(bank)} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"><Edit2 size={16} /></button>
                </div>
              </div>
            </div>
            <button onClick={() => onViewDetails(bank)} className="w-full bg-gray-900 text-white p-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors">
              Buka Bank Soal <ChevronRight size={16} />
            </button>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-20">
            <Layers size={32} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm font-bold text-gray-400">Tidak ada bank soal yang cocok.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankTable;
