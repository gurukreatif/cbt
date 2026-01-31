
import React, { useState } from 'react';
import { Loader2, AlertCircle, Eye, EyeOff, User, Key, ArrowRight, Share2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import { LOGO_URL } from '../constants';
import { UserRole } from '../types.ts';

interface ResellerLoginProps {
  onLoginSuccess: (user: any, role: UserRole) => void;
}

const ResellerLogin: React.FC<ResellerLoginProps> = ({ onLoginSuccess }) => {
  const [referralId, setReferralId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!referralId || !password) {
      setError('ID Agen dan Password wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const { data: reseller, error: resellerError } = await supabase
        .from('resellers')
        .select('*')
        .eq('referral_id', referralId.toUpperCase().trim())
        .eq('password', password)
        .maybeSingle();

      if (resellerError) throw resellerError;

      if (reseller) {
        onLoginSuccess(reseller, 'reseller');
      } else {
        setError('ID Agen atau password salah.');
      }
    } catch (err: any) {
      setError(`Koneksi Gagal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white font-sans relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:40px_40px]"></div>
        </div>

        <div className="w-full max-w-sm relative z-10">
            <div className="text-center mb-10">
                <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-6 border border-indigo-100 shadow-sm">
                    <Share2 size={44} className="text-indigo-600"/>
                </div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Partner Console</h1>
                <p className="text-xs text-slate-400 font-bold tracking-[0.2em] uppercase mt-2">Agent & Reseller Access</p>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] border border-slate-100 p-8 md:p-10">
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[11px] font-bold flex items-center gap-2 rounded-xl animate-shake">
                            <AlertCircle size={16} className="shrink-0" /> 
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Referral Identity</label>
                         <div className="relative">
                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            <input 
                                type="text"
                                value={referralId}
                                onChange={e => setReferralId(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all uppercase"
                                placeholder="ID AGEN"
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Secure Password</label>
                        <div className="relative">
                            <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-300 hover:text-indigo-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xl shadow-indigo-900/10 active:scale-[0.98]"
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>Authorize Partner <ArrowRight size={16} /></>
                        )}
                    </button>
                </form>
            </div>
            
            <div className="mt-12 text-center">
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">
                    &copy; 2026 EMES PARTNER PROGRAM
                </p>
            </div>
        </div>
    </div>
  );
};

export default ResellerLogin;
