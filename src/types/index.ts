export interface HealthStatus {
  status: string;
  [key: string]: unknown;
}

export interface Patient {
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  blood_type?: string;
  allergies?: string;
  medical_history?: string;
  emergency_contact?: string;
  created_at?: string;
}

export interface ClinicalData {
  encounter_id: number;
  patient_id: number;
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
  temperature?: number;
  symptoms?: string;
  chief_complaint?: string;
  timestamp?: string;
}

export interface RiskAssessment {
  assessment_id: number;
  encounter_id: number;
  patient_id: number;
  risk_score: number;
  risk_level: string;
  priority_score: number;
  priority_level: string;
  explanation: string;
}

export interface PriorityQueueItem {
  encounter_id: number;
  patient_id: number;
  patient_name: string;
  risk_level: string;
  risk_score: number;
  priority_level: string;
  priority_score: number;
  explanation: string;
}

export interface Treatment {
  treatment_id: string;
  encounter_id: number;
  patient_id: number;
  patient_name: string;
  priority_level: string;
  priority_score: number;
  risk_level: string;
  risk_score: number;
  explanation: string;
  status: 'active' | 'completed';
  started_at: string;
  completed_at: string | null;
  treatment_notes: string;
  outcome: string | null;
}

export type Page =
  | 'landing'
  | 'dashboard'
  | 'patients'
  | 'patient-detail'
  | 'queue'
  | 'ai-assessment'
  | 'reports'
  | 'treatment'
  | 'system-status';
