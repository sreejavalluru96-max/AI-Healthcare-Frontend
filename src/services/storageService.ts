import { Patient, Doctor } from '../types';
import { INITIAL_PATIENTS, INITIAL_DOCTORS } from './mockData';

const PATIENTS_STORAGE_KEY = 'mediqueue_patients_v2';
const DOCTORS_STORAGE_KEY = 'mediqueue_doctors_v2';
const DELETED_PATIENT_IDS_KEY = 'mediqueue_deleted_patient_ids_v1';
const ADDED_PATIENTS_STORAGE_KEY = 'mediqueue_added_patients_v1';

export const getDeletedPatientIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_PATIENT_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addDeletedPatientId = (id: string): void => {
  try {
    const current = getDeletedPatientIds();
    const cleanId = String(id).trim();
    const numericId = cleanId.replace(/\D/g, '');
    const idsToAdd = [
      cleanId,
      cleanId.toLowerCase(),
      cleanId.toUpperCase(),
      numericId,
      numericId ? `P${numericId.padStart(3, '0')}` : '',
      numericId ? numericId.padStart(3, '0') : '',
    ].filter(Boolean);
    const updated = Array.from(new Set([...current, ...idsToAdd]));
    localStorage.setItem(DELETED_PATIENT_IDS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving deleted patient ID:', error);
  }
};

export const getAddedPatients = (): Patient[] => {
  try {
    const raw = localStorage.getItem(ADDED_PATIENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveAddedPatient = (patient: Patient): void => {
  try {
    const current = getAddedPatients();
    const filtered = current.filter((p) => p.id !== patient.id);
    localStorage.setItem(ADDED_PATIENTS_STORAGE_KEY, JSON.stringify([patient, ...filtered]));
  } catch (error) {
    console.error('Error saving added patient:', error);
  }
};

export const updateAddedPatientStorage = (patient: Patient): void => {
  try {
    const current = getAddedPatients();
    const index = current.findIndex((p) => p.id === patient.id);
    if (index !== -1) {
      current[index] = patient;
      localStorage.setItem(ADDED_PATIENTS_STORAGE_KEY, JSON.stringify(current));
    }
  } catch (error) {
    console.error('Error updating added patient in storage:', error);
  }
};

export const getStoredPatients = (): Patient[] => {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error loading patients from localStorage:', error);
    return [];
  }
};

export const saveStoredPatients = (patients: Patient[]): void => {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (error) {
    console.error('Error saving patients to localStorage:', error);
  }
};

export const getStoredDoctors = (): Doctor[] => {
  try {
    const raw = localStorage.getItem(DOCTORS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(INITIAL_DOCTORS));
      return INITIAL_DOCTORS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error loading doctors from localStorage:', error);
    return INITIAL_DOCTORS;
  }
};

export const saveStoredDoctors = (doctors: Doctor[]): void => {
  try {
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
  } catch (error) {
    console.error('Error saving doctors to localStorage:', error);
  }
};

const TEMP_APPOINTMENTS_STORAGE_KEY = 'mediqueue_temp_appointments_v1';

export const getStoredAppointments = (): any[] => {
  try {
    const raw = localStorage.getItem(TEMP_APPOINTMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredAppointment = (appointment: any): void => {
  try {
    const current = getStoredAppointments();
    const updated = [appointment, ...current];
    localStorage.setItem(TEMP_APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving temporary appointment:', error);
  }
};

export const INITIAL_TREATMENT_OVERRIDES: Record<string, string> = {
  P001: 'WAITING',
  p001: 'WAITING',
  '1': 'WAITING',
  P002: 'WAITING',
  p002: 'WAITING',
  '2': 'WAITING',
  P004: 'WAITING',
  p004: 'WAITING',
  '4': 'WAITING',
  P003: 'COMPLETED',
  p003: 'COMPLETED',
  '3': 'COMPLETED',
};

export const resetStoredData = (): { patients: Patient[]; doctors: Doctor[] } => {
  localStorage.removeItem(PATIENTS_STORAGE_KEY);
  localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(INITIAL_DOCTORS));
  localStorage.removeItem(DELETED_PATIENT_IDS_KEY);
  localStorage.removeItem(ADDED_PATIENTS_STORAGE_KEY);
  localStorage.removeItem(TEMP_APPOINTMENTS_STORAGE_KEY);
  localStorage.setItem('mediqueue_treatment_page_overrides_v1', JSON.stringify(INITIAL_TREATMENT_OVERRIDES));
  return { patients: [], doctors: INITIAL_DOCTORS };
};
