import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types.ts';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  activePath: string;
  menuItems: MenuItem[];
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  isCollapsed, 
  activePath, 
  menuItems,
  onNavigate, 
  onLogout,
  onCloseMobile, 
  onToggleCollapse 
}) => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    // Auto-open parent menu of the active child path and close others
    const parentOfActive = menuItems.find(item => 
      item.children?.some(child => child.path === activePath)
    );
    if (parentOfActive) {
      setOpenMenus([parentOfActive.id]);
    } else {
      // If a top-level item is active, close all submenus
      setOpenMenus([]);
    }
  }, [activePath, menuItems]);

  const toggleMenu = (id: string) => {
    // Exclusive accordion: close others when one is opened
    setOpenMenus(prev => (prev.includes(id) ? [] : [id]));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 md:hidden transition-opacity backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed left-0 top-0 bottom-0 flex flex-col
        transition-all duration-300 ease-in-out border-r border-[#064e3b] bg-[#022c22]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 gov-pattern-sidebar !overflow-visible
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        z-40
      `}>
        {/* Branding Section */}
        <div className={`
            h-20 flex items-center border-b border-[#064e3b] shrink-0
            transition-all duration-300
            ${isCollapsed ? 'justify-center' : 'px-4 gap-3'}
        `}>
            <img src={LOGO_URL} alt="Logo" className="w-9 h-9 object-contain logo-inverse" />
            <div className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                <h1 className="text-sm font-black tracking-widest uppercase text-white">Emes CBT</h1>
                <p className="text-[9px] text-emerald-300/80 font-semibold uppercase">Aplikasi Ujian</p>
            </div>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="hidden md:flex absolute top-[81px] -translate-y-1/2 -right-3 w-6 h-6 bg-white border border-gray-300 rounded-full items-center justify-center text-[#064e3b] shadow-[0_2px_10px_rgba(0,0,0,0.15)] z-[100] transition-all hover:bg-emerald-50 hover:border-emerald-500 active:scale-90"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 scrollbar-thin overflow-x-hidden relative z-10">
          <nav className="space-y-0.5 px-3">
            {menuItems.map((item: MenuItem) => {
              const hasChildren = !!item.children;
              const isActive = hasChildren ? item.children.some(child => child.path === activePath) : activePath === item.path;
              const isParentActive = hasChildren && openMenus.includes(item.id);

              if (!hasChildren) {
                return (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.path); onCloseMobile(); }}
                    className={`
                      w-full flex items-center py-2.5 transition-all border
                      ${isActive ? 'bg-[#065f46] text-white border-[#064e3b] shadow-inner' : 'text-emerald-100/50 border-transparent hover:bg-[#064e3b]/50 hover:text-white'}
                      rounded-sm uppercase tracking-widest
                      ${isCollapsed ? 'px-0 justify-center' : 'px-4'}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-emerald-600'} ${isCollapsed ? 'm-0' : 'mr-3'}`}>
                      {React.cloneElement(item.icon as React.ReactElement<any>, { size: 16 })}
                    </span>
                    <span className={`text-[10px] font-bold whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`
                      w-full flex items-center py-2.5 transition-all border
                      ${isActive || isParentActive ? 'bg-[#065f46] text-white border-transparent' : 'text-emerald-100/50 border-transparent hover:bg-[#064e3b]/50 hover:text-white'}
                      rounded-sm uppercase tracking-widest
                      ${isCollapsed ? 'px-0 justify-center' : 'px-4'}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className={`transition-colors duration-200 ${isActive || isParentActive ? 'text-white' : 'text-emerald-600'} ${isCollapsed ? 'm-0' : 'mr-3'}`}>
                      {React.cloneElement(item.icon as React.ReactElement<any>, { size: 16 })}
                    </span>
                    <span className={`text-[10px] font-bold whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                      {item.label}
                    </span>
                    {!isCollapsed && <ChevronDown size={14} className={`ml-auto shrink-0 transition-transform duration-200 ${isParentActive ? 'rotate-180' : ''}`} />}
                  </button>
                  {isParentActive && !isCollapsed && (
                    <div className="pl-6 pt-1 pb-1 space-y-0.5 mt-0.5">
                      {item.children?.map(child => {
                        const isChildActive = activePath === child.path;
                        return (
                          <button
                            key={child.id}
                            onClick={() => { onNavigate(child.path); onCloseMobile(); }}
                            className={`w-full flex items-center py-2 px-3 rounded-sm transition-colors text-[9px] font-bold uppercase tracking-wider ${isChildActive ? 'text-white bg-emerald-700/70' : 'text-emerald-100/60 hover:text-white'}`}
                          >
                            {React.cloneElement(child.icon as React.ReactElement<any>, { size: 14, className: "mr-3 text-emerald-400" })}
                            <span>{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="bg-[#064e3b]/30 border-t border-[#064e3b] overflow-hidden relative z-10">
          <div className={`px-4 py-4 transition-all ${isCollapsed ? 'px-0 flex justify-center pb-4' : ''}`}>
            <div className={`p-2.5 bg-[#022c22]/50 rounded border border-[#064e3b] transition-all ${isCollapsed ? 'border-none bg-transparent' : ''}`}>
              {!isCollapsed && <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1 opacity-70">Sistem Konektivitas</p>}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.4)]"></div>
                {!isCollapsed && <span className="text-[9px] font-bold text-emerald-200 uppercase">TERHUBUNG</span>}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
