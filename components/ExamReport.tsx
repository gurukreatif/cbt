import React, { useMemo } from 'react';
import { 
  BarChart3, 
  FileText, 
  Download, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { ExamResult, Question, ItemAnalysisResult, ExamSchedule, SchoolProfile } from '../types';

interface ExamReportProps {
  schedule: ExamSchedule;
  results: ExamResult[];
  questions: Question[];
  school: SchoolProfile | null;
  onPrintAnalysis: (payload: any) => void;
}

const ExamReport: React.FC<ExamReportProps> = ({ schedule, results, questions, school, onPrintAnalysis }) => {
  
  const fmt = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

  const itemAnalysis = useMemo(() => {
    return questions.map((q, idx) => {
      const answersForThisQuestion = results.map(r => r.answers.find(a => a.questionId === q.id));
      const correctCount = answersForThisQuestion.filter(a => {
        if (q.type === 'pilihan_ganda') {
          const correctOpt = q.options?.find(o => o.isCorrect);
          return a?.answer === correctOpt?.label;
        }
        return false;
      }).length;

      const pValue = results.length > 0 ? correctCount / results.length : 0;
      
      let classification: any = 'Sedang';
      if (pValue > 0.7) classification = 'Mudah';
      if (pValue < 0.3) classification = 'Sukar';

      const correctOpt = q.options?.find(o => o.isCorrect);

      return {
        questionId: idx + 1,
        key: correctOpt?.label || '-',
        correct: correctCount,
        incorrect: results.length - correctCount,
        difficulty: pValue,
        percentage: pValue * 100,
        classification,
        recommendation: pValue > 0.1 && pValue < 0.9 ? 'Pertahankan' : 'Revisi'
      };
    });
  }, [results, questions]);

  const triggerPrint = () => {
    onPrintAnalysis({
      school,
      schedule,
      data: itemAnalysis
    });
  };

  return (
    <div className="gov-card p-6 bg-white shadow-lg animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-700 text-white rounded-sm shadow-sm"><Target size={18} /></div>
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Analisis Psikometrik Butir Soal</h3>
        </div>
        <button onClick={triggerPrint} className="px-6 py-2 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-sm flex items-center gap-2 hover:bg-black shadow-lg transition-all">
          <Printer size={16} /> Cetak Analisis
        </button>
      </div>

      <div className="gov-table-container">
        <table className="gov-table">
          <thead>
            <tr>
              <th className="w-16 text-center">No</th>
              <th className="text-center">Indeks Kesukaran (P)</th>
              <th className="text-center">Klasifikasi</th>
              <th className="text-center">Daya Pembeda (D)</th>
              <th className="text-right">Rekomendasi</th>
            </tr>
          </thead>
          <tbody>
            {itemAnalysis.map((item) => (
              <tr key={item.questionId}>
                <td className="text-center font-black text-gray-500">Soal {item.questionId}</td>
                <td className="text-center font-mono font-bold text-gray-700">{fmt(item.difficulty)}</td>
                <td className="text-center">
                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-tighter ${
                    item.classification === 'Sukar' ? 'bg-red-50 text-red-700' :
                    item.classification === 'Mudah' ? 'bg-blue-50 text-blue-700' :
                    'bg-emerald-50 text-emerald-700'
                  }`}>
                    {item.classification}
                  </span>
                </td>
                <td className="text-center">
                  <span className="text-[10px] font-black text-gray-400">TBD (Data Lapangan)</span>
                </td>
                <td className="text-right">
                  <span className={`px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border ${
                    item.recommendation === 'Pertahankan' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    {item.recommendation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 text-[10px] italic font-sans text-gray-600">
          *Keterangan:<br />
          - P &gt; 0.70 : Mudah<br />
          - 0.30 ≤ P ≤ 0.70 : Sedang<br />
          - P &lt; 0.30 : Sukar
        </div>
    </div>
  );
};

export default ExamReport;
