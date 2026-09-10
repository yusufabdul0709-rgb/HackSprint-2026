import { useState } from 'react';
import { Search, Bell, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/store/AuthContext';
import { cn } from '@/lib/utils';
import { NotificationPopover } from '@/components/notifications/NotificationPopover';
import type { Role } from '@/types';

interface HeaderProps {
  onMenuClick: () => void;
  onNavigate?: (key: any) => void;
}

const roleLabels: Record<Role, string> = {
  PLATFORM_ADMIN: 'Platform Admin',
  ORGANIZATION: 'Organization',
  PRINCIPAL_INVESTIGATOR: 'Principal Investigator',
  RESEARCH_COORDINATOR: 'Research Coordinator',
  PARTICIPANT: 'Participant',
};

const roleColors: Record<Role, string> = {
  PLATFORM_ADMIN: 'bg-blue-50 text-blue-700 border-blue-200',
  ORGANIZATION: 'bg-amber-50 text-amber-700 border-amber-200',
  PRINCIPAL_INVESTIGATOR: 'bg-purple-50 text-purple-700 border-purple-200',
  RESEARCH_COORDINATOR: 'bg-green-50 text-green-700 border-green-200',
  PARTICIPANT: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function Header({ onMenuClick, onNavigate }: HeaderProps) {
  const { user, logout, role } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const userName = user?.name || 'User';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-md lg:px-6">
      {/* Mobile open arrow button */}
      <button
        onClick={onMenuClick}
        aria-label="Open sidebar menu"
        title="Open navigation"
        className="flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search participants, studies, documents..."
          className="h-9 w-full max-w-md rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Real-time Notifications Popover */}
        <NotificationPopover
          onNavigateToNotifications={() => onNavigate && onNavigate('notifications')}
        />

        {/* User Profile Dropdown */}
        <div className="relative ml-2">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 border border-transparent hover:border-slate-200"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-semibold text-white">
              {getInitials(userName)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{userName}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
          </button>
          
          <AnimatePresence>
            {profileMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full z-20 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                    <p className="text-xs text-slate-500 truncate mb-2">{user?.email}</p>
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border', roleColors[role])}>
                      {roleLabels[role]}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setProfileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
