
import React from 'react';
import { 
  CheckCircle2, 
  Award,
  LogOut as LogOutIcon,
  Printer,
  ShieldCheck,
  User,
  FileText,
  Eye,
  Edit
} from 'lucide-react';
import { ExamResult } from '../types';
import { LOGO_URL } from '../constants';

interface ExamResultViewProps {
  result: ExamResult;
  onNavigate: (action: 'exit' | 'details') => void;
}

const ExamResultView: React.FC<ExamResultViewProps> = ({ result, onNavigate }) => {
  
  const handlePrintEvidence = () => {
    window.print();
  };

  const isPendingCorrection = result.status === 'Menunggu Koreksi';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
       <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body, html { background-color: white !important; }
          }
          @media screen { .print-only { display: none; } }
        `}
       </style>
       
       {/* UI VIEW (NO PRINT) */}
       <div className="no-print flex-1 flex flex-col">
          <header className="h-14 bg-white flex items-center justify-between px-4 shrink-0 border-b border-gray-200">
              <div className="flex items-center gap-3">
                 <img src={LOGO_URL} alt="Logo" className="w-8 h-8"/>
                 <span className="text-sm font-black text-emerald-800 uppercase tracking-wider">EMES CBT</span>
              </div>
              <div className="flex items-center gap-4">
                  <div className="text-right flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <p className="text-xs font-bold text-gray-800 uppercase">{result.student_name}</p>
                  </div>
              </div>
          </header>
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-sm border border-gray-200 shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle2 size={48} className="mx-auto text-emerald-600 mb-4" />
                <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Ujian Telah Selesai</h1>
                <p className="text-sm text-gray-500 mt-2">Terima kasih telah berpartisipasi dalam asesmen ini. Jawaban Anda telah berhasil direkam oleh sistem.</p>
                
                <div className="mt-8 border-t border-gray-100 pt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-sm border border-slate-200">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Skor Akhir</p>
                     {isPendingCorrection ? (
                        <p className="text-xl font-black text-blue-600 mt-2">N/A</p>
                     ) : (
                        <p className="text-4xl font-black text-emerald-700">{result.final_grade.toFixed(0)}</p>
                     )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-sm border border-slate-200">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</p>
                     {isPendingCorrection ? (
                        <div className="flex items-center justify-center gap-2 mt-2">
                           <Edit size={14} className="text-blue-600"/>
                           <p className="text-xs font-black uppercase text-blue-600">Menunggu Koreksi</p>
                        </div>
                     ) : (
                        <p className={`text-xl font-black uppercase ${result.is_passed ? 'text-emerald-700' : 'text-orange-600'}`}>
                           {result.is_passed ? 'Lulus' : 'Remedial'}
                        </p>
                     )}
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                   <button onClick={() => onNavigate('details')} className="w-full py-3 bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-800">
                      <Eye size={16} /> Lihat Rincian Jawaban
                   </button>
                   <div className="flex gap-3">
                      <button onClick={handlePrintEvidence} className="flex-1 py-3 bg-white border-2 border-gray-300 text-gray-700 font-black text-xs uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:bg-gray-50">
                         <Printer size={16} /> Cetak Bukti
                      </button>
                      <button onClick={() => onNavigate('exit')} className="flex-1 py-3 bg-gray-800 text-white font-black text-xs uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:bg-black">
                         <LogOutIcon size={16} /> Keluar
                      </button>
                   </div>
                </div>
            </div>
          </main>
       </div>

       {/* PRINT ONLY TEMPLATE (OFFICIAL LOOK) */}
       <div className="print-only fixed inset-0 bg-white p-12 font-serif">
          <div className="border-t-4 border-b-4 border-black py-4">
            <div className="border-t border-b border-black py-8 px-4 max-w-3xl mx-auto space-y-10">
              <div className="text-center border-b border-black pb-6">
                  <h1 className="text-2xl font-black uppercase tracking-wider">BUKTI SELESAI UJIAN</h1>
                  <p className="text-sm font-bold uppercase mt-1">Sistem Evaluasi Terpadu Emes CBT</p>
              </div>

              <div className="flex justify-between items-start">
                  <table className="text-xs uppercase">
                      <tbody>
                          <tr className="font-bold"><td className="pr-4 py-1">Nama Peserta</td><td>: {result.student_name}</td></tr>
                          <tr className="font-bold"><td className="pr-4 py-1">ID Peserta (NIS)</td><td>: {result.nis}</td></tr>
                          <tr className="font-bold"><td className="pr-4 py-1">ID Sesi Ujian</td><td>: {result.session_name}</td></tr>
                      </tbody>
                  </table>
                  <div className="p-4 border-2 border-black text-center w-32 shrink-0">
                      <span className="text-xs font-bold block uppercase">Skor Akhir</span>
                      {isPendingCorrection ? (
                        <span className="text-xl font-black">N/A</span>
                      ) : (
                        <span className="text-5xl font-black">{result.final_grade.toFixed(0)}</span>
                      )}
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-300">
                  <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-gray-600">Statistik Jawaban</p>
                      <ul className="text-sm space-y-1 font-bold">
                          <li>• Total Soal: {result.total_questions}</li>
                          <li>• Jawaban Benar: {isPendingCorrection ? 'N/A' : result.correct}</li>
                          <li>• Jawaban Salah: {isPendingCorrection ? 'N/A' : result.incorrect}</li>
                      </ul>
                  </div>
                  <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-gray-600">Waktu Pelaksanaan</p>
                      <p className="text-sm font-bold">{new Date(result.end_time).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB</p>
                      <p className="text-xs text-gray-500 mt-1">ID Transaksi: {result.id}</p>
                  </div>
              </div>

              <div className="pt-20 flex justify-between items-end">
                <div className="text-center w-48">
                   <p className="text-xs font-bold uppercase mb-20">Tanda Tangan Siswa,</p>
                   <p className="text-xs font-black underline uppercase">{result.student_name}</p>
                </div>
                <div className="text-center w-64 border border-black p-3 flex items-center gap-3">
                   <FileText size={24} className="shrink-0"/>
                   <div>
                     <p className="text-xs font-black uppercase">HASIL TERVERIFIKASI SISTEM</p>
                     <p className="text-[8px] italic text-gray-600">Dicetak otomatis oleh Emes CBT Server</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
       </div>
    </div>
  );
};

export default ExamResultView;