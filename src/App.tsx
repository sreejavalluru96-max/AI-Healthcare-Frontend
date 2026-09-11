import { useState, useCallback } from 'react';
import type { Page } from '@/types';
import { TreatmentProvider } from '@/context/TreatmentContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Landing } from '@/pages/Landing';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { PatientDetail } from '@/pages/PatientDetail';
import { PriorityQueue } from '@/pages/PriorityQueue';
import { AIAssessment } from '@/pages/AIAssessment';
import { Reports } from '@/pages/Reports';
import { TreatmentPage } from '@/pages/Treatment';
import { SystemStatus } from '@/pages/SystemStatus';

interface NavState {
  page: Page;
  params: Record<string, unknown>;
}

function App() {
  const [nav, setNav] = useState<NavState>({ page: 'landing', params: {} });

  const navigate = useCallback((page: Page, params: Record<string, unknown> = {}) => {
    setNav({ page, params });
  }, []);

  if (nav.page === 'landing') {
    return <Landing onEnter={navigate} />;
  }

  const renderPage = () => {
    switch (nav.page) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'patients':
        return <Patients onNavigate={navigate} />;
      case 'patient-detail':
        return (
          <PatientDetail
            patientId={Number(nav.params.patientId)}
            onNavigate={navigate}
          />
        );
      case 'queue':
        return <PriorityQueue onNavigate={navigate} />;
      case 'ai-assessment':
        return (
          <AIAssessment
            initialEncounterId={
              nav.params.encounterId ? Number(nav.params.encounterId) : undefined
            }
            onNavigate={navigate}
          />
        );
      case 'reports':
        return <Reports onNavigate={navigate} />;
      case 'treatment':
        return <TreatmentPage onNavigate={navigate} />;
      case 'system-status':
        return <SystemStatus />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <TreatmentProvider>
      <AppLayout page={nav.page} onNavigate={navigate}>
        {renderPage()}
      </AppLayout>
    </TreatmentProvider>
  );
}

export default App;
