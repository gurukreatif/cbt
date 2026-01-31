
import React, { useState } from 'react';
import { Loader2, AlertCircle, Eye, EyeOff, Shield, Key, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase.ts';

interface SuperadminLoginProps {
  onLoginSuccess: (user: any, role: UserRole) => void;
}

const SuperadminLogin: React.FC<SuperadminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) {
      setError('Wajib mengisi identitas admin.');
      return;
    }
    setLoading(true);
    try {
      const { data: admin, error: dbError } = await supabase
        .from('super_admins')
        .select('*')
        .ilike('username', cleanUsername)
        .eq('password', password)
        .maybeSingle();

      if (dbError) throw dbError;
      if (admin) {
        onLoginSuccess(admin, 'super_admin');
      } else {
        setError('Kredensial tidak valid.');
      }
    } catch (err: any) {
      setError(`Sistem Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white font-sans relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-30"></div>

        <div className="w-full max-w-sm relative z-10">
            <div className="text-center mb-10">
                <div className="inline-flex p-4 bg-emerald-50 rounded-2xl mb-4 border border-emerald-100 shadow-sm">
                    <ShieldCheck size={40} className="text-emerald-600"/>
                </div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Emes Central</h1>
                <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase">Superadmin Authority</p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 p-8 md:p-10">
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[11px] font-bold flex items-center gap-2 rounded-xl">
                            <AlertCircle size={16} className="shrink-0" /> 
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Admin ID</label>
                         <div className="relative">
                            <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-emerald-600 outline-none transition-all"
                                placeholder="Username"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Secret Key</label>
                        <div className="relative">
                            <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-emerald-600 outline-none transition-all"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-300 hover:text-emerald-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <>Authorize Access <ArrowRight size={16} /></>}
                    </button>
                </form>
            </div>
            
            <div className="mt-12 text-center">
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.4em]">
                    &copy; 2026 EMES HUB ENTERPRISE
                </p>
            </div>
        </div>
    </div>
  );
};

export default SuperadminLogin;
