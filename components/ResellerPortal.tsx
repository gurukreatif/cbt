
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase.ts';
import { 
  Building2, Users, LogOut, Plus, Loader2,
  LayoutDashboard, CreditCard, Share2, TrendingUp, ChevronRight,
  ShieldCheck, ArrowRight, Hash, Clock
} from 'lucide-react';
import { SchoolProfile, Reseller, Transaction } from '../types.ts';
import { LOGO_URL } from '../constants';
import ResellerSchoolRegistration from './ResellerSchoolRegistration.tsx';

const ResellerPortal: React.FC<{ user: Reseller; onLogout: () => void; }> = ({ user, onLogout }) => {
  const [view, setView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [mySchools, setMySchools] = useState<SchoolProfile[]>([]);
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const { data: schoolData } = await supabase
        .from('school_profiles')
        .select('*')
        .eq('referral_id', user.referral_id)
        .order('nama_sekolah', { ascending: true });
      
      const schoolIds = (schoolData || []).map(s => s.school_id);
      const { data: transactionData } = await supabase
        .from('transactions')
        .select('*')
        .in('school_id', schoolIds)
        .order('created_at', { ascending: false });
        
      setMySchools(schoolData || []);
      setMyTransactions(transactionData || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);
  
  const totalCommission = useMemo(() => {
    return myTransactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + (t.amount * user.commission_rate), 0);
  }, [myTransactions, user.commission_rate]);

  const StatBox = ({ label, value, icon, color }: any) => (
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
      {isRegistering && <ResellerSchoolRegistration user={user} onClose={() => { setIsRegistering(false); refreshData(); }} />}
      
      {/* Sidebar Partner */}
      <aside className="w-64 bg-zinc-900 flex flex-col shrink-0 border-r border-black">
        <div className="h-20 flex items-center px-6 gap-3 border-b border-zinc-800 bg-black">
          <div className="p-2 bg-emerald-800 rounded-sm text-white shadow-lg"><Share2 size={16}/></div>
          <div>
            <h1 className="text-xs font-black text-white uppercase tracking-widest leading-none">Partner Hub</h1>
            <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter mt-1">Emes CBT Network</p>
          </div>
        </div>
        <nav className="flex-1 py-6 space-y-1">
           <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${view==='dashboard' ? 'bg-zinc-800 text-emerald-400 border-r-4 border-emerald-500 shadow-xl' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}><LayoutDashboard size={16}/> Beranda</button>
           <button onClick={() => setView('schools')} className={`w-full flex items-center gap-3 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${view==='schools' ? 'bg-zinc-800 text-emerald-400 border-r-4 border-emerald-500 shadow-xl' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}><Building2 size={16}/> Sekolah Binaan</button>
           <button onClick={() => setView('commissions')} className={`w-full flex items-center gap-3 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all ${view==='commissions' ? 'bg-zinc-800 text-emerald-400 border-r-4 border-emerald-500 shadow-xl' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}><CreditCard size={16}/> Rekap Komisi</button>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-900/20 rounded-sm transition-colors"><LogOut size={16}/> Logout</button>
        </div>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-black uppercase text-zinc-900 tracking-[0.2em]">Partner Portal: {user.name}</h2>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Referral Identity</p>
                <p className="text-[11px] font-black text-emerald-800 uppercase tracking-tighter mt-1">{user.referral_id}</p>
             </div>
             <div className="p-2 bg-zinc-50 border border-zinc-200 rounded-sm"><ShieldCheck size={20} className="text-emerald-700" /></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
           {isLoading ? ( <div className="h-full flex items-center justify-center"><Loader2 size={32} className="animate-spin text-zinc-300"/></div>
           ) : view === 'dashboard' ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatBox label="Institusi Binaan" value={mySchools.length} icon={<Building2/>} color="bg-emerald-700" />
                  <StatBox label="Approval Tertunda" value={mySchools.filter(s => s.status === 'pending').length} icon={<Clock/>} color="bg-orange-600" />
                  <StatBox label="Estimasi Pendapatan" value={`Rp ${totalCommission.toLocaleString('id-ID')}`} icon={<TrendingUp/>} color="bg-emerald-800" />
                </div>
                
                <div className="bg-zinc-900 p-12 border-b-8 border-emerald-600 text-center text-white space-y-4">
                   <h3 className="text-2xl font-black uppercase tracking-tight">Perluas Jaringan Digitalisasi Pendidikan</h3>
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest max-w-lg mx-auto">Daftarkan sekolah rekanan Anda melalui portal ini untuk mendapatkan validasi referral otomatis dan rekapitulasi komisi yang transparan.</p>
                   <button onClick={() => setIsRegistering(true)} className="mt-6 px-10 py-3 bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-sm border border-emerald-800 shadow-xl active:scale-95 transition-all">
                     Tambah Sekolah Binaan Baru
                   </button>
                </div>
              </div>
           ) : view === 'schools' ? (
              <div className="bg-white border border-zinc-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
                  <div className="p-4 bg-zinc-50 border-b border-zinc-200">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">Database Sekolah Rekanan</h3>
                  </div>
                  <table className="w-full text-xs border-collapse">
                    <thead className="bg-zinc-100 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-200">
                      <tr><th className="p-4 text-left border-r border-zinc-200">Satuan Pendidikan</th><th className="p-4 text-left border-r border-zinc-200">NPSN</th><th className="p-4 text-center border-r border-zinc-200">Klasifikasi</th><th className="p-4 text-center">Status Aktivasi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 font-bold text-zinc-700">
                      {mySchools.map(s => (
                        <tr key={s.id} className="hover:bg-zinc-50">
                          <td className="p-4 uppercase text-zinc-900 font-black border-r border-zinc-200">{s.nama_sekolah}</td>
                          <td className="p-4 font-mono text-zinc-500 border-r border-zinc-200 uppercase">{s.school_id}</td>
                          <td className="p-4 text-center border-r border-zinc-200 uppercase text-[9px] font-black text-emerald-800">{s.plan || 'basic'}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase border ${s.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>{s.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
           ) : (
             <div className="bg-white border border-zinc-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
                  <div className="p-4 bg-zinc-50 border-b border-zinc-200">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-800">Laporan Realisasi Komisi Keagenan</h3>
                  </div>
                  <table className="w-full text-xs border-collapse">
                    <thead className="bg-zinc-100 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-200">
                      <tr><th className="p-4 text-left border-r border-zinc-200">Referensi Invoice</th><th className="p-4 text-left border-r border-zinc-200">Nilai Transaksi</th><th className="p-4 text-center border-r border-zinc-200">Status</th><th className="p-4 text-right">Hak Komisi Anda</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 font-bold text-zinc-700">
                      {myTransactions.map(trx => (
                        <tr key={trx.id} className="hover:bg-zinc-50">
                          <td className="p-4 font-mono text-zinc-500 border-r border-zinc-200 uppercase text-[10px]">{trx.invoice_number}</td>
                          <td className="p-4 border-r border-zinc-200 font-black">Rp {trx.amount.toLocaleString('id-ID')}</td>
                          <td className="p-4 text-center border-r border-zinc-200">
                             <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase border ${trx.status==='paid'?'bg-emerald-50 text-emerald-800':'bg-zinc-100 text-zinc-400'}`}>{trx.status}</span>
                          </td>
                          <td className="p-4 text-right font-black text-emerald-800">Rp {(trx.status === 'paid' ? trx.amount * user.commission_rate : 0).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
          )}
        </main>
        <footer className="h-10 border-t border-zinc-200 bg-white px-8 flex items-center justify-center">
            <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.4em]">&copy; 2026 Emes EduTech</p>
        </footer>
      </div>
    </div>
  );
};

export default ResellerPortal;
