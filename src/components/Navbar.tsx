import React, { useState } from 'react';
import { Film, User as UserIcon, Shield, ChevronDown, LogOut, Terminal, Ticket, BarChart3, Clapperboard, Calendar } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'movies' | 'schedule' | 'tickets' | 'admin' | 'api';
  setActiveTab: (tab: 'movies' | 'schedule' | 'tickets' | 'admin' | 'api') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSwitchUser: (userId: string) => void;
  allUsers: User[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onSwitchUser,
  allUsers,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#090a0f]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('movies')}
          className="flex items-center gap-2.5 text-left text-white whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-slate-950 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
              CineVerse
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-widest text-amber-400/80">
              Cinema & Multiplex
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line, subtle hover) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'movies' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            <span>Movies</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'schedule' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Showtimes</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'tickets' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My Tickets</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'admin' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Admin Portal</span>
            {currentUser?.role === 'admin' && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Admin
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'api' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>API Inspector</span>
          </button>
        </nav>

        {/* Zone 3: User Account / Fast Role Switcher */}
        <div className="flex items-center gap-3 shrink-0 relative">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 transition-all text-left"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-700 text-white'
                }`}>
                  {currentUser.role === 'admin' ? <Shield className="w-4 h-4" /> : currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User switcher dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      Role: {currentUser.role}
                    </div>
                  </div>

                  <div className="py-2">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Quick Role Switch:
                    </div>
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          u.id === currentUser.id ? 'bg-slate-800/80 text-amber-300 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">{u.role}</span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20 whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}

          {/* Mobile navigation toggle */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => setActiveTab(activeTab === 'movies' ? 'tickets' : 'movies')}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <Ticket className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
