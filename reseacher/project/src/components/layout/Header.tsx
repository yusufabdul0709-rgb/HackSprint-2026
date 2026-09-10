import { useState } from 'react';
import { Search, Bell, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Role } from '@/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  role: Role;
  onRoleChange: (role: Role) => void;
  onMenuClick: () => void;
}

const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  principal_investigator: 'Principal Investigator',
  research_coordinator: 'Research Coordinator',
  sponsor: 'Sponsor',
  participant: 'Participant',
};

const roleColors: Record<Role, string> = {
  admin: 'bg-blue-50 text-blue-700',
  principal_investigator: 'bg-purple-50 text-purple-700',
  research_coordinator: 'bg-green-50 text-green-700',
  sponsor: 'bg-amber-50 text-amber-700',
  participant: 'bg-slate-100 text-slate-700',
};

export function Header({ role, onRoleChange, onMenuClick }: HeaderProps) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);


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
        {/* Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold', roleColors[role])}>
              DEMO
            </span>
            <span className="hidden sm:inline">{roleLabels[role]}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
          <AnimatePresence>
            {roleMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRoleMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-full z-20 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
                >
                  <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Role (Demo)
                  </p>
                  {(Object.keys(roleLabels) as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onRoleChange(r);
                        setRoleMenuOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors',
                        role === r ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {roleLabels[r]}
                      {role === r && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>


        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell className="h-4.5 w-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-semibold text-white">
            SC
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-slate-800">Sarah Chen</p>
            <p className="text-[11px] text-slate-500">{roleLabels[role]}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
