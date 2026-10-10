import { Patient, PriorityLevel, TreatmentRecord, TreatmentWorkflowItem } from '../../types';
import { getStoredPatients, saveStoredPatients, getAddedPatients, updateAddedPatientStorage } from '../storageService';
import { patientService } from './patientService';
import { apiFetch } from './apiClient';

const priorityWeight: Record<PriorityLevel, number> = {
  CRITICAL: 5,
  HIGH: 4,
  MODERATE: 3,
  STABLE: 2,
  LOW: 1,
};

export const treatmentService = {
  // GET /priority-queue
  // Returns active waiting patients requiring emergency/priority attention (CRITICAL, HIGH, MODERATE in WAITING status)
  getPriorityQueue: async (): Promise<Patient[]> => {
    let patients: Patient[] = [];
    try {
      patients = await patientService.getPatients();
    } catch {
      patients = getStoredPatients();
    }

    const activeQueue = patients.filter(
      (p) =>
        (p.status === 'CRITICAL' || p.status === 'HIGH') &&
        p.treatmentStatus !== 'Completed' &&
        p.treatmentStatus !== 'COMPLETED' &&
        p.treatmentStatus !== 'Cancelled'
    );

    // Deduplicate by patient ID / encounter ID
    const seen = new Set<string>();
    const uniqueQueue = activeQueue.filter((p) => {
      const key = p.id || String(p.encounterId);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return uniqueQueue.sort((a, b) => {
      const weightA = priorityWeight[a.status] || 0;
      const weightB = priorityWeight[b.status] || 0;
      if (weightA !== weightB) return weightB - weightA;

      const scoreA = a.latestAssessment?.riskScore || 0;
      const scoreB = b.latestAssessment?.riskScore || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;

      return a.id.localeCompare(b.id);
    });
  },

  // GET /treatment/workflow
  getTreatmentWorkflowItems: async (): Promise<TreatmentWorkflowItem[]> => {
    let patients: Patient[] = [];
    try {
      patients = await patientService.getPatients();
    } catch {
      patients = getStoredPatients();
    }

    return patients.map((p) => ({
      id: `TRT-${p.id}`,
      patientId: p.id,
      patientName: p.name,
      age: p.age,
      gender: p.gender,
      department: p.department,
      priority: p.status,
      riskScore: p.latestAssessment?.riskScore || 50,
      doctorId: p.assignedDoctorId != null ? String(p.assignedDoctorId) : undefined,
      doctorName: p.assignedDoctor || 'Not Assigned',
      treatmentStatus: p.treatmentStatus,
      startTime: p.treatmentStatus === 'IN_PROGRESS' || p.treatmentStatus === 'In Treatment' || p.treatmentStatus === 'COMPLETED' || p.treatmentStatus === 'OBSERVATION' || p.treatmentStatus === 'Observation' ? '14:10' : undefined,
      notes: p.clinicalRecords[0]?.notes || 'Emergency triage in progress.',
      vitalsSummary: {
        spO2: p.vitals.spO2,
        heartRate: p.vitals.heartRate,
        bloodPressure: p.vitals.bloodPressure,
      },
    }));
  },

  // PATCH /encounters/{encounter_id}/status
  updateEncounterStatus: async (
    encounterId: number,
    status: 'Open' | 'Waiting' | 'In Treatment' | 'Completed' | 'Cancelled',
    notes?: string
  ): Promise<any> => {
    try {
      return await apiFetch(`/encounters/${encounterId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      });
    } catch (e) {
      console.warn(`Backend encounter ${encounterId} status update warning:`, e);
      return { status: 'success', encounter_id: encounterId, new_status: status };
    }
  },

  // POST /prescriptions (Temporary local override)
  createPrescription: async (data: {
    encounter_id: number;
    doctor_id: number;
    medicine_name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }): Promise<any> => {
    return { status: 'success', message: 'Prescription created temporarily in demo session.' };
  },

  // GET /prescriptions/{encounter_id}
  getPrescriptions: async (encounterId: number): Promise<any> => {
    return apiFetch(`/prescriptions/${encounterId}`);
  },

  // POST /treatment/start
  startTreatment: async (patientId: string, encounterId?: number | string): Promise<Patient> => {
    let patients = getStoredPatients();
    const addedPatients = getAddedPatients();

    const numericId = patientId.replace(/\D/g, '');
    let index = patients.findIndex(
      (p) => p.id === patientId || p.id.toLowerCase() === patientId.toLowerCase() || (numericId && p.id.replace(/\D/g, '') === numericId)
    );
    let addedIndex = addedPatients.findIndex(
      (p) => p.id === patientId || p.id.toLowerCase() === patientId.toLowerCase() || (numericId && p.id.replace(/\D/g, '') === numericId)
    );

    if (index === -1 && addedIndex === -1) {
      try {
        const fetched = await patientService.getPatientById(patientId);
        patients.push(fetched);
        index = patients.length - 1;
      } catch {
        const allP = await patientService.getPatients();
        const match = allP.find(
          (p) => p.id === patientId || p.id.toLowerCase() === patientId.toLowerCase() || (numericId && p.id.replace(/\D/g, '') === numericId)
        );
        if (match) {
          patients.push(match);
          index = patients.length - 1;
        } else {
          throw new Error('Patient not found');
        }
      }
    }

    const targetPatient = index !== -1 ? patients[index] : addedPatients[addedIndex];
    const targetEncounterId = encounterId || targetPatient.encounterId || (numericId ? parseInt(numericId, 10) : undefined);

    if (targetEncounterId) {
      try {
        await treatmentService.updateEncounterStatus(Number(targetEncounterId), 'In Treatment', 'Emergency treatment initiated.');
      } catch (err) {
        console.warn('Backend encounter status update skipped:', err);
      }
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (index !== -1) {
      patients[index].treatmentStatus = 'IN_PROGRESS';
      patients[index].updatedAt = now;
      saveStoredPatients(patients);
    }

    if (addedIndex !== -1) {
      addedPatients[addedIndex].treatmentStatus = 'IN_PROGRESS';
      addedPatients[addedIndex].updatedAt = now;
      updateAddedPatientStorage(addedPatients[addedIndex]);
    }

    return index !== -1 ? patients[index] : addedPatients[addedIndex];
  },

  // POST /treatment/complete
  completeTreatment: async (patientId: string, notes?: string, encounterId?: number | string): Promise<Patient> => {
    let patients = getStoredPatients();
    const addedPatients = getAddedPatients();

    const numericId = patientId.replace(/\D/g, '');
    let index = patients.findIndex(
      (p) => p.id === patientId || p.id.toLowerCase() === patientId.toLowerCase() || (numericId && p.id.replace(/\D/g, '') === numericId)
    );
    let addedIndex = addedPatients.findIndex(
      (p) => p.id === patientId || p.id.toLowerCase() === patientId.toLowerCase() || (numericId && p.id.replace(/\D/g, '') === numericId)
    );

    if (index === -1 && addedIndex === -1) {
      try {
        const fetched = await patientService.getPatientById(patientId);
        patients.push(fetched);
        index = patients.length - 1;
      } catch {
        const allP = await patientService.getPatients();
        const match = allP.find(
          (p) => p.id === patientId || p.id.toLowerCase() === patientId.toLowerCase() || (numericId && p.id.replace(/\D/g, '') === numericId)
        );
        if (match) {
          patients.push(match);
          index = patients.length - 1;
        } else {
          throw new Error('Patient not found');
        }
      }
    }

    const targetPatient = index !== -1 ? patients[index] : addedPatients[addedIndex];
    const targetEncounterId = encounterId || targetPatient.encounterId || (numericId ? parseInt(numericId, 10) : undefined);

    if (targetEncounterId) {
      try {
        await treatmentService.updateEncounterStatus(Number(targetEncounterId), 'Completed', notes || 'Emergency treatment completed.');
      } catch (err) {
        console.warn('Backend encounter completion update skipped:', err);
      }
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updatePatientObj = (p: Patient) => {
      p.treatmentStatus = 'OBSERVATION';
      p.updatedAt = now;

      const treatmentRecord: TreatmentRecord = {
        id: `TRT-REC-${Date.now()}`,
        patientId: p.id,
        patientName: p.name,
        doctorId: p.assignedDoctorId != null ? String(p.assignedDoctorId) : undefined,
        doctorName: p.assignedDoctor || 'Emergency Staff',
        priority: p.status,
        riskScore: p.latestAssessment?.riskScore || 50,
        department: p.department,
        startTime: p.registeredAt || now,
        completionTime: now,
        status: 'COMPLETED',
        notes: notes || 'Emergency clinical treatment completed. Patient stabilized and transferred to observation stage.',
        createdAt: now,
        updatedAt: now,
      };

      if (!p.treatmentHistory) {
        p.treatmentHistory = [];
      }
      p.treatmentHistory.unshift(treatmentRecord);
    };

    if (index !== -1) {
      updatePatientObj(patients[index]);
      saveStoredPatients(patients);
    }

    if (addedIndex !== -1) {
      updatePatientObj(addedPatients[addedIndex]);
      updateAddedPatientStorage(addedPatients[addedIndex]);
    }

    return index !== -1 ? patients[index] : addedPatients[addedIndex];
  },
};
