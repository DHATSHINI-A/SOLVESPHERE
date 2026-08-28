import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import {
  Sparkles,
  Search,
  Bell,
  PlusCircle,
  LogOut,
  X,
  UserCheck,
  GraduationCap,
  Building2,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    isAuthenticated,
    role,
    user,
    logout,
    notifications,
    unreadCount,
    clearNotification,
    markAsRead,
  } = useAuth();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/problems?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleMeta: Record<Role, { label: string; icon: React.ReactNode; bg: string }> = {
    citizen: {
      label: 'Citizen / NGO',
      icon: <UserCheck className="w-3.5 h-3.5 text-amber-400" />,
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    },
    university: {
      label: 'University R&D',
      icon: <GraduationCap className="w-3.5 h-3.5 text-sky-400" />,
      bg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
    },
    industry: {
      label: 'Industry Sponsor',
      icon: <Building2 className="w-3.5 h-3.5 text-indigo-400" />,
      bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
    },
    admin: {
      label: 'Admin Governance',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    },
    guest: {
      label: 'Guest Visitor',
      icon: <UserCheck className="w-3.5 h-3.5 text-slate-400" />,
      bg: 'bg-slate-500/15 border-slate-500/30 text-slate-300',
    },
  };

  const activeRoleBadge = roleMeta[role] || roleMeta.citizen;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand & Sidebar Toggle */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && isAuthenticated && (
              <button
                onClick={onToggleSidebar}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition md:hidden cursor-pointer"
                title="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-lg tracking-tight font-heading block text-white">
                  SolutionHub
                </span>
                <span className="text-[9px] text-orange-400 font-bold tracking-widest uppercase block">
                  Problem–Partner Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Global Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verified problems, expertise tags, or research labs..."
                className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>
          </form>

          {/* Right Action Menu */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Submit Problem Action */}
            <Link to="/problems/new">
              <Button
                variant="accent"
                size="sm"
                icon={<PlusCircle className="w-3.5 h-3.5" />}
                className="shadow-sm"
              >
                <span className="hidden sm:inline">Submit Problem</span>
                <span className="sm:hidden">Submit</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                {/* Active Role Indicator Badge (Role Locked to Current Session) */}
                <div
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${activeRoleBadge.bg}`}
                  title={`Logged in as ${activeRoleBadge.label}. Sign out to switch roles.`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {activeRoleBadge.icon}
                  <span>{activeRoleBadge.label}</span>
                </div>

                {/* Notifications Bell */}
                <div className="relative" ref={notifMenuRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF5722] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50">
                        <span className="text-xs font-bold text-slate-900">
                          Notifications ({notifications.length})
                        </span>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No active notifications
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markAsRead(n.id)}
                              className={`p-3.5 transition flex items-start justify-between gap-2 hover:bg-slate-50 cursor-pointer ${
                                !n.read ? 'bg-indigo-50/40' : ''
                              }`}
                            >
                              <div>
                                <h5 className="text-xs font-bold text-slate-900">{n.title}</h5>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                  {n.message}
                                </p>
                                <span className="text-[9px] text-slate-400 mt-1 block">
                                  {n.timestamp}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearNotification(n.id);
                                }}
                                className="text-slate-300 hover:text-slate-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar / Profile Link */}
                <Link to="/profile" className="flex items-center gap-2 pl-1 group" title="View Profile">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                    alt={user?.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-orange-500 transition"
                  />
                </Link>

                {/* Explicit Sign Out Button to Switch Role */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/70 border border-slate-700 hover:border-rose-500/50 text-xs font-semibold text-slate-300 hover:text-rose-300 transition cursor-pointer"
                  title="Sign out to switch role or account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="accent" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
