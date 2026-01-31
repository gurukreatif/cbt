import React, { useState } from 'react';
import { Loader2, AlertCircle, Eye, EyeOff, School, User, Key, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import { LOGO_URL } from '../constants';
import { UserRole } from '../types.ts';

interface LoginPageProps {
  onLoginSuccess: (user: any, role: UserRole) => void;
  onBackToLanding: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [npsn, setNpsn] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!npsn || !username || !password) {
      setError('NPSN, Username, dan password harus diisi.');
      setLoading(false);
      return;
    }
    if (!/^\d{8}$/.test(npsn)) {
      setError('NPSN harus terdiri dari 8 digit angka.');
      setLoading(false);
      return;
    }

    try {
        const { data: school, error: schoolError } = await supabase
            .from('school_profiles')
            .select('school_id, status')
            .eq('school_id', npsn)
            .maybeSingle();

        if (schoolError) throw schoolError;
        if (!school) throw new Error(`Sekolah dengan NPSN ${npsn} tidak ditemukan.`);
        if (school.status !== 'approved') throw new Error(`Akun sekolah ini belum disetujui oleh administrator.`);

        const { data: teacher } = await supabase.from('teachers')
          .select('*')
          .eq('school_id', npsn)
          .or(`username.eq.${username},nip.eq.${username}`)
          .eq('password', password)
          .maybeSingle();

        if (teacher) {
            let role: 'admin' | 'guru' | 'proktor' | 'pengawas' = 'guru';
            const j = teacher.jabatan;
            if (j === 'Admin Sistem' || j === 'Kepala Sekolah' || j === 'Wakil Kepala Sekolah') role = 'admin';
            else if (j === 'Proktor Sesi') role = 'proktor';
            else if (j === 'Pengawas Ruang') role = 'pengawas';
            setLoading(false);
            onLoginSuccess(teacher, role);
            return;
        }

        const { data: student } = await supabase.from('students')
          .select('*')
          .eq('school_id', npsn)
          .or(`username.eq.${username},nis.eq.${username}`)
          .eq('password', password)
          .maybeSingle();
          
        if (student) {
            if (student.status !== 'Aktif') throw new Error('Akun siswa tidak aktif.');
            setLoading(false);
            onLoginSuccess(student, 'siswa');
            return;
        }

        throw new Error('Username atau password salah untuk sekolah ini.');

    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 anbk-bg-pattern font-sans">
        <div className="w-full max-w-sm">
            <div className="text-center mb-8">
                <img src={LOGO_URL} alt="Logo" className="w-16 h-16 mx-auto mb-4"/>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Portal Login Sekolah</h1>
                <p className="text-sm text-emerald-800/80 font-bold tracking-wider">Aplikasi Ujian Sekolah</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl border border-white/50">
                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 rounded-md animate-shake">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">NPSN Sekolah</label>
                            <div className="relative">
                                <School size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input 
                                    type="text"
                                    value={npsn}
                                    onChange={e => setNpsn(e.target.value.replace(/\D/g, ''))}
                                    maxLength={8}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm font-mono font-bold tracking-[0.1em] focus:border-emerald-600 outline-none bg-white/50"
                                    placeholder="********"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Username</label>
                             <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input 
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm font-medium focus:border-emerald-600 outline-none bg-white/50"
                                    placeholder="Username / NIS / NIP"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input 
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm font-medium focus:border-emerald-600 outline-none bg-white/50"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Login <ArrowRight size={16} /></>}
                        </button>
                    </form>
                </div>
            </div>
             <button onClick={onBackToLanding} className="mt-8 text-xs font-bold text-slate-500 uppercase flex items-center gap-2 hover:text-slate-800">
               <ArrowLeft size={14}/> Kembali ke Beranda
             </button>
        </div>
    </div>
  );
};

export default LoginPage;
