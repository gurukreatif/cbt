
import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  BarChart3, 
  Download, 
  Printer, 
  Filter, 
  Search,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { ExamResult, Student, SchoolProfile } from '../types';
import * as XLSX from 'xlsx';

interface ResultListProps {
  results: ExamResult[];
  students: Student[];
  school: SchoolProfile | null;
  examName: string;
  onPrintLeger: (payload: any) => void;
}

const ResultList: React.FC<ResultListProps> = ({ results, students, school, examName, onPrintLeger }) => {
  const [search, setSearch] = useState('');

  const fmt = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

  const rankedResults = useMemo(() => {
    return [...results]
      // FIX: Changed finalGrade to final_grade to match type definition
      .sort((a, b) => b.final_grade - a.final_grade)
      .map((r, idx) => ({ ...r, rank: idx + 1 }));
  }, [results]);

  const stats = useMemo(() => {
    if (results.length === 0) return { avg: 0, high: 0, low: 0, passCount: 0 };
    // FIX: Changed finalGrade to final_grade to match type definition
    const grades = results.map(r => r.final_grade);
    const total = grades.reduce((a, b) => a + b, 0);
    const high = Math.max(...grades);
    const low = Math.min(...grades);
    return {
      avg: fmt(total / grades.length),
      high: fmt(high),
      low: fmt(low),
      // FIX: Changed isPassed to is_passed to match type definition
      passCount: results.filter(r => r.is_passed).length
    };
  }, [results]);

  const filteredResults = rankedResults.filter(r => 
    // FIX: Changed studentName to student_name to match type definition
    r.student_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportExcel = () => {
    const exportData = rankedResults.map(r => ({
      'Rank': r.rank,
      // FIX: Changed studentName to student_name to match type definition
      'Nama Peserta': r.student_name,
      'Benar': r.correct,
      'Salah': r.incorrect,
      // FIX: Changed finalGrade to final_grade to match type definition
      'Skor': fmt(r.final_grade),
      // FIX: Changed finalGrade to final_grade to match type definition
      'Predikat': r.final_grade >= 90 ? 'A' : r.final_grade >= 80 ? 'B' : r.final_grade >= 75 ? 'C' : 'D',
      // FIX: Changed isPassed to is_passed to match type definition
      'Status': r.is_passed ? 'LULUS KKM' : 'REMEDIAL'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Nilai");
    
    const max_width = exportData.reduce((w, r) => Math.max(w, r['Nama Peserta'].length), 10);
    ws['!cols'] = [{ wch: 5 }, { wch: max_width + 5 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }];

    XLSX.writeFile(wb, `leger_nilai_${examName.replace(/\s+/g, '_').toLowerCase()}.xlsx`);
  };

  const triggerPrint = () => {
    onPrintLeger({
      school,
      examName,
      data: rankedResults
    });
  };

  return (
    <div className="gov-card overflow-hidden shadow-lg bg-white animate-in fade-in duration-500">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="gov-input w-full pl-10 text-[10px] font-black uppercase" 
            placeholder="Cari Peserta..." 
          />
        </div>
        <div className="flex gap-2">
          <button onClick={triggerPrint} className="px-5 py-2 bg-gray-900 text-white rounded-sm font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
            <Printer size={14}/> Cetak Leger Nilai
          </button>
          <button onClick={handleExportExcel} className="px-5 py-2 bg-emerald-700 text-white rounded-sm font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-sm">
            <FileSpreadsheet size={14}/> Export Excel
          </button>
        </div>
      </div>

       <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border-b border-gray-200">
        {[
          { label: 'Rata-Rata Nilai', val: stats.avg, icon: <TrendingUp size={18}/>, color: 'text-blue-600' },
          { label: 'Nilai Tertinggi', val: stats.high, icon: <Trophy size={18}/>, color: 'text-orange-600' },
          { label: 'Nilai Terendah', val: stats.low, icon: <BarChart3 size={18}/>, color: 'text-red-600' },
          { label: 'Kelulusan KKM', val: `${Math.round((stats.passCount / results.length) * 100 || 0)}%`, icon: <CheckCircle2 size={18}/>, color: 'text-emerald-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <h4 className={`text-2xl font-black ${s.color}`}>{s.val}</h4>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="gov-table">
          <thead>
            <tr>
              <th className="w-16 text-center">Rank</th>
              <th>Identitas Peserta</th>
              <th className="text-center">Benar</th>
              <th className="text-center">Salah</th>
              <th className="text-center">Skor Akhir</th>
              <th className="text-center">Predikat</th>
              <th className="text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((r) => (
              <tr key={r.id} className="group hover:bg-gray-50 transition-colors">
                <td className="text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${
                    r.rank === 1 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    r.rank === 2 ? 'bg-blue-100 text-blue-700' :
                    r.rank === 3 ? 'bg-gray-100 text-gray-700' : 'text-gray-400'
                  }`}>
                    {r.rank}
                  </span>
                </td>
                <td>
                  <div className="flex flex-col">
                    {/* FIX: Changed studentName to student_name to match type definition */}
                    <span className="font-black text-gray-800 text-xs uppercase">{r.student_name}</span>
                    {/* FIX: Changed studentId to student_id to match type definition */}
                    <span className="text-[9px] text-gray-400 font-mono">NIS: {r.student_id.split('_')[1]}</span>
                  </div>
                </td>
                <td className="text-center">
                  <span className="text-xs font-bold text-emerald-600">{r.correct}</span>
                </td>
                <td className="text-center">
                  <span className="text-xs font-bold text-red-400">{r.incorrect}</span>
                </td>
                <td className="text-center">
                  {/* FIX: Changed finalGrade to final_grade to match type definition */}
                  <span className="text-lg font-black text-gray-900">{fmt(r.final_grade)}</span>
                </td>
                <td className="text-center">
                  <span className="text-[11px] font-black text-gray-600 uppercase">
                    {/* FIX: Changed finalGrade to final_grade to match type definition */}
                    {r.final_grade >= 90 ? 'A' : r.final_grade >= 80 ? 'B' : r.final_grade >= 75 ? 'C' : 'D'}
                  </span>
                </td>
                <td className="text-right">
                  {/* FIX: Changed isPassed to is_passed to match type definition */}
                  <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest border ${
                    r.is_passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {/* FIX: Changed isPassed to is_passed to match type definition */}
                    {r.is_passed ? 'LULUS KKM' : 'REMEDIAL'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultList;
