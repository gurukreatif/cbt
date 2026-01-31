
import React, { useState } from 'react';
import { Menu, User, ChevronDown, LogOut, Settings, CreditCard } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface HeaderProps {
  onMenuToggle: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  user: any;
  schoolName?: string;
  quotaRemaining?: number | null;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, onLogout, onNavigate, user, schoolName, quotaRemaining }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    onLogout();
  };

  const handleAction = (path: string) => {
    setIsUserMenuOpen(false);
    onNavigate(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#065f46] text-white z-50 flex items-center px-4 md:px-6 border-b border-[#064e3b] shadow-sm gov-pattern-header">
      <button 
        onClick={onMenuToggle}
        className="mr-3 md:mr-4 p-1.5 md:p-2 hover:bg-[#064e3b] border border-white/10 rounded-sm transition-colors md:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-3 md:gap-4">
        <img 
          src={LOGO_URL} 
          alt="Logo" 
          className="w-8 h-8 md:w-9 md:h-9 object-contain logo-inverse" 
        />
        <div>
          <h1 className="text-[11px] md:text-sm font-black tracking-widest uppercase text-white leading-tight">
            {schoolName || "Emes CBT"}
          </h1>
          <p className="text-[9px] text-emerald-300/80 font-semibold uppercase tracking-wider leading-tight">Aplikasi CBT</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {quotaRemaining !== null && typeof quotaRemaining !== 'undefined' && (
          <div className="hidden lg:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-sm border border-white/20">
            <CreditCard size={14} className="text-emerald-300" />
            <span className="text-xs font-bold text-white">Kuota: {quotaRemaining}</span>
          </div>
        )}
        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 md:gap-3 p-1 md:p-1.5 md:pr-3 hover:bg-white/10 rounded-sm border border-transparent transition-all"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-sm bg-[#022c22]/50 border border-white/10 flex items-center justify-center">
              <User size={12} className="text-emerald-300" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter leading-none mb-0.5">{user?.jabatan || 'Pengguna'}</p>
              <p className="text-[11px] font-bold text-white leading-none">{user?.nama || 'Tanpa Nama'}</p>
            </div>
            <ChevronDown size={10} className={`text-emerald-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 md:w-56 bg-white rounded-lg shadow-2xl py-1.5 text-gray-700 border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Login ID</p>
                <p className="text-[10px] font-bold text-gray-600 truncate">{user?.username || user?.nip || user?.nis || 'User'}</p>
              </div>
              <button 
                onClick={() => handleAction('/profil-user')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight"
              >
                <User size={13} className="text-gray-400" /> Profil Saya
              </button>
              <button 
                onClick={() => handleAction('/pengaturan')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight"
              >
                <Settings size={13} className="text-gray-400" /> Pengaturan
              </button>
              <div className="my-1 border-t border-gray-50"></div>
              <button 
                onClick={handleLogoutClick}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
              >
                <LogOut size={13} /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;