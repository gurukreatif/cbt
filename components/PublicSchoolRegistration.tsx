import React, { useState } from 'react';
import { X, Save, AlertCircle, Loader2, Building2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import { SchoolProfile, Teacher } from '../types.ts';

interface PublicSchoolRegistrationProps {
  onClose: () => void;
}

const PublicSchoolRegistration: React.FC<PublicSchoolRegistrationProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    school_id: '',
    nama_sekolah: '',
    kota_kabupaten: '',
    jenjang: 'SMP/MTs',
    referral_id: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // 1. Validasi ID Referral
      const { data: reseller, error: resellerError } = await supabase
        .from('resellers')
        .select('id')
        .eq('referral_id', formData.referral_id.trim().toUpperCase())
        .single();

      if (resellerError || !reseller) {
        throw new Error('ID Referral tidak valid atau tidak ditemukan. Silakan hubungi agen Anda.');
      }
      
      // 2. Cek duplikasi NPSN
      const { data: existingSchool, error: schoolCheckError } = await supabase
        .from('school_profiles')
        .select('id')
        .eq('school_id', formData.school_id)
        .single();
        
      if(schoolCheckError && schoolCheckError.code !== 'PGRST0016') throw schoolCheckError; // Ignore "no rows" error
      if(existingSchool) throw new Error('NPSN sudah terdaftar di sistem.');


      // 3. Buat data sekolah baru
      const newSchoolPayload: Omit<SchoolProfile, 'id'> = {
        school_id: formData.school_id,
        nama_sekolah: formData.nama_sekolah,
        kota_kabupaten: formData.kota_kabupaten,
        jenjang: formData.jenjang,
        referral_id: formData.referral_id.trim().toUpperCase(),
        status: 'pending',
        plan: 'basic',
        quota_total: 100, // Kuota awal gratis
        quota_used: 0,
        alamat: '',
        provinsi: '',
        kode_pos: '',
        telepon: '',
        email: '',
        website: '',
        kop_surat: '',
        kepala_sekolah: '-',
        nip_kepala_sekolah: '-'
      };

      const { data: newSchool, error: schoolInsertError } = await supabase
        .from('school_profiles')
        .insert(newSchoolPayload)
        .select()
        .single();

      if (schoolInsertError) throw schoolInsertError;
      if (!newSchool) throw new Error("Gagal membuat data sekolah baru.");
      
      setSuccess(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-sm shadow-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95">
           <CheckCircle size={48} className="mx-auto text-emerald-600 mb-4" />
           <h2 className="text-xl font-black text-slate-800">Pendaftaran Terkirim!</h2>
           <p className="text-sm text-slate-600 mt-2">
             Sekolah Anda telah berhasil didaftarkan dan sedang menunggu persetujuan. Admin kami akan segera menghubungi Anda untuk proses aktivasi.
           </p>
           <button onClick={onClose} className="mt-6 w-full py-3 bg-emerald-700 text-white font-bold text-xs uppercase rounded-sm">
             Tutup
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg border border-slate-200 animate-in zoom-in-95">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-3"><Building2 size={20}/> Pendaftaran Sekolah Baru</h3>
            <button type="button" onClick={onClose}><X/></button>
          </div>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-sm text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16}/> {error}
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">ID Referral (Wajib)</label>
              <input 
                required 
                value={formData.referral_id} 
                onChange={e => setFormData({...formData, referral_id: e.target.value})} 
                className="w-full mt-1 p-2 bg-slate-50 text-slate-800 border border-slate-300 rounded-sm font-mono uppercase" 
                placeholder="Hubungi agen untuk mendapatkan ID"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">NPSN</label>
                <input required value={formData.school_id} onChange={e => setFormData({...formData, school_id: e.target.value.replace(/\D/g, '')})} maxLength={8} className="w-full mt-1 p-2 bg-slate-50 text-slate-800 border border-slate-300 rounded-sm" />
              </div>
               <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Jenjang</label>
                <select value={formData.jenjang} onChange={e => setFormData({...formData, jenjang: e.target.value})} className="w-full mt-1 p-2 bg-slate-50 text-slate-800 border border-slate-300 rounded-sm">
                    <option>SMP/MTs</option>
                    <option>SMA/MA</option>
                    <option>SMK</option>
                    <option>SD/MI</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nama Sekolah</label>
              <input required value={formData.nama_sekolah} onChange={e => setFormData({...formData, nama_sekolah: e.target.value})} className="w-full mt-1 p-2 bg-slate-50 text-slate-800 border border-slate-300 rounded-sm" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Kabupaten/Kota</label>
                <input required value={formData.kota_kabupaten} onChange={e => setFormData({...formData, kota_kabupaten: e.target.value})} className="w-full mt-1 p-2 bg-slate-50 text-slate-800 border border-slate-300 rounded-sm" />
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-bold text-xs uppercase">Batal</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-emerald-700 text-white font-bold text-xs uppercase rounded-sm flex items-center gap-2">
              {isSaving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Daftarkan Sekolah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicSchoolRegistration;
