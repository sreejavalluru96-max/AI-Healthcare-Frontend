import { Doctor, Patient } from '../../types';
import { apiFetch } from './apiClient';
import { getStoredDoctors, getStoredPatients, getAddedPatients, saveStoredDoctors, saveStoredPatients, updateAddedPatientStorage } from '../storageService';
import { patientService } from './patientService';

export const isTreatmentActiveStatus = (status?: string): boolean => {
  if (!status) return false;
  const s = status.trim().toUpperCase().replace(/_/g, ' ');
  return s === 'IN TREATMENT' || s === 'IN PROGRESS';
};

export const isCompletedOrInactiveStatus = (status?: string): boolean => {
  return !isTreatmentActiveStatus(status);
};

export const isDoctorBusy = (
  doctorId: string | number,
  doctorName?: string,
  targetPatientId?: string,
  allPatients: Patient[] = []
): boolean => {
  if (!doctorId && !doctorName) return false;

  const docIdStr = doctorId != null ? String(doctorId).trim().toLowerCase() : '';
  const docNum = doctorId != null ? String(doctorId).replace(/\D/g, '') : '';
  const docNameClean = doctorName?.trim().toLowerCase();

  const targetClean = targetPatientId ? String(targetPatientId).trim().toLowerCase() : '';
  const targetNum = targetPatientId ? String(targetPatientId).replace(/\D/g, '') : '';

  return allPatients.some((p) => {
    // Ignore the current target patient when checking availability for update
    if (
      targetPatientId &&
      (p.id.toLowerCase() === targetClean ||
        (targetNum && String(p.id).replace(/\D/g, '') === targetNum))
    ) {
      return false;
    }

    // A doctor is Busy ONLY if assigned to a patient whose effective treatment status is currently Active ("In Treatment" / "IN_PROGRESS")
    const isActive = isTreatmentActiveStatus(p.treatmentStatus);
    if (!isActive) return false;

    // Match doctor by ID
    const pDocIdStr = p.assignedDoctorId != null ? String(p.assignedDoctorId).trim().toLowerCase() : '';
    const pDocNum = p.assignedDoctorId != null ? String(p.assignedDoctorId).replace(/\D/g, '') : '';

    const matchId = Boolean(
      (docIdStr && pDocIdStr && docIdStr === pDocIdStr) ||
      (docNum && pDocNum && docNum === pDocNum)
    );

    // Match doctor by Name
    const pDocNameClean = p.assignedDoctor?.trim().toLowerCase();
    const matchName = Boolean(
      docNameClean &&
      pDocNameClean &&
      (docNameClean === pDocNameClean ||
       docNameClean.includes(pDocNameClean) ||
       pDocNameClean.includes(docNameClean))
    );

    return matchId || matchName;
  });
};

export const doctorService = {
  // GET /doctors
  getDoctors: async (): Promise<Doctor[]> => {
    let allPatients: Patient[] = [];
    try {
      allPatients = await patientService.getPatients();
    } catch {
      const patients = getStoredPatients();
      const addedPatients = getAddedPatients();
      allPatients = [...patients, ...addedPatients];
    }
    const doctors = getStoredDoctors();

    return doctors.map((doc) => {
      const busy = isDoctorBusy(doc.id, doc.name, undefined, allPatients);
      return {
        ...doc,
        availability: busy ? 'Busy' : 'Available',
      };
    });
  },

  // POST /doctors/assign
  assignDoctor: async (patientId: string, doctorId: string): Promise<{ patient: Patient; doctor: Doctor }> => {
    let patients = getStoredPatients();
    const doctors = getStoredDoctors();
    const addedPatients = getAddedPatients();

    const numericId = patientId.replace(/\D/g, '');
    let patientIndex = patients.findIndex(
      (p) => p.id === patientId || p.id.toLowerCase() === patientId.toLowerCase() || (numericId && p.id.replace(/\D/g, '') === numericId)
    );

    const addedIndex = addedPatients.findIndex(
      (p) => p.id === patientId || p.id.toLowerCase() === patientId.toLowerCase() || (numericId && p.id.replace(/\D/g, '') === numericId)
    );

    if (patientIndex === -1 && addedIndex === -1) {
      try {
        const fetched = await patientService.getPatientById(patientId);
        patients.push(fetched);
        patientIndex = patients.length - 1;
      } catch {
        const allP = await patientService.getPatients();
        const match = allP.find(
          (p) => p.id === patientId || p.id.toLowerCase() === patientId.toLowerCase() || (numericId && p.id.replace(/\D/g, '') === numericId)
        );
        if (match) {
          patients.push(match);
          patientIndex = patients.length - 1;
        }
      }
    }

    let allPatients: Patient[] = [];
    try {
      allPatients = await patientService.getPatients();
    } catch {
      allPatients = [...patients, ...addedPatients];
    }

    const doctorIndex = doctors.findIndex((d) => d.id === doctorId);
    if (doctorIndex === -1) throw new Error('Doctor not found');

    const doctor = doctors[doctorIndex];

    // Check if doctor is already assigned to another active patient
    if (isDoctorBusy(doctor.id, doctor.name, patientId, allPatients)) {
      throw new Error(`Doctor ${doctor.name} is currently assigned to another active patient.`);
    }


    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (patientIndex !== -1) {
      patients[patientIndex].assignedDoctor = doctor.name;
      patients[patientIndex].assignedDoctorId = doctor.id;
      patients[patientIndex].updatedAt = now;
      saveStoredPatients(patients);
    }

    if (addedIndex !== -1) {
      addedPatients[addedIndex].assignedDoctor = doctor.name;
      addedPatients[addedIndex].assignedDoctorId = doctor.id;
      addedPatients[addedIndex].updatedAt = now;
      updateAddedPatientStorage(addedPatients[addedIndex]);
    }

    doctors[doctorIndex].currentPatients += 1;
    saveStoredDoctors(doctors);

    const targetPatient = patientIndex !== -1 ? patients[patientIndex] : (addedIndex !== -1 ? addedPatients[addedIndex] : {
      id: patientId,
      assignedDoctor: doctor.name,
      assignedDoctorId: doctor.id,
    } as Patient);

    return { patient: targetPatient, doctor: doctors[doctorIndex] };
  },

  assignDoctorToEncounter: async (
    encounterId: number,
    doctorId: number,
    departmentId: number
  ): Promise<any> => {
    return { status: 'success', message: 'Doctor assigned temporarily in demo session.' };
  },

  // GET /departments
  getDepartments: async (): Promise<any[]> => {
    return apiFetch<any[]>('/departments');
  },
};


