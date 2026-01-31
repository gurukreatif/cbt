import React, { useState, useMemo } from 'react';
import { X, Calculator, Users, BookOpen, UploadCloud, Send, Banknote } from 'lucide-react';

interface UpgradeCalculatorModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

const COST_PER_UNIT = 1500;

const UpgradeCalculatorModal: React.FC<UpgradeCalculatorModalProps> = ({ onClose, onSubmit }) => {
  const [studentCount, setStudentCount] = useState<number | ''>('');
  const [subjectCount, setSubjectCount] = useState<number | ''>('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  const totalCost = useMemo(() => {
    const students = typeof studentCount === 'number' ? studentCount : 0;
    const subjects = typeof subjectCount === 'number' ? subjectCount : 0;
    return students * subjects * COST_PER_UNIT;
  }, [studentCount, subjectCount]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCost > 0 && paymentProof) {
      // Di aplikasi nyata, ini akan mengirim data ke backend.
      // Untuk sekarang, kita hanya panggil onSubmit.
      onSubmit();
    } else {
      alert("Harap lengkapi semua data dan unggah bukti pembayaran.");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm shadow-2xl w-full max-w-4xl border border-gray-400 animate-in zoom-in duration-200">
        <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase text-gray-800 tracking-tight flex items-center gap-2">
              <Calculator size={16} className="text-emerald-700"/> Kalkulator & Permintaan Upgrade Kuota
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Hitung biaya dan kirim permintaan penambahan kuota ujian.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kolom Kiri: Kalkulator & Pembayaran */}
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 flex items-center gap-2"><Users size={12}/> Jumlah Siswa</label>
              <input 
                type="number"
                value={studentCount}
                onChange={e => setStudentCount(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="gov-input w-full font-bold text-lg"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-500 mb-2 flex items-center gap-2"><BookOpen size={12}/> Jumlah Mata Pelajaran Ujian</label>
              <input 
                type="number"
                value={subjectCount}
                onChange={e => setSubjectCount(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="gov-input w-full font-bold text-lg"
                placeholder="0"
                required
              />
            </div>

            <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-lg text-center">
              <p className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">Estimasi Total Biaya</p>
              <p className="text-4xl font-black text-emerald-700 my-2">
                Rp {totalCost.toLocaleString('id-ID')}
              </p>
              <p className="text-[9px] font-bold text-gray-500 uppercase">
                ({studentCount || 0} Siswa x {subjectCount || 0} Mapel x Rp {COST_PER_UNIT.toLocaleString('id-ID')})
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Instruksi & Upload */}
          <div className="space-y-6">
             <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
               <h4 className="text-xs font-black uppercase text-gray-700 flex items-center gap-2"><Banknote size={14}/> Instruksi Pembayaran</h4>
               <p className="text-xs text-gray-600">
                 Silakan lakukan transfer sejumlah total biaya ke rekening berikut:
               </p>
               <div className="p-4 bg-white border border-gray-300 rounded-md">
                  <p className="text-sm font-bold">Bank Mandiri</p>
                  <p className="text-lg font-mono font-black text-emerald-800 tracking-wider">123 456 7890</p>
                  <p className="text-xs font-bold uppercase">a.n. Emes CBT Indonesia</p>
               </div>
             </div>

             <div>
                <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Upload Bukti Pembayaran</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white hover:border-emerald-400 transition-colors h-32 flex items-center justify-center text-center">
                   <input 
                     type="file" 
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     onChange={handleFileChange}
                     accept="image/png, image/jpeg, application/pdf"
                     required
                   />
                   {paymentProof ? (
                     <p className="text-sm font-bold text-emerald-700">{paymentProof.name}</p>
                   ) : (
                     <div className="text-gray-400">
                       <UploadCloud size={32} className="mx-auto mb-2"/>
                       <p className="text-xs font-bold uppercase">Klik atau jatuhkan file di sini</p>
                       <p className="text-[10px]">(PNG, JPG, PDF)</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end">
           <button 
              type="submit"
              disabled={!paymentProof || totalCost <= 0}
              className="px-10 py-3 bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-sm shadow-lg flex items-center gap-2 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} /> Kirim Permintaan Upgrade
           </button>
        </div>
      </form>
    </div>
  );
};

export default UpgradeCalculatorModal;