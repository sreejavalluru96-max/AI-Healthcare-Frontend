export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'STABLE' | 'LOW';
export type TreatmentStatus = 'WAITING' | 'STARTING' | 'IN_PROGRESS' | 'COMPLETED' | 'OBSERVATION' | 'ROUTINE' | 'Completed' | 'In Treatment' | 'Waiting' | 'Open' | 'Cancelled' | 'Not Completed' | 'Not Available' | (string & {});
export type Gender = 'Male' | 'Female' | 'Other';
export type Department = 
  | 'Cardiology'
  | 'General Medicine'
  | 'Emergency'
  | 'Neurology'
  | 'Pulmonology'
  | 'Orthopedics'
  | 'Pediatrics';

export interface VitalSigns {
  heartRate: number; // bpm
  bloodPressure: string; // e.g. "170/105"
  systolicBP: number;
  diastolicBP: number;
  spO2: number; // %
  temperature: number; // °C
  respiratoryRate: number; // breaths/min
  bloodGlucose: number; // mg/dL
  measuredAt: string;
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  visitDate: string;
  doctorName: string;
  heartRate: number;
  bloodPressure: string;
  spO2: number;
  temperature: number;
  chiefComplaint: string;
  diagnosis: string;
  notes: string;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  reportName: string;
  date: string;
  type: 'Lab Test' | 'Imaging' | 'ECG' | 'Blood Work' | 'CT Scan' | 'Ultrasound';
  riskLevel: PriorityLevel;
  status: 'Final' | 'Pending Review' | 'Critical Alert';
  findings: string;
  summary: string;
  vitalsAtTest?: Partial<VitalSigns>;
}

export interface MedicationConsideration {
  medication: string;
  reason: string;
  caution: string;
  approvalRequired: boolean;
}

export interface GeneralCarePlan {
  possibleIssue: string;
  generalCare: string[];
  foodDiet: string[];
  hydration: string[];
  restLifestyle: string[];
  precautions: string[];
  whenToSeekMedicalAttention: string[];
  mockMedication?: MedicationConsideration;
  doctorReviewNotice: string;
}

export interface AiAssessment {
  id: string;
  patientId: string;
  patientName: string;
  riskScore: number; // 0 to 100
  riskLevel?: string;
  priority: PriorityLevel;
  assessedAt: string;
  riskFactors: string[];
  explanation: string;
  recommendedActions: string[];
  medicationConsiderations?: MedicationConsideration[];
  generalCarePlan?: GeneralCarePlan;
  status: 'Active' | 'Archived';
}

export interface Doctor {
  id: string;
  name: string;
  department: Department;
  specialization: string;
  availability: 'Available' | 'Busy' | 'On Call';
  currentPatients: number;
}

export interface TreatmentRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  priority: PriorityLevel;
  riskScore: number;
  department: Department;
  startTime: string;
  completionTime?: string;
  status: TreatmentStatus;
  notes: string;
  medications?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentWorkflowItem {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: Gender;
  department: Department;
  priority: PriorityLevel;
  riskScore: number;
  doctorId?: string;
  doctorName?: string;
  treatmentStatus: TreatmentStatus;
  startTime?: string;
  completedTime?: string;
  notes: string;
  vitalsSummary: {
    spO2: number;
    heartRate: number;
    bloodPressure: string;
  };
}

export interface Patient {
  id: string; // e.g. "P001"
  encounterId?: number;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  bloodGroup: string;
  department: Department;
  status: PriorityLevel;
  symptoms: string[];
  medicalHistory: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  vitals: VitalSigns;
  clinicalRecords: ClinicalRecord[];
  reports: MedicalReport[];
  latestAssessment?: AiAssessment;
  assessmentHistory?: AiAssessment[];
  assignedDoctor?: string; // Doctor name or ID
  assignedDoctorId?: string | number;
  treatmentStatus: TreatmentStatus;
  treatmentHistory?: TreatmentRecord[];
  waitingTimeMinutes: number;
  registeredAt: string;
  updatedAt?: string;
}

export interface NotificationToast {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
}
