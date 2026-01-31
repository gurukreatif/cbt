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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('emes_cbt_user');
      const savedRole = localStorage.getItem('emes_cbt_role');
      if (savedUser && savedRole) {
        setCurrentUser(JSON.parse(savedUser));
        setUserRole(savedRole as UserRole);
      }
    } catch (error) {
      console.error("Gagal memuat sesi dari localStorage", error);
      localStorage.clear();
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const handleLoginSuccess = (user: any, role: UserRole) => {
    localStorage.setItem('emes_cbt_user', JSON.stringify(user));
    localStorage.setItem('emes_cbt_role', role);
    setCurrentUser(user);
    setUserRole(role);
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sesi ini?")) {
      const role = localStorage.getItem('emes_cbt_role');
      localStorage.removeItem('emes_cbt_user');
      localStorage.removeItem('emes_cbt_role');
      setCurrentUser(null);
      setUserRole(null);
      
      if (role === 'superadmin') window.location.href = '/superadmin';
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

  // Jika pengguna sudah login, tampilkan portal yang sesuai
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

  // Jika belum login, tentukan halaman berdasarkan URL
  const { pathname } = window.location;

  if (pathname.startsWith('/superadmin')) {
    return <SuperadminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (pathname.startsWith('/reseller')) {
    return <ResellerLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Halaman default (publik/sekolah)
  return <PublicPortal onLoginSuccess={handleLoginSuccess} />;
};

export default App;
