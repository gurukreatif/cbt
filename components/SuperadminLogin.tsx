
import React, { useState } from 'react';
import { Loader2, AlertCircle, Shield, Key, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';
import { supabase } from '../lib/supabase.ts';

interface SuperadminLoginProps {
  onLoginSuccess: (user: any, role: UserRole) => void;
}

const SuperadminLogin: React.FC<SuperadminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email dan Password otoritas wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      // PROSES LOGIN RESMI KE SUPABASE AUTH
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Ambil profil tambahan dari tabel publik
        const { data: profile, error: profileError } = await supabase
          .from('super_admins')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile) {
          await supabase.auth.signOut();
          throw new Error('Akses ditolak: Akun Anda tidak terdaftar sebagai Superadmin.');
        }

        const superUser = {
          id: data.user.id,
          email: data.user.email,
          nama: profile.nama,
          username: "superadmin",
          jabatan: "Platform Owner"
        };
        
        onLoginSuccess(superUser, 'super_admin');
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        setError('Kredensial Otoritas tidak valid.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-zinc-50 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-40 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]"></div>
        </div>

        <div className="w-full max-w-sm relative z-10">
            <div className="text-center mb-8">
                <div className="inline-flex p-4 bg-zinc-900 rounded-sm mb-4 shadow-2xl border border-zinc-700">
                    <ShieldCheck size={36} className="text-emerald-500"/>
                </div>
                <h1 className="text-xl font-black text-zinc-900 uppercase tracking-[0.25em]">Emes CBT</h1>
                <p className="text-[10px] text-zinc-400 font-bold tracking-[0.4em] uppercase mt-2">Otoritas Infrastruktur</p>
            </div>

            <div className="bg-white rounded-sm shadow-2xl border border-zinc-200 p-8">
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-black uppercase rounded-sm text-center">
                       Secure Encryption Active (Bcrypt)
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[10px] font-black uppercase flex items-center gap-2 animate-shake">
                            <AlertCircle size={14} className="shrink-0" /> 
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-[9px] font-black text-zinc-400 mb-2 uppercase tracking-widest">Email Otoritas</label>
                         <div className="relative">
                            <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
                            <input 
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3.5 bg-zinc-50 border border-zinc-300 rounded-sm text-sm font-bold text-zinc-800 focus:bg-white focus:border-emerald-700 outline-none transition-all"
                                placeholder="admin@emescbt.com"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[9px] font-black text-zinc-400 mb-2 uppercase tracking-widest">Kunci Keamanan</label>
                        <div className="relative">
                            <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3.5 bg-zinc-50 border border-zinc-300 rounded-sm text-sm font-bold text-zinc-800 focus:bg-white focus:border-emerald-700 outline-none transition-all"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-300 hover:text-emerald-700"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-sm flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <>Dapatkan Akses <ArrowRight size={16} /></>}
                    </button>
                </form>
            </div>
            
            <div className="mt-12 text-center opacity-30">
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.5em]">
                    &copy; 2026 Emes EduTech Hub
                </p>
            </div>
        </div>
    </div>
  );
};

export default SuperadminLogin;
