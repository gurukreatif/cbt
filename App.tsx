
import React, { useState, useEffect } from 'react';
import AdminPortal from './components/AdminPortal.tsx';
import StudentPortal from './components/StudentPortal.tsx';
import SuperadminPortal from './components/SuperadminPortal.tsx';
import ResellerPortal from './components/ResellerPortal.tsx';
import PublicPortal from './components/PublicPortal.tsx';
import SuperadminLogin from './components/SuperadminLogin.tsx';
import ResellerLogin from './components/ResellerLogin.tsx';
import { Loader2 } from 'lucide-react';
import { UserRole } from './types';
import { supabase } from './lib/supabase.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. PRIORITAS: Cek Sesi Native Supabase (Untuk Superadmin)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Verifikasi apakah user tersebut memang Superadmin di tabel publik
          const { data: profile } = await supabase
            .from('super_admins')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setCurrentUser({
              ...session.user,
              nama: profile.nama,
              username: 'superadmin',
              jabatan: 'Platform Owner'
            });
            setUserRole('super_admin');
            setIsInitializing(false);
            return;
          }
        }

        // 2. FALLBACK: Cek Sesi Manual (Untuk Sekolah & Siswa)
        const savedUser = localStorage.getItem('emes_cbt_user');
        const savedRole = localStorage.getItem('emes_cbt_role');
        if (savedUser && savedRole) {
          setCurrentUser(JSON.parse(savedUser));
          setUserRole(savedRole as UserRole);
        }
      } catch (error) {
        console.error("Gagal memuat sesi", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // Listen for Auth changes (Supabase Native)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setUserRole(null);
        localStorage.removeItem('emes_cbt_user');
        localStorage.removeItem('emes_cbt_role');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (user: any, role: UserRole) => {
    // Role super_admin ditangani oleh Supabase Session secara otomatis
    if (role !== 'super_admin') {
      localStorage.setItem('emes_cbt_user', JSON.stringify(user));
      localStorage.setItem('emes_cbt_role', role);
    }
    setCurrentUser(user);
    setUserRole(role);
  };

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      const role = userRole;
      
      // Logout dari Supabase Auth jika dia Superadmin
      if (role === 'super_admin') {
        await supabase.auth.signOut();
      }

      localStorage.removeItem('emes_cbt_user');
      localStorage.removeItem('emes_cbt_role');
      setCurrentUser(null);
      setUserRole(null);
      
      if (role === 'super_admin') window.location.href = '/superadmin';
      else if (role === 'reseller') window.location.href = '/reseller';
      else window.location.href = '/';
    }
  };
  
  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-100">
        <Loader2 className="animate-spin text-emerald-600" size={48}/>
      </div>
    );
  }

  if (currentUser && userRole) {
    switch (userRole) {
      case 'super_admin':
        return <SuperadminPortal user={currentUser} onLogout={handleLogout} />;
      case 'reseller':
        return <ResellerPortal user={currentUser} onLogout={handleLogout} />;
      case 'siswa':
        return <StudentPortal user={currentUser} onLogout={handleLogout} />;
      default:
        return <AdminPortal user={currentUser} role={userRole as any} onLogout={handleLogout} />;
    }
  }

  const { pathname } = window.location;
  if (pathname.startsWith('/superadmin')) {
    return <SuperadminLogin onLoginSuccess={handleLoginSuccess} />;
  }
  if (pathname.startsWith('/reseller')) {
    return <ResellerLogin onLoginSuccess={handleLoginSuccess} />;
  }
  return <PublicPortal onLoginSuccess={handleLoginSuccess} />;
};

export default App;
