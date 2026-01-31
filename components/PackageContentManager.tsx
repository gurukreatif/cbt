
import React, { useState, useMemo } from 'react';
import { ArrowLeft, BookOpen, Layers, CheckCircle, Save, AlertCircle, Eye } from 'lucide-react';
import { ExamSchedule, Question } from '../types';
import QuestionPreviewModal from './QuestionPreviewModal.tsx';

interface PackageContentManagerProps {
  pkg: ExamSchedule;
  allQuestions: Question[];
  onBack: () => void;
  onSave: (pkg: ExamSchedule) => void;
}

const PackageContentManager: React.FC<PackageContentManagerProps> = ({ pkg, allQuestions, onBack, onSave }) => {
  const questionsInBank = useMemo(() => {
    return allQuestions.filter(q => q.bank_id === pkg.bank_id);
  }, [allQuestions, pkg.bank_id]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(pkg.question_ids || questionsInBank.map(q => q.id))
  );
  
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const handleToggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };
  
  const handleSelectAll = () => {
    if (selectedIds.size === questionsInBank.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questionsInBank.map(q => q.id)));
    }
  };

  const handleSave = () => {
    onSave({ 
      ...pkg, 
      question_ids: Array.from(selectedIds),
      question_count: selectedIds.size
    });
    alert('Konten paket ujian berhasil diperbarui!');
  };
  
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-gray-800">
          <ArrowLeft size={14}/> Kembali ke Daftar Paket
        </button>
      </div>

      <div className="gov-card p-6 bg-white border-l-4 border-l-emerald-700 shadow-md">
         <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{pkg.name}</h2>
         <div className="flex items-center gap-4 mt-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pkg.subject} | KELAS {pkg.level}</p>
            <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">BANK SOAL: {questionsInBank.length} BUTIR</p>
         </div>
      </div>
      
      <div className="gov-card bg-white p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <input 
            type="checkbox"
            className="w-5 h-5"
            checked={selectedIds.size === questionsInBank.length}
            onChange={handleSelectAll}
          />
          <h3 className="text-sm font-bold text-gray-700">Pilih Butir Soal untuk Disertakan ({selectedIds.size} / {questionsInBank.length})</h3>
        </div>
        <button onClick={handleSave} className="px-6 py-2 bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-sm flex items-center gap-2 shadow-md">
          <Save size={16}/> Simpan Konten Paket
        </button>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th className="w-12"></th>
              <th className="w-16">No</th>
              <th>Ringkasan Pertanyaan</th>
              <th className="w-32 text-center">Tipe</th>
              <th className="w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {questionsInBank.map((q, idx) => (
              <tr key={q.id} className={`group ${selectedIds.has(q.id) ? 'bg-emerald-50/30' : 'bg-white'}`}>
                <td className="text-center">
                  <input 
                    type="checkbox"
                    className="w-5 h-5"
                    checked={selectedIds.has(q.id)}
                    onChange={() => handleToggle(q.id)}
                  />
                </td>
                <td className="text-center font-bold text-gray-400 text-sm">{idx + 1}</td>
                <td>
                   {/* FIX: Changed questionText to question_text to match type definitions */}
                   <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed font-medium editor-content">
                      {stripHtml(q.question_text)}
                    </p>
                </td>
                <td className="text-center font-bold text-xs uppercase text-gray-500">{q.type.replace('_',' ')}</td>
                <td className="text-center">
                   <button onClick={() => setPreviewQuestion(q)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm">
                     <Eye size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {previewQuestion && <QuestionPreviewModal question={previewQuestion} onClose={() => setPreviewQuestion(null)} />}
    </div>
  );
};

export default PackageContentManager;