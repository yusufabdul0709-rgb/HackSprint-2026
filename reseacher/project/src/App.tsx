import { useState, useEffect } from 'react';
import { TrialBridgeProvider, useTrialBridge } from '@/store/TrialBridgeContext';
import { Sidebar, type NavKey } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AdminDashboard } from '@/pages/dashboards/AdminDashboard';
import { PrincipalInvestigatorDashboard } from '@/pages/dashboards/PrincipalInvestigatorDashboard';
import { ResearchCoordinatorDashboard } from '@/pages/dashboards/ResearchCoordinatorDashboard';
import { SponsorDashboard } from '@/pages/dashboards/SponsorDashboard';
import { ParticipantPortal } from '@/pages/dashboards/ParticipantPortal';
import { StudiesPage } from '@/pages/StudiesPage';
import { ParticipantsPage } from '@/pages/ParticipantsPage';
import { ScreeningPage } from '@/pages/ScreeningPage';
import { ConsentPage } from '@/pages/ConsentPage';
import { VisitsPage } from '@/pages/VisitsPage';
import { TasksPage } from '@/pages/TasksPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { Toaster } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

function AppContent() {
  const { role, setRole } = useTrialBridge();
  const [currentNav, setCurrentNav] = useState<NavKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Reset to dashboard when role changes
  useEffect(() => {
    setCurrentNav('dashboard');
  }, [role]);

  const renderDashboard = () => {
    switch (role) {
      case 'admin': return <AdminDashboard />;
      case 'principal_investigator': return <PrincipalInvestigatorDashboard />;
      case 'research_coordinator': return <ResearchCoordinatorDashboard />;
      case 'sponsor': return <SponsorDashboard />;
      case 'participant': return <ParticipantPortal onNavigate={setCurrentNav} />;
      default: return <AdminDashboard />;
    }
  };

  const renderPage = () => {
    if (currentNav === 'dashboard') return renderDashboard();

    // Participant sees limited pages
    if (role === 'participant') {
      switch (currentNav) {
        case 'studies': return <StudiesPage />;
        case 'visits': return <VisitsPage />;
        case 'documents': return <DocumentsPage />;
        case 'messages': return <MessagesPage />;
        default: return renderDashboard();
      }
    }

    switch (currentNav) {
      case 'studies': return <StudiesPage />;
      case 'participants': return <ParticipantsPage />;
      case 'screening': return <ScreeningPage />;
      case 'consent': return <ConsentPage />;
      case 'visits': return <VisitsPage />;
      case 'tasks': return <TasksPage />;
      case 'documents': return <DocumentsPage />;
      case 'messages': return <MessagesPage />;
      case 'reports': return <ReportsPage />;
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar
        current={currentNav}
        onNavigate={setCurrentNav}
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64')}>
        <Header
          role={role}
          onRoleChange={setRole}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${role}-${currentNav}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <TrialBridgeProvider>
      <AppContent />
    </TrialBridgeProvider>
  );
}
