import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, Doctor, ClinicalRecord, NotificationToast, AiAssessment } from '../types';
import { patientService } from '../services/api/patientService';
import { doctorService } from '../services/api/doctorService';
import { aiService } from '../services/api/aiService';
import { treatmentService } from '../services/api/treatmentService';
import { workflowService } from '../services/api/workflowService';
import { systemService } from '../services/api/systemService';
import { resetStoredData, getStoredDoctors } from '../services/storageService';

interface AppContextType {
  patients: Patient[];
  doctors: Doctor[];
  loading: boolean;
  toasts: NotificationToast[];
  addPatient: (data: Omit<Patient, 'id' | 'registeredAt' | 'waitingTimeMinutes' | 'treatmentStatus' | 'clinicalRecords' | 'reports'>) => Promise<Patient>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<Patient>;
  deletePatient: (id: string) => Promise<void>;
  addClinicalRecord: (patientId: string, record: Omit<ClinicalRecord, 'id' | 'patientId'>) => Promise<Patient>;
  assignDoctor: (patientId: string, doctorId: string) => Promise<void>;
  startTreatment: (patientId: string, encounterId?: number | string) => Promise<void>;
  completeTreatment: (patientId: string, notes?: string, encounterId?: number | string) => Promise<void>;
  runAssessment: (patientId: string) => Promise<AiAssessment>;
  showToast: (title: string, message: string, type?: NotificationToast['type']) => void;
  removeToast: (id: string) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('[AppContext] Calling patientService.getPatients()...');
      const pData = await patientService.getPatients();
      const dData = await doctorService.getDoctors();
      console.log('[AppContext] Loaded patients count:', pData.length, pData.map((p) => p.name).join(', '));
      setPatients(pData);
      setDoctors(dData);
    } catch (err) {
      console.error('[AppContext] Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (title: string, message: string, type: NotificationToast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: NotificationToast = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddPatient = async (
    data: Omit<Patient, 'id' | 'registeredAt' | 'waitingTimeMinutes' | 'treatmentStatus' | 'clinicalRecords' | 'reports'>
  ): Promise<Patient> => {
    const newPatient = await patientService.addPatient(data);
    setPatients((prev) => [newPatient, ...prev]);
    await loadData();
    showToast(
      'Patient Registered',
      `Patient ${newPatient.name} (${newPatient.id}) registered in active frontend records.`,
      'success'
    );
    return newPatient;
  };

  const handleUpdatePatient = async (id: string, data: Partial<Patient>): Promise<Patient> => {
    const updated = await patientService.updatePatient(id, data);
    setPatients((prev) =>
      prev.map((p) => (p.id === id || p.id.replace(/\D/g, '') === id.replace(/\D/g, '') ? updated : p))
    );
    await loadData();
    showToast('Patient Information Updated', `Records for ${updated.name} updated in active frontend session.`, 'success');
    return updated;
  };

  const handleDeletePatient = async (id: string): Promise<void> => {
    const patientToDelete = patients.find((p) => p.id === id);
    await patientService.deletePatient(id);
    setPatients((prev) => prev.filter((p) => p.id !== id && p.id.replace(/\D/g, '') !== id.replace(/\D/g, '')));
    await loadData();
    showToast(
      'Patient Removed',
      `Patient ${patientToDelete?.name || id} (${id}) has been removed from active frontend records.`,
      'warning'
    );
  };

  const handleAddClinicalRecord = async (
    patientId: string,
    record: Omit<ClinicalRecord, 'id' | 'patientId'>
  ): Promise<Patient> => {
    const updated = await patientService.addClinicalRecord(patientId, record);
    await loadData();
    showToast('Clinical Record Added', `New clinical visit record saved for ${updated.name}.`, 'success');
    return updated;
  };

  const handleAssignDoctor = async (patientId: string, doctorId: string) => {
    try {
      const res = await doctorService.assignDoctor(patientId, doctorId);
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId || p.id.replace(/\D/g, '') === patientId.replace(/\D/g, '')
            ? { ...p, assignedDoctor: res.doctor.name, assignedDoctorId: res.doctor.id }
            : p
        )
      );
      await loadData();
      showToast(
        'Doctor Assigned',
        `${res.doctor.name} assigned to ${res.patient.name}.`,
        'success'
      );
    } catch (err: any) {
      showToast(
        'Assignment Blocked',
        err.message || 'Doctor is currently assigned to another active patient.',
        'warning'
      );
      throw err;
    }
  };

  const handleStartTreatment = async (patientId: string, encounterId?: number | string) => {
    const updated = await treatmentService.startTreatment(patientId, encounterId);
    await loadData();
    showToast(
      'Treatment Started',
      `Treatment initiated for ${updated.name}. Status updated to In Progress.`,
      'info'
    );
  };

  const handleCompleteTreatment = async (patientId: string, notes?: string, encounterId?: number | string) => {
    const updated = await treatmentService.completeTreatment(patientId, notes, encounterId);
    await loadData();
    showToast(
      'Treatment Completed',
      `${updated.name}'s treatment has been completed and logged to clinical history.`,
      'success'
    );
  };

  const handleRunAssessment = async (patientId: string): Promise<AiAssessment> => {
    const assessment = await aiService.runAssessment(patientId);
    await loadData();
    if (assessment.priority === 'CRITICAL') {
      showToast(
        'Critical Risk Alert',
        `${assessment.patientName} classified as CRITICAL (Score ${assessment.riskScore}/100) and added to Emergency Priority Queue!`,
        'error'
      );
    } else if (assessment.priority === 'HIGH') {
      showToast(
        'High Risk Alert',
        `${assessment.patientName} classified as HIGH risk (Score ${assessment.riskScore}/100) and added to Priority Queue.`,
        'warning'
      );
    } else if (assessment.priority === 'MODERATE') {
      showToast(
        'Moderate Risk Assessment',
        `${assessment.patientName} assigned MODERATE risk score (${assessment.riskScore}/100). Placed under clinical observation.`,
        'info'
      );
    } else {
      showToast(
        'AI Assessment Complete',
        `${assessment.patientName} classified as LOW risk (${assessment.riskScore}/100). Routine monitoring advised.`,
        'info'
      );
    }
    return assessment;
  };

  const resetDemoData = async () => {
    try {
      await systemService.resetDemo();
    } catch (e) {
      console.warn('Backend reset-demo failed or unavailable, resetting local storage:', e);
    }
    resetStoredData();
    sessionStorage.clear();
    await loadData();
    showToast('Demo Data Reset', 'MediQueue baseline dataset restored to original state.', 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        patients,
        doctors,
        loading,
        toasts,
        addPatient: handleAddPatient,
        updatePatient: handleUpdatePatient,
        deletePatient: handleDeletePatient,
        addClinicalRecord: handleAddClinicalRecord,
        assignDoctor: handleAssignDoctor,
        startTreatment: handleStartTreatment,
        completeTreatment: handleCompleteTreatment,
        runAssessment: handleRunAssessment,
        showToast,
        removeToast,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
