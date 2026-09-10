import { useState, useEffect } from 'react';
import { TrialBridgeProvider } from '@/store/TrialBridgeContext';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { Sidebar, type NavKey } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AdminDashboard } from '@/pages/dashboards/AdminDashboard';
import { PrincipalInvestigatorDashboard } from '@/pages/dashboards/PrincipalInvestigatorDashboard';
import { ResearchCoordinatorDashboard } from '@/pages/dashboards/ResearchCoordinatorDashboard';
import { SponsorDashboard } from '@/pages/dashboards/SponsorDashboard';
import { ParticipantPortal } from '@/pages/dashboards/ParticipantPortal';
import { LoginPage } from '@/pages/LoginPage';
import { StudiesPage } from '@/pages/StudiesPage';
import { ParticipantsPage } from '@/pages/ParticipantsPage';
import { ScreeningPage } from '@/pages/ScreeningPage';
import { ConsentPage } from '@/pages/ConsentPage';
import { VisitsPage } from '@/pages/VisitsPage';
import { TasksPage } from '@/pages/TasksPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SimulationLabPage } from '@/pages/SimulationLabPage';
import { EligibilityReviewsPage } from '@/pages/EligibilityReviewsPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';
import { OrganizationsPage } from '@/pages/OrganizationsPage';
import { UsersManagementPage } from '@/pages/UsersManagementPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { Toaster } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function AppContent() {
  const { role, isAuthenticated, isLoading } = useAuth();
  const [currentNav, setCurrentNav] = useState<NavKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Reset to dashboard when role changes
  useEffect(() => {
    setCurrentNav(role === 'PARTICIPANT' ? 'home' : 'dashboard');
  }, [role]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderDashboard = () => {
    switch (role) {
      case 'PLATFORM_ADMIN': return <AdminDashboard />;
      case 'ORGANIZATION': return <SponsorDashboard />;
      case 'PRINCIPAL_INVESTIGATOR': return <PrincipalInvestigatorDashboard onNavigate={setCurrentNav} />;
      case 'RESEARCH_COORDINATOR': return <ResearchCoordinatorDashboard onNavigate={setCurrentNav} />;
      case 'PARTICIPANT': return <ParticipantPortal onNavigate={setCurrentNav} />;
      default: return <AdminDashboard />;
    }
  };

  const renderPage = () => {
    if (currentNav === 'dashboard' || currentNav === 'home') return renderDashboard();

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
      // Real Pages
      case 'organizations': return <OrganizationsPage />;
      case 'users': return <UsersManagementPage />;
      case 'platform-studies': return <StudiesPage />;
      case 'system-activity': return <AuditLogsPage />;
      case 'audit-logs': return <AuditLogsPage />;
      case 'security': return <PlaceholderPage title="Security & Compliance" description="SOC2, HIPAA, and 21 CFR Part 11 security settings." />;
      case 'support': return <PlaceholderPage title="Support & Helpdesk" description="Platform ticketing and researcher support." />;
      case 'research-sites': return <OrganizationsPage />;
      case 'team': return <UsersManagementPage />;
      case 'analytics': return <ReportsPage />;
      case 'my-studies': return <StudiesPage />;
      case 'eligibility-reviews': return <EligibilityReviewsPage />;
      case 'protocol': return <StudiesPage />;
      case 'study-visits': return <VisitsPage />;
      case 'simulation-lab': 
        return (role === 'PRINCIPAL_INVESTIGATOR' || role === 'RESEARCH_COORDINATOR') 
          ? <SimulationLabPage /> 
          : <PlaceholderPage title="Access Restricted" description="3D Simulation Lab & Molecular Workbench is restricted strictly to Principal Investigators and Researchers." />;
      case 'follow-ups': return <VisitsPage />;
      case 'my-appointments': return <VisitsPage />;
      case 'my-consent': return <ConsentPage />;
      case 'my-documents': return <DocumentsPage />;
      case 'notifications': return <PlaceholderPage title="Notifications" description="View system and study notifications." />;
      case 'profile': return <PlaceholderPage title="User Profile" description="Manage your credentials and preferences." />;
      case 'help': return <PlaceholderPage title="Help & FAQs" description="Participant guide and contact information." />;
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TrialBridgeProvider>
          <AppContent />
        </TrialBridgeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
