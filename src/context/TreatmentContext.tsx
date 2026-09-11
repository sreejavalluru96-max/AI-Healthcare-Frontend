import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Treatment, PriorityQueueItem } from '@/types';

interface TreatmentContextValue {
  activeTreatments: Treatment[];
  completedTreatments: Treatment[];
  startTreatment: (item: PriorityQueueItem) => void;
  completeTreatment: (treatmentId: string, outcome: string, notes: string) => void;
  isBeingTreated: (encounterId: number) => boolean;
  isCompleted: (encounterId: number) => boolean;
  removeFromTreatment: (treatmentId: string) => void;
}

const TreatmentContext = createContext<TreatmentContextValue | null>(null);

const STORAGE_KEY = 'mediqueue_treatments';

function loadFromStorage(): Treatment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Treatment[] : [];
  } catch {
    return [];
  }
}

function saveToStorage(treatments: Treatment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(treatments));
  } catch {
    // ignore
  }
}

export function TreatmentProvider({ children }: { children: ReactNode }) {
  const [treatments, setTreatments] = useState<Treatment[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(treatments);
  }, [treatments]);

  const startTreatment = useCallback((item: PriorityQueueItem) => {
    setTreatments((prev) => {
      if (prev.some((t) => t.encounter_id === item.encounter_id && t.status === 'active')) {
        return prev;
      }
      const newTreatment: Treatment = {
        treatment_id: `tr-${Date.now()}-${item.encounter_id}`,
        encounter_id: item.encounter_id,
        patient_id: item.patient_id,
        patient_name: item.patient_name,
        priority_level: item.priority_level,
        priority_score: item.priority_score,
        risk_level: item.risk_level,
        risk_score: item.risk_score,
        explanation: item.explanation,
        status: 'active',
        started_at: new Date().toISOString(),
        completed_at: null,
        treatment_notes: '',
        outcome: null,
      };
      return [newTreatment, ...prev];
    });
  }, []);

  const completeTreatment = useCallback((treatmentId: string, outcome: string, notes: string) => {
    setTreatments((prev) =>
      prev.map((t) =>
        t.treatment_id === treatmentId
          ? { ...t, status: 'completed' as const, completed_at: new Date().toISOString(), outcome, treatment_notes: notes }
          : t,
      ),
    );
  }, []);

  const removeFromTreatment = useCallback((treatmentId: string) => {
    setTreatments((prev) => prev.filter((t) => t.treatment_id !== treatmentId));
  }, []);

  const isBeingTreated = useCallback((encounterId: number) => {
    return treatments.some((t) => t.encounter_id === encounterId && t.status === 'active');
  }, [treatments]);

  const isCompleted = useCallback((encounterId: number) => {
    return treatments.some((t) => t.encounter_id === encounterId && t.status === 'completed');
  }, [treatments]);

  const activeTreatments = treatments.filter((t) => t.status === 'active');
  const completedTreatments = treatments.filter((t) => t.status === 'completed');

  return (
    <TreatmentContext.Provider
      value={{
        activeTreatments,
        completedTreatments,
        startTreatment,
        completeTreatment,
        isBeingTreated,
        isCompleted,
        removeFromTreatment,
      }}
    >
      {children}
    </TreatmentContext.Provider>
  );
}

export function useTreatments() {
  const ctx = useContext(TreatmentContext);
  if (!ctx) throw new Error('useTreatments must be used within TreatmentProvider');
  return ctx;
}
