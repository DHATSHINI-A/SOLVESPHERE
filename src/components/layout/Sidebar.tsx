import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  Kanban,
  Activity,
  FilePlus,
  ShieldCheck,
  GraduationCap,
  Building2,
  Settings,
  Award,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { role, user } = useAuth();
  const location = useLocation();

  // Role-specific primary navigation items
  const roleNavs: Record<string, NavItem[]> = {
    citizen: [
      { to: '/dashboard/citizen', label: 'My Submissions', icon: LayoutDashboard },
      { to: '/problems/new', label: 'Submit Problem', icon: FilePlus, highlight: true },
      { to: '/problems', label: 'Problem Directory', icon: Layers },
      { to: '/impact', label: 'Impact Dashboard', icon: Activity },
    ],
    university: [
      { to: '/dashboard/university', label: 'R&D Lab Dashboard', icon: GraduationCap },
      { to: '/problems', label: 'Matched Problems', icon: Sparkles },
      { to: '/collaboration/c1', label: 'Active Workspaces', icon: Kanban },
      { to: '/impact', label: 'Research Impact', icon: Award },
    ],
    industry: [
      { to: '/dashboard/industry', label: 'Corporate Portal', icon: Building2 },
      { to: '/problems', label: 'Sponsor Challenges', icon: Layers },
      { to: '/collaboration/c1', label: 'Deployment Pipeline', icon: Kanban },
      { to: '/impact', label: 'CSR & ROI Analytics', icon: Activity },
    ],
    admin: [
      { to: '/dashboard/admin', label: 'Admin Governance', icon: ShieldCheck },
      { to: '/problems', label: 'All Statements', icon: Layers },
      { to: '/impact', label: 'Platform Metrics', icon: Activity },
    ],
    guest: [
      { to: '/problems', label: 'Browse Problems', icon: Layers },
      { to: '/impact', label: 'Impact Dashboard', icon: Activity },
    ],
  };

  const currentNavItems = roleNavs[role] || roleNavs.citizen;

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 z-30 shrink-0 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Role Profile Strip */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="relative shrink-0">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
            alt="User"
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#1E2A5E]/10"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#1F9D55] border-2 border-white rounded-full" />
        </div>

        {!isCollapsed && (
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#1E2A5E] truncate">{user?.name}</h4>
            <span className="text-[10px] font-semibold text-[#FF6B4A] uppercase tracking-wider block capitalize">
              {role} Portal
            </span>
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•••' : 'Main Menu'}
        </p>

        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to) && item.to !== '/problems');

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-[#1E2A5E] text-white shadow-sm'
                  : item.highlight
                  ? 'bg-[#FF6B4A]/10 text-[#FF6B4A] hover:bg-[#FF6B4A]/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E2A5E]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-white' : item.highlight ? 'text-[#FF6B4A]' : 'text-slate-400 group-hover:text-[#1E2A5E]'
              }`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Global Explorer Navs */}
        <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
          <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '•••' : 'Ecosystem'}
          </p>

          <NavLink
            to="/problems"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive && location.pathname === '/problems' ? 'bg-[#1E2A5E] text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E2A5E]'
              }`
            }
          >
            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
            {!isCollapsed && <span>Problem Directory</span>}
          </NavLink>

          <NavLink
            to="/impact"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive ? 'bg-[#1E2A5E] text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E2A5E]'
              }`
            }
          >
            <Activity className="w-4 h-4 text-slate-400 shrink-0" />
            {!isCollapsed && <span>Public Impact Hub</span>}
          </NavLink>
        </div>
      </div>

      {/* Bottom Help & Settings */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-400 shrink-0" />
          {!isCollapsed && <span>Settings & Profile</span>}
        </NavLink>
      </div>
    </aside>
  );
};
