import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MapPin,
  BarChart3,
  Bell,
  User,
  Settings,
  LogOut,
  Building2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const citizenNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/report', icon: PlusCircle, label: 'Lodge Grievance' },
    { to: '/my-complaints', icon: FileText, label: 'Track Complaints' },
    { to: '/map', icon: MapPin, label: 'National Civic Map' },
    { to: '/analytics', icon: BarChart3, label: 'Public Analytics' },
    { to: '/notifications', icon: Bell, label: 'Alerts & Notices' },
    { to: '/profile', icon: User, label: 'My Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const adminNav = [
    { to: '/admin', icon: LayoutDashboard, label: 'Admin Console' },
    { to: '/admin/complaints', icon: FileText, label: 'Complaints Hub' },
    { to: '/admin/duplicates', icon: Layers, label: 'Duplicate Groups' },
    { to: '/admin/risk-heatmap', icon: Flame, label: 'Civic Risk Heatmap' },
    { to: '/admin/escalations', icon: AlertTriangle, label: 'SLA Escalations' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/map', icon: MapPin, label: 'National Map' },
    { to: '/analytics', icon: BarChart3, label: 'Deep Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const departmentNav = [
    { to: '/department', icon: LayoutDashboard, label: 'Department Queue' },
    { to: '/department/assigned', icon: FileText, label: 'Assigned Works' },
    { to: '/map', icon: MapPin, label: 'Jurisdiction Map' },
    { to: '/notifications', icon: Bell, label: 'Alerts' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const navItems =
    user?.role === 'admin'
      ? adminNav
      : user?.role === 'department'
      ? departmentNav
      : citizenNav;

  return (
    <aside className="w-[235px] flex-shrink-0 bg-[#0F2942] text-white flex flex-col justify-between h-screen sticky top-0 select-none z-20 shadow-gov-md">
      <div>
        {/* Brand Logo Header - National Portal Style */}
        <div className="p-5 pb-4 border-b border-slate-700/60 bg-[#0A1C2E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#E65100] to-[#FF9800] flex items-center justify-center text-white font-black text-xl shadow-xs">
              सी
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-[16px] tracking-tight text-white">
                  CIVIC-<span className="text-[#FF9800]">सेवा</span>
                </span>
                <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded-sm border border-slate-700 ml-1">
                  GOV.IN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">National Grievance Portal</p>
            </div>
          </div>
        </div>

        {/* Role Badge if Staff */}
        {user?.role && user.role !== 'citizen' && (
          <div className="px-5 py-2.5 bg-slate-800/40 border-b border-slate-800">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-900/60 text-blue-200 uppercase tracking-wider border border-blue-700/50">
              <ShieldCheck className="w-3 h-3 text-[#FF9800]" /> {user.role} workspace
            </span>
          </div>
        )}

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard' || item.to === '/admin' || item.to === '/department'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#005A9C] text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner & User Session */}
      <div className="p-3 border-t border-slate-700/60 bg-[#0A1C2E] space-y-2.5">
        {/* National Emblem & Jurisdiction info */}
        <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs">🇮🇳</span>
            <span className="text-[11px] font-bold text-white">Government of India</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Integrated across 28 States, 8 UTs &amp; Urban Local Bodies.
          </p>
        </div>

        {/* User Card with Quick Logout */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 border border-slate-600">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Citizen'}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{user?.city || 'India'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
