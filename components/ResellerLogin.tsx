
import React, { useState } from 'react';
import { Loader2, AlertCircle, Eye, EyeOff, User, Key, ArrowRight, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
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
      setError('ID Partner dan Password wajib diisi.');
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
        setError('Kredensial partner tidak valid.');
      }
    } catch (err: any) {
      setError(`Kesalahan Otorisasi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-zinc-50 font-sans relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-zinc-200">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px:32px]"></div>
        </div>

        <div className="w-full max-w-sm relative z-10">
            <div className="text-center mb-8">
                <div className="inline-flex p-3 bg-emerald-800 rounded-sm mb-4 shadow-xl border border-emerald-900">
                    <Share2 size={32} className="text-white"/>
                </div>
                <h1 className="text-xl font-black text-zinc-900 uppercase tracking-[0.2em]">Emes CBT</h1>
                <p className="text-[9px] text-zinc-400 font-bold tracking-[0.4em] uppercase mt-2">Partner & Network Console</p>
            </div>

            <div className="bg-white rounded-sm shadow-2xl border border-zinc-200 p-8">
                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[10px] font-black uppercase flex items-center gap-2">
                            <AlertCircle size={14} className="shrink-0" /> 
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-[9px] font-black text-zinc-400 mb-2 uppercase tracking-widest">Partner Identity</label>
                         <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" />
                            <input 
                                type="text"
                                value={referralId}
                                onChange={e => setReferralId(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-300 rounded-sm text-sm font-bold text-zinc-800 focus:bg-white focus:border-emerald-700 outline-none transition-all uppercase"
                                placeholder="ID PARTNER"
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[9px] font-black text-zinc-400 mb-2 uppercase tracking-widest">Partner Key</label>
                        <div className="relative">
                            <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none" />
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 bg-zinc-50 border border-zinc-300 rounded-sm text-sm font-bold text-zinc-800 focus:bg-white focus:border-emerald-700 outline-none transition-all"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-300 hover:text-emerald-700 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xl active:scale-[0.98]"
                    >
                        {loading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <>Authorize Partner <ArrowRight size={14} /></>
                        )}
                    </button>
                </form>
            </div>
            
            <div className="mt-12 text-center">
                <p className="text-[9px] text-zinc-300 font-black uppercase tracking-[0.5em]">
                    &copy; 2026 Emes EduTech
                </p>
            </div>
        </div>
    </div>
  );
};

export default ResellerLogin;
