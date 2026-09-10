import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FlaskConical,
  Users,
  Brain,
  FileSignature,
  Calendar,
  CheckSquare,
  Folder,
  MessageSquare,
  BarChart3,
  LifeBuoy,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Role } from '@/types';
import logoImg from '@/assets/logo.png';

export type NavKey =
  | 'dashboard'
  | 'studies'
  | 'participants'
  | 'screening'
  | 'consent'
  | 'visits'
  | 'tasks'
  | 'documents'
  | 'messages'
  | 'reports';

interface NavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
}

const researcherNav: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'studies', label: 'Studies', icon: FlaskConical },
  { key: 'participants', label: 'Participants', icon: Users },
  { key: 'screening', label: 'Screening', icon: Brain },
  { key: 'consent', label: 'Consent', icon: FileSignature },
  { key: 'visits', label: 'Visits', icon: Calendar },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare },
  { key: 'documents', label: 'Documents', icon: Folder },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
];

const participantNav: NavItem[] = [
  { key: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { key: 'visits', label: 'My Visits', icon: Calendar },
  { key: 'documents', label: 'Documents', icon: Folder },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
];

interface SidebarProps {
  current: NavKey;
  onNavigate: (key: NavKey) => void;
  role: Role;
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  current,
  onNavigate,
  role,
  open,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navItems = role === 'participant' ? participantNav : researcherNav;
  const roleLabel: Record<Role, string> = {
    admin: 'Administrator',
    principal_investigator: 'Principal Investigator',
    research_coordinator: 'Research Coordinator',
    sponsor: 'Sponsor',
    participant: 'Participant',
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col bg-black text-white border-r border-zinc-800 sidebar-transition lg:translate-x-0',
          collapsed ? 'w-20' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Floating docked arrow toggle button for desktop (single clean arrow on border) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex absolute -right-3 top-5 z-50 h-6 w-6 items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 shadow-md hover:bg-zinc-800 hover:text-white transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        {/* Logo & Brand Header */}
        <div
          className={cn(
            'flex items-center border-b border-zinc-800/90 py-4 transition-all duration-300',
            collapsed ? 'justify-center px-3' : 'justify-between px-4'
          )}
        >
          <div
            onClick={collapsed ? onToggleCollapse : undefined}
            className={cn(
              'flex items-center gap-3 overflow-hidden',
              collapsed && 'cursor-pointer'
            )}
            title={collapsed ? 'Click to expand sidebar' : undefined}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black border border-zinc-800 p-0.5 overflow-hidden shadow-inner">
              <img
                src={logoImg}
                alt="TrialBridge Logo"
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-base font-bold tracking-tight text-white">TrialBridge</h1>
                <p className="truncate text-[10px] text-zinc-400 font-medium">Clinical Research Platform</p>
              </div>
            )}
          </div>

          {/* Mobile close arrow button */}
          <button
            onClick={onClose}
            title="Close sidebar"
            aria-label="Close sidebar"
            className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {!collapsed && (
            <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Menu
            </p>
          )}
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = current === item.key;
              return (
                <li key={item.key}>
                  <button
                    onClick={() => {
                      onNavigate(item.key);
                      onClose();
                    }}
                    title={item.label}
                    className={cn(
                      'group relative flex w-full items-center rounded-xl text-sm font-medium transition-all duration-200',
                      collapsed
                        ? 'justify-center p-2.5'
                        : 'gap-3 px-3 py-2.5',
                      isActive
                        ? 'bg-zinc-800/90 text-white shadow-sm border border-zinc-700/60'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'shrink-0 transition-colors',
                        collapsed ? 'h-5 w-5' : 'h-4.5 w-4.5',
                        isActive ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-200'
                      )}
                      style={{
                        width: collapsed ? '1.25rem' : '1.125rem',
                        height: collapsed ? '1.25rem' : '1.125rem',
                      }}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className={cn(
                          'rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]',
                          collapsed
                            ? 'absolute right-1 top-1 h-2 w-2'
                            : 'ml-auto h-1.5 w-1.5'
                        )}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {!collapsed && (
            <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Support
            </p>
          )}
          <ul className={cn('space-y-1', collapsed && 'pt-4 border-t border-zinc-800/80 mt-2')}>
            <li>
              <button
                title="Help & Support"
                className={cn(
                  'group flex w-full items-center rounded-xl text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                )}
              >
                <LifeBuoy
                  className="h-4.5 w-4.5 text-zinc-400 group-hover:text-zinc-200"
                  style={{ width: '1.125rem', height: '1.125rem' }}
                />
                {!collapsed && <span>Help & Support</span>}
              </button>
            </li>
            <li>
              <button
                title="Settings"
                className={cn(
                  'group flex w-full items-center rounded-xl text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                )}
              >
                <Settings
                  className="h-4.5 w-4.5 text-zinc-400 group-hover:text-zinc-200"
                  style={{ width: '1.125rem', height: '1.125rem' }}
                />
                {!collapsed && <span>Settings</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="border-t border-zinc-800/90 p-3 bg-black">
          <div
            className={cn(
              'flex items-center rounded-xl py-2 cursor-pointer transition-colors hover:bg-zinc-900',
              collapsed ? 'justify-center px-1' : 'gap-3 px-3'
            )}
            title="Sarah Chen"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-semibold text-white shadow-sm">
              SC
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">Sarah Chen</p>
                  <p className="truncate text-xs text-zinc-400">{roleLabel[role]}</p>
                </div>
                <HelpCircle className="h-4 w-4 text-zinc-500" />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
