
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase.ts';
import { 
  Building2, Users, LogOut, Plus, Edit2, Trash2, Search, Save, 
  AlertTriangle, Loader2, LayoutDashboard, CreditCard, Share2, 
  ShieldCheck, Printer, CheckCircle2, UserPlus, Mail, Phone, Monitor,
  FileText, ChevronRight, Hash, Settings
} from 'lucide-react';
import { SchoolProfile, Teacher, ExamSession, Transaction, Reseller } from '../types.ts';
import { LOGO_URL, SUPERADMIN_MENU_ITEMS } from '../constants';
import { PrintInvoice } from './PrintLayouts.tsx';

const ResellerFormModal: React.FC<{
  reseller: Partial<Reseller> | null;
  onSave: (data: Partial<Reseller>) => Promise<void>;
  onClose: () => void;
}> = ({ reseller, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Reseller>>({
    referral_id: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    commission_rate: 0.1,
    ...reseller,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[1px]">
      <div className="bg-white rounded-sm shadow-none w-full max-w-md border border-zinc-300 animate-in fade-in duration-200">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-zinc-800 uppercase tracking-widest">{reseller?.id ? 'Ubah' : 'Entri'} Data Agen</h3>
            <button type="button" onClick={onClose} className="text-zinc-400 hover:text-red-600"><Plus className="rotate-45" size={20}/></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-0.5">Kode Referral Unik</label>
              <input required value={formData.referral_id} onChange={e => setFormData({...formData, referral_id: e.target.value.toUpperCase()})} className="w-full mt-1 p-2.5 bg-white text-sm font-black border border-zinc-300 rounded-sm focus:border-emerald-600 outline-none uppercase font-mono" placeholder="MISAL: AGEN001" disabled={!!reseller?.id} />
            </div>
            <div>
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-0.5">Nama Lengkap Partner</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-2.5 bg-white text-sm font-bold border border-zinc-300 rounded-sm focus:border-emerald-600 outline-none" />
            </div>
            <div>
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-0.5">Kredensial Password</label>
              <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full mt-1 p-2.5 bg-white text-sm font-mono border border-zinc-300 rounded-sm focus:border-emerald-600 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-0.5">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full mt-1 p-2.5 bg-white text-sm font-bold border border-zinc-300 rounded-sm focus:border-emerald-600 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-0.5">Rate Komisi (0.01 - 1)</label>
                <input type="number" step="0.01" required value={formData.commission_rate} onChange={e => setFormData({...formData, commission_rate: parseFloat(e.target.value)})} className="w-full mt-1 p-2.5 bg-white text-sm font-black border border-zinc-300 rounded-sm focus:border-emerald-600 outline-none" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-300 text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-white">Batal</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-emerald-800 text-white font-black text-[10px] uppercase tracking-widest rounded-sm border border-emerald-900 shadow-sm active:scale-95 transition-all">
              {isSaving ? <Loader2 className="animate-spin mx-auto" size={14}/> : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SchoolFormModal: React.FC<{
  school: Partial<SchoolProfile> | null;
  resellers: Reseller[];
  onSave: (data: Partial<SchoolProfile>) => Promise<void>;
  onClose: () => void;
}> = ({ school, resellers, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<SchoolProfile>>({
    school_id: '',
    nama_sekolah: '',
    kota_kabupaten: '',
    jenjang: 'SMP/MTs',
    plan: 'basic',
    quota_total: 100,
    referral_id: '',
    ...school,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[1px]">
      <div className="bg-white rounded-sm shadow-none w-full max-w-lg border border-zinc-300 animate-in fade-in duration-200">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
            <h3 className="text-xs font-black text-zinc-800 uppercase tracking-widest">{school?.id ? 'Perbarui' : 'Daftarkan'} Institusi</h3>
            <button type="button" onClick={onClose} className="text-zinc-400 hover:text-red-600"><Plus className="rotate-45" size={20}/></button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-0.5">Nomor NPSN</label>
                <input required value={formData.school_id} onChange={e => setFormData({...formData, school_id: e.target.value})} className="w-full mt-1 p-2.5 bg-white text-sm font-black border border-zinc-300 rounded-sm focus:border-emerald-600 font-mono" disabled={!!school?.id} />
              </div>
               <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-0.5">Kabupaten / Kota</label>
                <input required value={formData.kota_kabupaten} onChange={e => setFormData({...formData, kota_kabupaten: e.target.value})} className="w-full mt-1 p-2.5 bg-white text-sm font-bold border border-zinc-300 rounded-sm focus:border-emerald-600" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-0.5">Nama Resmi Satuan Pendidikan</label>
              <input required value={formData.nama_sekolah} onChange={e => setFormData({...formData, nama_sekolah: e.target.value})} className="w-full mt-1 p-2.5 bg-white text-sm font-bold border border-zinc-300 rounded-sm focus:border-emerald-600 uppercase" />
            </div>
            
            <div>
               <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest ml-0.5">Relasi Agen / Referral</label>
               <select value={formData.referral_id || ''} onChange={e => setFormData({...formData, referral_id: e.target.value})} className="w-full mt-1 p-2.5 bg-white text-sm font-black border border-zinc-300 rounded-sm focus:border-emerald-600 outline-none">
                  <option value="">-- TANPA AGEN (DIRECT) --</option>
                  {resellers.map(r => <option key={r.id} value={r.referral_id}>{r.name} [{r.referral_id}]</option>)}
               </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-0.5">Klasifikasi Paket</label>
                <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value as any})} className="w-full mt-1 p-2.5 bg-white text-sm font-black border border-zinc-300 rounded-sm focus:border-emerald-600 outline-none">
                  <option value="basic">BASIC (FREE)</option>
                  <option value="pro">PROFESSIONAL (PAID)</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-0.5">Alokasi Batas Kuota</label>
                <input type="number" required value={formData.quota_total} onChange={e => setFormData({...formData, quota_total: parseInt(e.target.value) || 0})} className="w-full mt-1 p-2.5 bg-white text-sm font-black border border-zinc-300 rounded-sm focus:border-emerald-600 font-mono" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-300 text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-white">Batal</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-emerald-800 text-white font-black text-[10px] uppercase tracking-widest rounded-sm border border-emerald-900 shadow-sm active:scale-95 transition-all">
              {isSaving ? <Loader2 className="animate-spin mx-auto" size={14}/> : 'Validasi & Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SuperadminPortal: React.FC<{ user: any; onLogout: () => void; }> = ({ user, onLogout }) => {
  const [view, setView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [schools, setSchools] = useState<SchoolProfile[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [activePrintJob, setActivePrintJob] = useState(null);
  const [formSchool, setFormSchool] = useState<Partial<SchoolProfile> | null>(null);
  const [formReseller, setFormReseller] = useState<Partial<Reseller> | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all([
        supabase.from('school_profiles').select('*').order('nama_sekolah', { ascending: true }),
        supabase.from('resellers').select('*').order('name', { ascending: true }),
        supabase.from('students').select('id'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false })
      ]);
      setSchools(results[0].data || []);
      setResellers(results[1].data || []);
      setAllStudents(results[2].data || []);
      setAllTransactions(results[3].data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);
  
  const handleSaveReseller = async (data: Partial<Reseller>) => {
    try {
      if (data.id) {
        await supabase.from('resellers').update(data).eq('id', data.id);
      } else {
        await supabase.from('resellers').insert([data]);
      }
      setFormReseller(null);
      refreshData();
    } catch (e: any) { alert(e.message); }
  };

  const handleSaveSchool = async (data: Partial<SchoolProfile>) => {
    try {
      if (data.id) {
        await supabase.from('school_profiles').update(data).eq('id', data.id);
      } else {
        await supabase.from('school_profiles').insert([{...data, status: 'approved'}]);
      }
      setFormSchool(null);
      refreshData();
    } catch (e: any) { alert(e.message); }
  };

  if (activePrintJob) {
    return <PrintInvoice school={activePrintJob.school} transaction={activePrintJob.transaction} onDone={() => setActivePrintJob(null)} />;
  }

  const StatItem = ({ label, value, icon, color }: any) => (
    <div className="bg-white border border-zinc-200 p-6 flex flex-col gap-2">
      <div className={`p-2 w-fit ${color} bg-opacity-10 rounded-sm`}>
        {/* Added casting to React.ReactElement<any> to fix type error on size and className props */}
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16, className: color.replace('bg-', 'text-') })}
      </div>
      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-3xl font-black text-zinc-900 tracking-tighter leading-none">{value}</h4>
    </div>
  );

  return (
    <div className="h-screen w-full flex bg-[#f8f9fa] text-zinc-800 font-sans overflow-hidden">
      {/* Sidebar Otoritas */}
      <aside className="w-64 bg-zinc-900 flex flex-col shrink-0 border-r border-black">
        <div className="h-20 flex items-center px-6 gap-3 border-b border-zinc-800 bg-black">
          <img src={LOGO_URL} className="w-8 h-8 logo-inverse" />
          <div>
            <h1 className="text-xs font-black text-white uppercase tracking-widest leading-none">Emes Hub</h1>
            <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter mt-1">Superadmin Console</p>
          </div>
        </div>
        <nav className="flex-1 py-6 space-y-1">
          {SUPERADMIN_MENU_ITEMS.map(item => (
            <button 
              key={item.id}
              onClick={() => setView(item.id)} 
              className={`w-full flex items-center gap-3 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${view===item.id ? 'bg-zinc-800 text-emerald-400 border-r-4 border-emerald-500 shadow-xl' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}
            >
              {/* Added <any> to React.ReactElement cast to fix property 'size' not existing on Attributes error */}
              {React.cloneElement(item.icon as React.ReactElement<any>, { size: 16 })} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-900/20 rounded-sm transition-colors"><LogOut size={16}/> Logout</button>
        </div>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-700" />
            <h2 className="text-xs font-black uppercase text-zinc-900 tracking-[0.2em]">{view} Control Center</h2>
          </div>
          <div className="text-right">
             <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Server Instance</p>
             <p className="text-[11px] font-bold text-emerald-800 leading-none mt-1 uppercase">Cloud Enterprise v7.5</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {isLoading ? ( <div className="h-full flex items-center justify-center"><Loader2 size={32} className="animate-spin text-zinc-300"/></div>
          ) : view === 'dashboard' ? (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatItem label="Institusi Terverifikasi" value={schools.length} icon={<Building2/>} color="bg-emerald-600" />
                  <StatItem label="Agen Referral Aktif" value={resellers.length} icon={<Share2/>} color="bg-zinc-800" />
                  <StatItem label="Peserta Didik Terdata" value={allStudents.length} icon={<Users/>} color="bg-emerald-600" />
                  <StatItem label="Request Pending" value={schools.filter(s => s.status === 'pending').length} icon={<Monitor/>} color="bg-red-600" />
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white border border-zinc-200">
                    <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
                       <h3 className="text-[10px] font-black uppercase text-zinc-800 tracking-widest">Aktivitas Institusi Baru</h3>
                       <button onClick={() => setView('schools')} className="text-[9px] font-black text-emerald-700 hover:underline uppercase">Kelola Database</button>
                    </div>
                    <div className="divide-y divide-zinc-100">
                       {schools.slice(0,5).map(s => (
                         <div key={s.id} className="p-4 flex items-center justify-between hover:bg-zinc-50">
                            <div>
                               <p className="text-[11px] font-black text-zinc-900 uppercase leading-none">{s.nama_sekolah}</p>
                               <p className="text-[9px] text-zinc-400 font-bold mt-1 uppercase">NPSN: {s.school_id} | {s.kota_kabupaten}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase border rounded-sm ${s.status==='approved'?'bg-emerald-50 text-emerald-800 border-emerald-200':'bg-red-50 text-red-800 border-red-200'}`}>{s.status}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="bg-white border border-zinc-200 p-8 flex flex-col items-center justify-center text-center">
                      <ShieldCheck size={48} className="text-zinc-200 mb-4" />
                      <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Sistem Otoritas Terpadu</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase mt-2 max-w-xs">Seluruh perubahan data institusi akan berdampak pada akses login user di tiap sekolah secara langsung.</p>
                  </div>
               </div>
            </div>
          ) : view === 'schools' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center bg-zinc-900 p-6 border-b border-black">
                 <div className="text-white">
                    <h3 className="text-sm font-black uppercase tracking-widest leading-none">Database Institusi Pendidikan</h3>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase mt-1">Daftar seluruh sekolah yang menggunakan platform.</p>
                 </div>
                 <button onClick={() => setFormSchool({})} className="px-6 py-2.5 bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-sm flex items-center gap-2 border border-emerald-800 shadow-xl active:scale-95"><Plus size={16}/> Tambah Institusi</button>
              </div>
              <div className="bg-white border border-zinc-200 overflow-hidden shadow-sm">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-zinc-100 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-200">
                    <tr><th className="p-4 text-left border-r border-zinc-200">Satuan Pendidikan</th><th className="p-4 text-left border-r border-zinc-200">NPSN</th><th className="p-4 text-left border-r border-zinc-200">Agen Referral</th><th className="p-4 text-center border-r border-zinc-200">Status</th><th className="p-4 text-right">Opsi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-bold text-zinc-700">
                    {schools.map(s => (
                      <tr key={s.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="p-4 uppercase text-zinc-900 font-black border-r border-zinc-200">{s.nama_sekolah}</td>
                        <td className="p-4 font-mono text-zinc-500 border-r border-zinc-200">{s.school_id}</td>
                        <td className="p-4 uppercase text-emerald-800 border-r border-zinc-200 font-black">{s.referral_id || '-'}</td>
                        <td className="p-4 text-center border-r border-zinc-200">
                          <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase border ${s.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>{s.status}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => setFormSchool(s)} className="p-1.5 text-zinc-400 hover:text-emerald-700 transition-colors"><Edit2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : view === 'resellers' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center bg-zinc-900 p-6 border-b border-black">
                 <div className="text-white">
                    <h3 className="text-sm font-black uppercase tracking-widest leading-none">Database Keagenan Platform</h3>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase mt-1">Manajemen partner referral dan komisi.</p>
                 </div>
                 <button onClick={() => setFormReseller({})} className="px-6 py-2.5 bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-sm flex items-center gap-2 border border-emerald-800 shadow-xl active:scale-95"><UserPlus size={16}/> Rekrut Partner Baru</button>
              </div>
              <div className="bg-white border border-zinc-200 overflow-hidden shadow-sm">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-zinc-100 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-200">
                    <tr><th className="p-4 text-left border-r border-zinc-200">ID Referral</th><th className="p-4 text-left border-r border-zinc-200">Nama Partner</th><th className="p-4 text-left border-r border-zinc-200">Email Kontak</th><th className="p-4 text-center border-r border-zinc-200">Rate Komisi</th><th className="p-4 text-right">Opsi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-bold text-zinc-700">
                    {resellers.map(r => (
                      <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="p-4 font-mono font-black text-emerald-800 border-r border-zinc-200 uppercase">{r.referral_id}</td>
                        <td className="p-4 uppercase text-zinc-900 font-black border-r border-zinc-200">{r.name}</td>
                        <td className="p-4 text-[10px] text-zinc-500 border-r border-zinc-200 lowercase">{r.email || '-'}</td>
                        <td className="p-4 text-center text-[10px] font-black text-emerald-800 border-r border-zinc-200">{(r.commission_rate * 100).toFixed(0)}%</td>
                        <td className="p-4 text-right">
                          <button onClick={() => setFormReseller(r)} className="p-1.5 text-zinc-400 hover:text-emerald-700 transition-colors"><Edit2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : ( // BILLING
             <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-black p-10 border-b-4 border-emerald-700 text-white flex justify-between items-center">
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Platform Revenue (Settled)</p>
                      <h4 className="text-5xl font-black tracking-tighter leading-none">Rp {allTransactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0).toLocaleString('id-ID')}</h4>
                   </div>
                   <CreditCard size={48} className="text-zinc-800" />
                </div>
                <div className="bg-white border border-zinc-200 overflow-hidden shadow-sm">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-zinc-100 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-200">
                        <tr><th className="p-4 text-left border-r border-zinc-200">No. Invoice</th><th className="p-4 text-left border-r border-zinc-200">Institusi</th><th className="p-4 text-center border-r border-zinc-200">Nominal Tagihan</th><th className="p-4 text-center border-r border-zinc-200">Status</th><th className="p-4 text-right">Tindakan</th></tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 font-bold text-zinc-700">
                        {allTransactions.map(trx => {
                          const school = schools.find(s => s.school_id === trx.school_id);
                          return (<tr key={trx.id} className="hover:bg-zinc-50">
                            <td className="p-4 font-mono text-zinc-500 text-[10px] border-r border-zinc-200 uppercase">{trx.invoice_number}</td>
                            <td className="p-4 uppercase text-zinc-900 font-black border-r border-zinc-200">{school?.nama_sekolah || 'N/A'}</td>
                            <td className="p-4 text-center font-black border-r border-zinc-200">Rp {trx.amount.toLocaleString('id-ID')}</td>
                            <td className="p-4 text-center border-r border-zinc-200">
                              <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase border ${trx.status === 'paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-orange-50 text-orange-800 border-orange-200'}`}>{trx.status}</span>
                            </td>
                            <td className="p-4 text-right">
                                {trx.status === 'pending' ? (
                                  <button onClick={() => supabase.from('transactions').update({ status: 'paid' }).eq('id', trx.id).then(refreshData)} className="px-4 py-1.5 bg-emerald-800 text-white font-black text-[9px] uppercase tracking-widest rounded-sm border border-emerald-900 shadow-sm active:scale-95 transition-all">Verifikasi Bayar</button>
                                ) : (
                                  <button onClick={() => setActivePrintJob({school, transaction: trx})} className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors"><Printer size={16}/></button>
                                )}
                            </td>
                          </tr>)
                        })}
                      </tbody>
                    </table>
                  </div>
              </div>
          )}
        </main>
        <footer className="h-10 border-t border-zinc-200 bg-white px-8 flex items-center justify-center">
            <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.4em]">&copy; 2026 Emes EduTech</p>
        </footer>
      </div>

      {formSchool && <SchoolFormModal school={formSchool} resellers={resellers} onSave={handleSaveSchool} onClose={() => setFormSchool(null)} />}
      {formReseller && <ResellerFormModal reseller={formReseller} onSave={handleSaveReseller} onClose={() => setFormReseller(null)} />}
    </div>
  );
};

export default SuperadminPortal;
