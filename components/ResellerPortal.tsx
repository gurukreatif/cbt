
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase.ts';
import { 
  Building2, Users, LogOut, Plus, Loader2,
  LayoutDashboard, CreditCard, Share2, TrendingUp, ChevronRight
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
        .order('created_at', { ascending: false });
      
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

  return (
    <div className="h-screen w-full flex bg-[#fafbfc] text-slate-800 font-sans overflow-hidden">
      {isRegistering && <ResellerSchoolRegistration user={user} onClose={() => { setIsRegistering(false); refreshData(); }} />}
      
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="h-24 flex items-center px-8 gap-4 border-b border-slate-50">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg"><Share2 size={24}/></div>
          <h1 className="text-sm font-black text-slate-900 uppercase leading-none">Partner Hub</h1>
        </div>
        <nav className="flex-1 px-6 py-10 space-y-3">
           <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${view==='dashboard' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><LayoutDashboard size={18}/> Dashboard</button>
           <button onClick={() => setView('schools')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${view==='schools' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><Building2 size={18}/> Sekolah Binaan</button>
           <button onClick={() => setView('commissions')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${view==='commissions' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}><CreditCard size={18}/> Laporan Komisi</button>
        </nav>
        <div className="p-6 border-t border-slate-50">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase text-red-500 hover:bg-red-50"><LogOut size={18}/> Logout</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0">
          <h2 className="text-sm font-black uppercase text-slate-800 tracking-widest">Portal Agen: {user.name}</h2>
          <div className="flex items-center gap-3">
             <p className="text-xs font-bold text-slate-400">Referral ID: {user.referral_id}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 scrollbar-hide">
           {isLoading ? ( <div className="h-full flex items-center justify-center"><Loader2 size={40} className="animate-spin text-indigo-200"/></div>
           ) : view === 'dashboard' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sekolah Binaan</p>
                  <h4 className="text-4xl font-black">{mySchools.length}</h4>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Menunggu Approval</p>
                  <h4 className="text-4xl font-black text-orange-500">{mySchools.filter(s => s.status === 'pending').length}</h4>
                </div>
                <div className="bg-indigo-900 p-8 rounded-3xl text-white shadow-xl">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Total Komisi</p>
                  <h4 className="text-4xl font-black text-white">Rp {totalCommission.toLocaleString('id-ID')}</h4>
                </div>
                
                <div className="md:col-span-3 bg-white rounded-[40px] p-12 border-2 border-dashed border-slate-200 text-center">
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Daftarkan Sekolah Baru?</h3>
                   <p className="text-slate-400 mt-2 font-medium">Bantu sekolah lain menggunakan Emes CBT dan kumpulkan komisi Anda.</p>
                   <button onClick={() => setIsRegistering(true)} className="mt-8 px-12 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
                     Daftarkan Sekarang
                   </button>
                </div>
              </div>
           ) : view === 'schools' ? (
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm animate-in fade-in">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <tr><th className="p-6 text-left">Nama Sekolah</th><th className="p-6 text-left">NPSN</th><th className="p-6 text-center">Status</th><th className="p-6 text-center">Plan</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                      {mySchools.map(s => (
                        <tr key={s.id}>
                          <td className="p-6 uppercase">{s.nama_sekolah}</td>
                          <td className="p-6 font-mono text-slate-400">{s.school_id}</td>
                          <td className="p-6 text-center">
                            <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase border ${s.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{s.status.toUpperCase()}</span>
                          </td>
                          <td className="p-6 text-center uppercase text-slate-400">{s.plan || 'basic'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
           ) : (
             <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm animate-in fade-in">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <tr><th className="p-6 text-left">Invoice #</th><th className="p-6 text-left">Nilai Transaksi</th><th className="p-6 text-center">Status</th><th className="p-6 text-center">Komisi Anda</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                      {myTransactions.map(trx => (
                        <tr key={trx.id}>
                          <td className="p-6 font-mono text-slate-400">{trx.invoice_number}</td>
                          <td className="p-6">Rp {trx.amount.toLocaleString('id-ID')}</td>
                          <td className="p-6 text-center uppercase text-[10px]">{trx.status}</td>
                          <td className="p-6 text-center font-black text-emerald-700">Rp {(trx.status === 'paid' ? trx.amount * user.commission_rate : 0).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResellerPortal;
