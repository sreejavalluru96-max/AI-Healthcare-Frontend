import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { Home } from './pages/Home';
import { Patients } from './pages/Patients';
import { PatientDetails } from './pages/PatientDetails';
import { Reports } from './pages/Reports';
import { AiAssessmentPage } from './pages/AiAssessment';
import { PriorityQueue } from './pages/PriorityQueue';
import { Treatment } from './pages/Treatment';
import { SystemStatus } from './pages/SystemStatus';

import { SmoothScrollProvider } from './components/3d/SmoothScrollProvider';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <SmoothScrollProvider>
          <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/:id" element={<PatientDetails />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/ai-assessment" element={<AiAssessmentPage />} />
              <Route path="/priority-queue" element={<PriorityQueue />} />
              <Route path="/treatment" element={<Treatment />} />
              <Route path="/system-status" element={<SystemStatus />} />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </SmoothScrollProvider>
    </AppProvider>
    </BrowserRouter>
  );
};

export default App;
