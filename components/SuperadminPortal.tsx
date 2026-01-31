
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase.ts';
import { 
  Building2, Users, LogOut, Plus, Edit2, Trash2, Search, Save, 
  AlertTriangle, Loader2, LayoutDashboard, CreditCard, Share2, 
  ShieldCheck, Printer, CheckCircle2, UserPlus, Mail, Phone, Monitor
} from 'lucide-react';
import { SchoolProfile, Teacher, ExamSession, Transaction, Reseller } from '../types.ts';
import { LOGO_URL, SUPERADMIN_MENU_ITEMS } from '../constants';
import { PrintInvoice } from './PrintLayouts.tsx';

const COST_PER_QUOTA_UNIT = 1500;

// MODAL FORM RESELLER (AGEN)
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 animate-in zoom-in-95">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{reseller?.id ? 'Edit' : 'Tambah'} Agen Platform</h3>
            <button type="button" onClick={onClose} className="text-slate-400"><Plus className="rotate-45" size={24}/></button>
          </div>
          <div className="p-8 space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Referral (Unique)</label>
              <input required value={formData.referral_id} onChange={e => setFormData({...formData, referral_id: e.target.value.toUpperCase()})} className="w-full mt-1.5 p-3.5 bg-slate-50 text-sm font-black border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 outline-none uppercase" placeholder="MISAL: AGEN01" disabled={!!reseller?.id} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1.5 p-3.5 bg-slate-50 text-sm font-bold border border-slate-200 rounded-2xl focus:bg-white outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Akses Portal</label>
              <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full mt-1.5 p-3.5 bg-slate-50 text-sm font-mono border border-slate-200 rounded-2xl focus:bg-white outline-none" placeholder="Password untuk login agen" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full mt-1.5 p-3.5 bg-slate-50 text-sm font-bold border border-slate-200 rounded-2xl focus:bg-white outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate Komisi (%)</label>
                <input type="number" step="0.01" required value={formData.commission_rate} onChange={e => setFormData({...formData, commission_rate: parseFloat(e.target.value)})} className="w-full mt-1.5 p-3.5 bg-slate-50 text-sm font-black border border-slate-200 rounded-2xl focus:bg-white outline-none" />
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
            <button type="submit" disabled={isSaving} className="w-full py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-900/10 active:scale-95 transition-all">
              {isSaving ? <Loader2 className="animate-spin mx-auto" size={16}/> : 'Simpan Data Agen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// FORM SEKOLAH (DENGAN PEMILIHAN AGEN/RESELLER)
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 animate-in zoom-in-95">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{school?.id ? 'Edit' : 'Daftarkan'} Sekolah</h3>
            <button type="button" onClick={onClose} className="text-slate-400"><Plus className="rotate-45" size={24}/></button>
          </div>
          <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-hide">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NPSN</label>
                <input required value={formData.school_id} onChange={e => setFormData({...formData, school_id: e.target.value})} className="w-full mt-1.5 p-3.5 bg-slate-50 text-sm font-bold border border-slate-200 rounded-2xl focus:bg-white outline-none transition-all" disabled={!!school?.id} />
              </div>
               <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kota/Kabupaten</label>
                <input required value={formData.kota_kabupaten} onChange={e => setFormData({...formData, kota_kabupaten: e.target.value})} className="w-full mt-1.5 p-3.5 bg-slate-50 text-sm font-bold border border-slate-200 rounded-2xl focus:bg-white outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Satuan Pendidikan</label>
              <input required value={formData.nama_sekolah} onChange={e => setFormData({...formData, nama_sekolah: e.target.value})} className="w-full mt-1.5 p-3.5 bg-slate-50 text-sm font-bold border border-slate-200 rounded-2xl focus:bg-white outline-none transition-all" />
            </div>
            
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Agen / Referral</label>
               <select value={formData.referral_id || ''} onChange={e => setFormData({...formData, referral_id: e.target.value})} className="w-full mt-1.5 p-3.5 bg-slate-50 text-sm font-black border border-slate-200 rounded-2xl focus:bg-white outline-none transition-all">
                  <option value="">TANPA AGEN (DIRECT)</option>
                  {resellers.map(r => <option key={r.id} value={r.referral_id}>{r.name} ({r.referral_id})</option>)}
               </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rencana Paket</label>
                <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value as any})} className="w-full mt-1.5 p-3.5 bg-slate-50 text-sm font-black border border-slate-200 rounded-2xl focus:bg-white outline-none transition-all">
                  <option value="basic">BASIC (FREE)</option>
                  <option value="pro">PRO (PAID)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alokasi Kuota</label>
                <input type="number" required value={formData.quota_total} onChange={e => setFormData({...formData, quota_total: parseInt(e.target.value) || 0})} className="w-full mt-1.5 p-3.5 bg-slate-50 text-sm font-black border border-slate-200 rounded-2xl focus:bg-white outline-none transition-all" />
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
            <button type="submit" disabled={isSaving} className="w-full py-4 bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-900/10 active:scale-95 transition-all">
              {isSaving ? <Loader2 className="animate-spin mx-auto" size={16}/> : 'Simpan Institusi'}
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
        supabase.from('school_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('resellers').select('*').order('created_at', { ascending: false }),
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

  return (
    <div className="h-screen w-full flex bg-[#fafbfc] text-slate-800 font-sans overflow-hidden">
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="h-24 flex items-center px-8 gap-4 border-b border-slate-50">
          <img src={LOGO_URL} className="w-10 h-10" />
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">Emes Hub</h1>
        </div>
        <nav className="flex-1 px-6 py-10 space-y-3">
          {SUPERADMIN_MENU_ITEMS.map(item => (
            <button 
              key={item.id}
              onClick={() => setView(item.id)} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${view===item.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-50">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase text-red-500 hover:bg-red-50"><LogOut size={20}/> Logout</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0">
          <h2 className="text-sm font-black uppercase text-slate-800 tracking-[0.2em]">{view}</h2>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><ShieldCheck size={24} /></div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          {isLoading ? ( <div className="h-full flex items-center justify-center"><Loader2 size={48} className="animate-spin text-slate-200"/></div>
          ) : view === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-in fade-in">
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Sekolah</p>
                    <h4 className="text-4xl font-black">{schools.length}</h4>
                 </div>
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Agen</p>
                    <h4 className="text-4xl font-black text-indigo-600">{resellers.length}</h4>
                 </div>
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Siswa</p>
                    <h4 className="text-4xl font-black text-emerald-600">{allStudents.length}</h4>
                 </div>
            </div>
          ) : view === 'schools' ? (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center">
                 <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest">Database Sekolah</h3>
                 <button onClick={() => setFormSchool({})} className="px-8 py-3.5 bg-emerald-700 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl flex items-center gap-3 shadow-xl"><Plus size={20}/> Tambah Sekolah</button>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr><th className="p-6 text-left">Nama Sekolah</th><th className="p-6 text-left">NPSN</th><th className="p-6 text-left">Agen/Referral</th><th className="p-6 text-center">Status</th><th className="p-6 text-right">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                    {schools.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6 uppercase">{s.nama_sekolah}</td>
                        <td className="p-6 font-mono text-slate-400">{s.school_id}</td>
                        <td className="p-6 uppercase text-indigo-600">{s.referral_id || '-'}</td>
                        <td className="p-6 text-center">
                          <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border ${s.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{s.status.toUpperCase()}</span>
                        </td>
                        <td className="p-6 text-right">
                          <button onClick={() => setFormSchool(s)} className="p-3 text-slate-400 hover:text-emerald-600"><Edit2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : view === 'resellers' ? (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-center">
                 <h3 className="text-sm font-black uppercase text-slate-500 tracking-widest">Manajemen Agen</h3>
                 <button onClick={() => setFormReseller({})} className="px-8 py-3.5 bg-indigo-600 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl flex items-center gap-3 shadow-xl"><UserPlus size={20}/> Rekrut Agen Baru</button>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr><th className="p-6 text-left">ID Referral</th><th className="p-6 text-left">Nama Agen</th><th className="p-6 text-left">Kontak</th><th className="p-6 text-center">Komisi</th><th className="p-6 text-right">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                    {resellers.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="p-6 font-mono font-black text-indigo-700">{r.referral_id}</td>
                        <td className="p-6 uppercase">{r.name}</td>
                        <td className="p-6 text-xs text-slate-400">{r.email || r.phone || '-'}</td>
                        <td className="p-6 text-center text-xs font-black text-emerald-700">{(r.commission_rate * 100).toFixed(0)}%</td>
                        <td className="p-6 text-right">
                          <button onClick={() => setFormReseller(r)} className="p-3 text-slate-400 hover:text-indigo-600"><Edit2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : ( // BILLING
             <div className="space-y-8 animate-in fade-in">
                <div className="bg-slate-900 p-12 rounded-[40px] text-white shadow-2xl">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">Total Pendapatan Platform</p>
                   <h4 className="text-5xl font-black tracking-tighter">Rp {allTransactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0).toLocaleString('id-ID')}</h4>
                </div>
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <tr><th className="p-6 text-left">Invoice</th><th className="p-6 text-left">Sekolah</th><th className="p-6 text-center">Nominal</th><th className="p-6 text-center">Status</th><th className="p-6 text-right">Aksi</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                        {allTransactions.map(trx => {
                          const school = schools.find(s => s.school_id === trx.school_id);
                          return (<tr key={trx.id} className="hover:bg-slate-50/50">
                            <td className="p-6 font-mono text-slate-400 text-xs">{trx.invoice_number}</td>
                            <td className="p-6 uppercase">{school?.nama_sekolah || 'N/A'}</td>
                            <td className="p-6 text-center font-black">Rp{trx.amount.toLocaleString('id-ID')}</td>
                            <td className="p-6 text-center">
                              <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase ${trx.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>{trx.status.toUpperCase()}</span>
                            </td>
                            <td className="p-6 text-right">
                                {trx.status === 'pending' && <button onClick={() => supabase.from('transactions').update({ status: 'paid' }).eq('id', trx.id).then(refreshData)} className="px-5 py-2 bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-900/10 active:scale-95 transition-all">Setujui</button>}
                            </td>
                          </tr>)
                        })}
                      </tbody>
                    </table>
                  </div>
              </div>
          )}
        </main>
      </div>

      {formSchool && <SchoolFormModal school={formSchool} resellers={resellers} onSave={handleSaveSchool} onClose={() => setFormSchool(null)} />}
      {formReseller && <ResellerFormModal reseller={formReseller} onSave={handleSaveReseller} onClose={() => setFormReseller(null)} />}
    </div>
  );
};

export default SuperadminPortal;
