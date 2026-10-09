import { apiFetch } from './apiClient';
import { getStoredAppointments, saveStoredAppointment } from '../storageService';

export interface WorkflowPatient {
  patient_id: number;
  name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  phone: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  created_at?: string;
}

export interface WorkflowAppointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  doctor_name?: string;
  specialization?: string;
  department_id: number;
  department_name?: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: string;
}

export interface WorkflowEncounter {
  encounter_id: number;
  patient_id: number;
  doctor_id?: number | null;
  department_id?: number | null;
  encounter_type: string;
  chief_complaint?: string;
  notes?: string;
  status: string;
  visit_date?: string;
}

export interface WorkflowSymptom {
  symptom_id?: number;
  encounter_id?: number;
  symptom_name: string;
  severity?: string;
  duration?: string;
}

export interface WorkflowVitals {
  vital_id?: number;
  encounter_id?: number;
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  temperature?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
  recorded_at?: string;
}

export interface WorkflowAiAssessment {
  assessment_id: number;
  encounter_id: number;
  patient_id: number;
  risk_score: number;
  risk_level: string;
  priority_score: number;
  priority_level: string;
  explanation: string;
  causes?: string;
  precautions?: string[];
  food_diet?: string[];
  medication_recommendation?: {
    medicine_name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
    reason?: string;
  } | null;
  model_name?: string;
  model_version?: string;
  created_at?: string;
}

export interface WorkflowDepartment {
  department_id: number;
  department_name: string;
  location?: string;
  doctor_count?: number;
}

export interface WorkflowDoctor {
  doctor_id: number;
  name: string;
  specialization: string;
  department_id: number;
  phone?: string;
  email?: string;
  license_number?: string;
}

export interface WorkflowPrescription {
  prescription_id?: number;
  encounter_id: number;
  doctor_id: number;
  doctor_name?: string;
  medicine_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface FullPatientWorkflowResponse {
  patient_id: number;
  patient_name: string;

  encounter_id: number;
  encounter_type: string;
  chief_complaint?: string;
  status: string;
  notes?: string;

  doctor_id?: number | null;
  doctor_name?: string | null;

  department_id?: number | null;
  department_name?: string | null;

  assessment_available: boolean;
  message?: string;

  risk_score?: number;
  risk_level?: string;
  priority_score?: number;
  priority_level?: string;
  explanation?: string;

  workflow?: string;
  appointment_required?: boolean;
  emergency?: boolean;
  treatment_type?: string;

  symptoms: WorkflowSymptom[];
  vitals: WorkflowVitals[];
  prescriptions: WorkflowPrescription[];
}

export const workflowService = {
  // 1. Get Patients
  getPatients: async (): Promise<WorkflowPatient[]> => {
    return apiFetch<WorkflowPatient[]>('/patients');
  },

  // Get Patient by ID
  getPatientById: async (patientId: number): Promise<WorkflowPatient> => {
    return apiFetch<WorkflowPatient>(`/patients/${patientId}`);
  },

  // Get Patient Appointments
  getPatientAppointments: async (patientId: number): Promise<WorkflowAppointment[]> => {
    let backendAppts: WorkflowAppointment[] = [];
    try {
      backendAppts = await apiFetch<WorkflowAppointment[]>(`/patients/${patientId}/appointments`);
    } catch {
      backendAppts = [];
    }
    const tempAppts = getStoredAppointments().filter(
      (a: any) => Number(a.patient_id) === Number(patientId)
    );
    return [...tempAppts, ...(backendAppts || [])];
  },

  // 2. Book Appointment (Temporary demo session)
  createAppointment: async (data: {
    patient_id: number;
    doctor_id: number;
    department_id: number;
    appointment_date: string;
    appointment_time: string;
    reason: string;
  }): Promise<{ message: string; appointment_id: number; status: string }> => {
    const newAppt: WorkflowAppointment = {
      appointment_id: Date.now(),
      patient_id: Number(data.patient_id),
      doctor_id: Number(data.doctor_id) || 1,
      doctor_name: 'Dr. Assigned Specialist',
      department_id: Number(data.department_id) || 1,
      department_name: 'Outpatient Department',
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      reason: data.reason || 'Routine consultation',
      status: 'Scheduled',
    };
    saveStoredAppointment(newAppt);
    return {
      message: 'Appointment booked temporarily in demo session',
      appointment_id: newAppt.appointment_id,
      status: 'Scheduled',
    };
  },

  // 3. Create Encounter (Temporary demo session)
  createEncounter: async (data: {
    patient_id: number;
    doctor_id?: number | null;
    department_id?: number | null;
    encounter_type: string;
    chief_complaint?: string;
    notes?: string;
    appointment_id?: number | null;
  }): Promise<{
    message: string;
    encounter_id: number;
    patient_id: number;
    status: string;
    encounter_type: string;
  }> => {
    return {
      message: 'Encounter created temporarily in demo session',
      encounter_id: Date.now(),
      patient_id: data.patient_id,
      status: 'Open',
      encounter_type: data.encounter_type,
    };
  },

  // 4. Add Symptoms (Temporary demo session)
  addSymptom: async (
    encounterId: number,
    symptom: { symptom_name: string; severity?: string; duration?: string }
  ): Promise<{ message: string; symptom_id: number }> => {
    return { message: 'Symptom added temporarily', symptom_id: Date.now() };
  },

  // 4. Add Vitals (Temporary demo session)
  addVitals: async (
    encounterId: number,
    vitals: {
      heart_rate?: number;
      systolic_bp?: number;
      diastolic_bp?: number;
      temperature?: number;
      oxygen_saturation?: number;
      respiratory_rate?: number;
    }
  ): Promise<{ message: string; vital_id: number }> => {
    return { message: 'Vitals added temporarily', vital_id: Date.now() };
  },

  // 5. Get AI Assessment
  getAiAssessment: async (encounterId: number): Promise<WorkflowAiAssessment> => {
    return apiFetch<WorkflowAiAssessment>(`/ai-assessment/${encounterId}`);
  },

  // Re-run AI Assessment
  refreshAiAssessment: async (encounterId: number): Promise<WorkflowAiAssessment> => {
    return apiFetch<WorkflowAiAssessment>(`/ai-assessment/${encounterId}`);
  },

  // 8. Get Departments
  getDepartments: async (): Promise<WorkflowDepartment[]> => {
    return apiFetch<WorkflowDepartment[]>('/departments');
  },

  // 8. Get Doctors by Department
  getDoctorsByDepartment: async (
    departmentId: number
  ): Promise<{ department_id: number; department_name: string; doctor_count: number; doctors: WorkflowDoctor[] }> => {
    return apiFetch(`/departments/${departmentId}/doctors`);
  },

  // 8. Assign Doctor & Department to Encounter
  assignDoctor: async (
    encounterId: number,
    data: { doctor_id: number; department_id: number }
  ): Promise<{
    message: string;
    encounter_id: number;
    doctor_id: number;
    department_id: number;
    doctor_name: string;
    specialization: string;
  }> => {
    return {
      message: 'Doctor assigned temporarily',
      encounter_id: encounterId,
      doctor_id: data.doctor_id,
      department_id: data.department_id,
      doctor_name: 'Assigned Doctor',
      specialization: 'General Specialist',
    };
  },

  // 9. Update Encounter Status (e.g. "In Treatment")
  updateEncounterStatus: async (
    encounterId: number,
    data: { status: string; notes?: string }
  ): Promise<{ message: string; encounter_id: number; status: string }> => {
    return { message: 'Encounter status updated temporarily', encounter_id: encounterId, status: data.status };
  },

  // 10. Create Prescription
  createPrescription: async (data: {
    encounter_id: number;
    doctor_id: number;
    medicine_name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }): Promise<{ message: string; prescription_id: number; doctor_name: string; medicine_name: string }> => {
    return {
      message: 'Prescription created temporarily',
      prescription_id: Date.now(),
      doctor_name: 'Attending Doctor',
      medicine_name: data.medicine_name,
    };
  },

  // 10. Get Prescriptions for Encounter
  getPrescriptions: async (encounterId: number): Promise<{
    encounter_id: number;
    prescription_allowed: boolean;
    prescriptions: WorkflowPrescription[];
    risk_score?: number;
    risk_level?: string;
    priority_score?: number;
    priority_level?: string;
    explanation?: string;
  }> => {
    return apiFetch(`/prescriptions/${encounterId}`);
  },

  // 12. Get Complete Patient Workflow Summary
  getPatientWorkflow: async (encounterId: number): Promise<FullPatientWorkflowResponse> => {
    return apiFetch<FullPatientWorkflowResponse>(`/patient-workflow/${encounterId}`);
  },
};
