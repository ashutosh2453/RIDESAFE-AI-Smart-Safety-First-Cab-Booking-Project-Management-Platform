import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  FolderKanban,
  CheckSquare,
  ShieldAlert,
  History,
  Users,
  PhoneCall,
  Bot,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Book a Ride', path: '/book-ride', icon: Car },
    { label: 'SmartMatch', path: '/smart-match', icon: Sparkles },
    { label: 'Trip Projects', path: '/projects', icon: FolderKanban },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Ride History', path: '/ride-history', icon: History },
    { label: 'Safety Center', path: '/safety', icon: ShieldAlert, highlight: true },
    { label: 'Drivers', path: '/drivers', icon: Users },
    { label: 'Trusted Contacts', path: '/trusted-contacts', icon: PhoneCall },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { label: 'My Profile', path: '/profile', icon: UserCheck },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 border-r border-slate-800 bg-[#0B132B] transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto px-4 py-6">
          <nav className="space-y-1.5">
            <p className="px-3 pb-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Platform Modules
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? item.highlight
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30 font-bold'
                          : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold'
                        : item.highlight
                        ? 'text-red-400/90 hover:bg-red-500/10'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className={`h-4 w-4 ${item.highlight ? 'text-red-400' : ''}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Prototype Safety Notice at bottom */}
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Student Prototype</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Fictional drivers & simulated routes. For life-threatening emergencies, always dial 112 directly.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
