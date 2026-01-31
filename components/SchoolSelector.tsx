
import React, { useState } from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { LOGO_URL } from '../constants';
import { supabase } from '../lib/supabase';

interface SchoolSelectorProps {
  onSchoolSelect: (npsn: string) => void;
}

const SchoolSelector: React.FC<SchoolSelectorProps> = ({ onSchoolSelect }) => {
  const [npsn, setNpsn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{8}$/.test(npsn)) {
      setError('NPSN harus terdiri dari 8 digit angka.');
      return;
    }
    setLoading(true);

    try {
      // Verifikasi NPSN ke database sebelum melanjutkan
      const { data, error: queryError } = await supabase
        .from('school_profiles')
        .select('school_id')
        .eq('school_id', npsn)
        .maybeSingle();

      if (queryError) throw queryError;
      
      if (data) {
        onSchoolSelect(npsn);
      } else {
        setError(`Sekolah dengan NPSN ${npsn} tidak ditemukan dalam sistem.`);
      }
    } catch (err: any) {
      setError('Terjadi kesalahan saat memverifikasi sekolah. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f0f4f7] flex flex-col font-sans overflow-hidden">
        <header className="h-24 bg-[#064e3b] text-white flex items-center px-10 shrink-0 relative shadow-md z-10">
            <div className="flex items-center gap-4 z-10">
               <img src={LOGO_URL} alt="Logo" className="w-10 h-10 logo-inverse"/>
               <div>
                 <span className="text-lg font-bold uppercase tracking-wider">EMES CBT</span>
                 <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider">Aplikasi Ujian Berbasis Komputer</p>
               </div>
            </div>
        </header>

        <main className="flex-1 flex justify-center items-center p-4 relative">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-10 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Selamat Datang</h1>
                    <p className="text-sm text-gray-500 mt-1">Silakan masukkan Nomor Pokok Sekolah Nasional (NPSN) untuk melanjutkan ke halaman login.</p>
                    
                    <form onSubmit={handleContinue} className="mt-8 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 rounded-sm">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="npsn" className="sr-only">NPSN</label>
                            <input
                                id="npsn"
                                type="text"
                                value={npsn}
                                onChange={e => setNpsn(e.target.value.replace(/\D/g, ''))}
                                maxLength={8}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-mono font-bold tracking-[0.2em] text-center focus:border-emerald-600 outline-none bg-white"
                                placeholder="********"
                                autoFocus
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading || npsn.length !== 8}
                            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Lanjutkan <ArrowRight size={16} /></>}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    </div>
  );
};

export default SchoolSelector;
