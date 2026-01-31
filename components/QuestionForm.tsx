
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  HelpCircle,
  Hash,
  ListFilter,
  Layers,
  Zap,
  Check,
  Type,
  Info,
  ChevronRight,
  X,
  PlusCircle
} from 'lucide-react';
import { Question, QuestionType, QuestionBank } from '../types';
import RichTextEditor from './RichTextEditor';

interface QuestionFormProps {
  initialData?: Question;
  bankContext: QuestionBank;
  onSave: (data: Question, reset: boolean) => void;
  onCancel: () => void;
}

const QUESTION_TYPES = [
  { id: 'pilihan_ganda', label: 'Pilihan Ganda' },
  { id: 'pilihan_ganda_kompleks', label: 'PG Kompleks' },
  { id: 'benar_salah', label: 'Benar / Salah' },
  { id: 'menjodohkan', label: 'Menjodohkan' },
  { id: 'esai', label: 'Esai / Uraian' }
];

const QuestionForm: React.FC<QuestionFormProps> = ({ initialData, bankContext, onSave, onCancel }) => {
  if (!bankContext?.id) return null;

  const [activeType, setActiveType] = useState<QuestionType>(initialData?.type || 'pilihan_ganda');
  const [questionHtml, setQuestionHtml] = useState(initialData?.question_text || '');
  const [discussionHtml, setDiscussionHtml] = useState(initialData?.discussion || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [difficulty, setDifficulty] = useState<'Mudah' | 'Sedang' | 'Sulit'>(initialData?.difficulty || 'Sedang');
  const [weight, setWeight] = useState(initialData?.weight || 1);

  const [pgOptions, setPgOptions] = useState(initialData?.options || [
    { label: 'A', text: '', isCorrect: true },
    { label: 'B', text: '', isCorrect: false },
    { label: 'C', text: '', isCorrect: false },
    { label: 'D', text: '', isCorrect: false },
    { label: 'E', text: '', isCorrect: false }
  ]);

  const [tfStatements, setTfStatements] = useState(initialData?.statements || [
    { id: 'tf1', text: '', isTrue: true },
    { id: 'tf2', text: '', isTrue: false }
  ]);

  const [matchPairs, setMatchPairs] = useState(initialData?.matching_pairs || [
    { id: 'm1', leftText: '', rightText: '' },
    { id: 'm2', leftText: '', rightText: '' }
  ]);

  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!questionHtml.replace(/<[^>]*>/g, '').trim()) return "Teks pertanyaan wajib diisi.";
    if (activeType === 'pilihan_ganda' || activeType === 'pilihan_ganda_kompleks') {
      if (pgOptions.some(o => !o.text.replace(/<[^>]*>/g, '').trim())) return "Semua teks opsi wajib diisi.";
      if (activeType === 'pilihan_ganda_kompleks' && pgOptions.filter(o => o.isCorrect).length < 2) return "PG Kompleks: Minimal 2 kunci jawaban.";
    }
    if (activeType === 'benar_salah') {
      if (tfStatements.some(s => !s.text.replace(/<[^>]*>/g, '').trim())) return "Semua teks pernyataan wajib diisi.";
    }
    if (activeType === 'menjodohkan') {
      if (matchPairs.some(p => !p.leftText.trim() || !p.rightText.trim())) return "Semua pasangan kiri-kanan wajib diisi.";
    }
    return null;
  };

  const handleFinalSave = (reset: boolean) => {
    const err = validate();
    if (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload: Question = {
      id: initialData?.id || `soal_${Date.now()}`,
      school_id: bankContext.school_id,
      bank_id: bankContext.id,
      type: activeType,
      subject: bankContext.subject,
      levels: [bankContext.level],
      category,
      difficulty,
      question_text: questionHtml,
      options: ['pilihan_ganda', 'pilihan_ganda_kompleks'].includes(activeType) ? pgOptions : undefined,
      statements: activeType === 'benar_salah' ? tfStatements : undefined,
      matching_pairs: activeType === 'menjodohkan' ? matchPairs : undefined,
      correct_answers: undefined,
      weight,
      discussion: discussionHtml,
      updated_at: new Date().toISOString()
    };

    onSave(payload, reset);
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f4f4] border border-gray-300 rounded-sm overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white border-b border-gray-300 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 border border-gray-200 rounded-sm transition-colors text-gray-600"><ArrowLeft size={18}/></button>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Editor Butir Soal</h2>
          <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-sm text-[10px] font-bold text-emerald-800 uppercase">
            <span>{bankContext.subject}</span>
            <ChevronRight size={10} />
            <span>Kelas {bankContext.level}</span>
          </div>
        </div>
        <select 
          value={activeType}
          onChange={(e) => setActiveType(e.target.value as QuestionType)}
          className="text-xs font-bold py-1.5 px-3 border border-gray-300 rounded-sm bg-gray-50 outline-none"
        >
          {QUESTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 rounded-sm border-l-4"><AlertCircle size={16} /> {error}</div>}

            <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2"><HelpCircle size={14} className="text-gray-400" /><span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Narasi Pertanyaan</span></div>
              <div className="p-4"><RichTextEditor value={questionHtml} onChange={setQuestionHtml} placeholder="Input instruksi atau pertanyaan..." minHeight="220px" variant="question" /></div>
            </div>

            {activeType !== 'esai' && (
              <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Konfigurasi Jawaban</span>
                  </div>
                  {activeType === 'benar_salah' && (
                    <button onClick={() => setTfStatements([...tfStatements, { id: `tf${Date.now()}`, text: '', isTrue: true }])} className="text-[9px] font-black text-emerald-700 uppercase flex items-center gap-1 hover:underline pr-2">
                      <PlusCircle size={12} /> Tambah Baris
                    </button>
                  )}
                  {activeType === 'menjodohkan' && (
                    <button onClick={() => setMatchPairs([...matchPairs, { id: `m${Date.now()}`, leftText: '', rightText: '' }])} className="text-[9px] font-black text-emerald-700 uppercase flex items-center gap-1 hover:underline pr-2">
                      <PlusCircle size={12} /> Tambah Baris
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-4">
                  {(activeType === 'pilihan_ganda' || activeType === 'pilihan_ganda_kompleks') && (
                    <div className="space-y-3">
                      {pgOptions.map((opt, idx) => (
                        <div key={opt.label} className={`flex items-start gap-3 p-3 border rounded-sm transition-colors ${opt.isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-gray-200'}`}>
                          <button onClick={() => {
                            const next = [...pgOptions];
                            if (activeType === 'pilihan_ganda') next.forEach((o, i) => o.isCorrect = i === idx);
                            else next[idx].isCorrect = !next[idx].isCorrect;
                            setPgOptions(next);
                          }} className={`shrink-0 w-8 h-8 border-2 rounded-sm flex items-center justify-center font-bold text-sm ${opt.isCorrect ? 'bg-emerald-700 border-emerald-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-400'}`}>{opt.label}</button>
                          <div className="flex-1"><RichTextEditor value={opt.text} onChange={(val) => { const next = [...pgOptions]; next[idx].text = val; setPgOptions(next); }} placeholder={`Opsi ${opt.label}...`} minHeight="40px" variant="option" /></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeType === 'benar_salah' && (
                    <div className="space-y-3">
                      {tfStatements.map((stmt, idx) => (
                        <div key={stmt.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-sm bg-white hover:bg-gray-50 group">
                          <div className="shrink-0 flex flex-col gap-1">
                            <button onClick={() => { const next = [...tfStatements]; next[idx].isTrue = true; setTfStatements(next); }} className={`px-2 py-1 text-[9px] font-black rounded-sm border ${stmt.isTrue ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>BENAR</button>
                            <button onClick={() => { const next = [...tfStatements]; next[idx].isTrue = false; setTfStatements(next); }} className={`px-2 py-1 text-[9px] font-black rounded-sm border ${!stmt.isTrue ? 'bg-red-600 border-red-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>SALAH</button>
                          </div>
                          <div className="flex-1"><RichTextEditor value={stmt.text} onChange={(val) => { const next = [...tfStatements]; next[idx].text = val; setTfStatements(next); }} placeholder="Tuliskan butir pernyataan..." minHeight="60px" variant="option" /></div>
                          <button onClick={() => setTfStatements(tfStatements.filter((_, i) => i !== idx))} className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeType === 'menjodohkan' && (
                    <div className="space-y-3">
                      {matchPairs.map((pair, idx) => (
                        <div key={pair.id} className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 border border-gray-200 rounded-sm bg-white group relative">
                          <div>
                            <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Item Kiri</label>
                            <input value={pair.leftText} onChange={(e) => { const next = [...matchPairs]; next[idx].leftText = e.target.value; setMatchPairs(next); }} className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-bold" placeholder="Teks soal kiri..." />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Item Kanan (Pasangan)</label>
                            <div className="flex gap-2">
                              <input value={pair.rightText} onChange={(e) => { const next = [...matchPairs]; next[idx].rightText = e.target.value; setMatchPairs(next); }} className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-xs font-bold" placeholder="Teks kunci kanan..." />
                              <button onClick={() => setMatchPairs(matchPairs.filter((_, i) => i !== idx))} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-300 rounded-sm shadow-sm">
              <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2"><Layers size={14} className="text-gray-400" /><span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Atribut Konten</span></div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Topik / KD</label>
                  <input value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-bold" placeholder="MISAL: ALJABAR" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Tingkat Kesulitan</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['Mudah', 'Sedang', 'Sulit'].map(lv => (
                      <button key={lv} type="button" onClick={() => setDifficulty(lv as any)} className={`py-1.5 text-[9px] font-bold rounded-sm border ${difficulty === lv ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>{lv}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Bobot Soal</label>
                  <input type="number" value={weight} onChange={e => setWeight(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border border-gray-300 rounded-sm text-xs font-bold" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-sm shadow-sm">
              <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2"><Check size={14} className="text-gray-400" /><span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Pembahasan / Rubrik</span></div>
              <div className="p-3"><RichTextEditor value={discussionHtml} onChange={setDiscussionHtml} placeholder="Tuliskan petunjuk pembahasan..." minHeight="100px" variant="question" /></div>
            </div>

            <div className="bg-[#2d3748] p-4 rounded-sm border border-[#1a202c] shadow-lg space-y-2">
              <button type="button" onClick={() => handleFinalSave(false)} className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-sm font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"><Save size={16} /> Simpan Soal</button>
              <button type="button" onClick={() => handleFinalSave(true)} className="w-full py-2 bg-[#4a5568] hover:bg-[#3d4552] text-gray-100 rounded-sm font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">Simpan & Baru</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;