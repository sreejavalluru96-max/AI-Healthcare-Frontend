import {
  Patient,
  ClinicalRecord,
  PriorityLevel,
  TreatmentStatus,
  Gender,
  Department,
  VitalSigns,
  AiAssessment,
} from '../../types';

import {
  getStoredPatients,
  saveStoredPatients,
  getDeletedPatientIds,
  addDeletedPatientId,
  getAddedPatients,
  saveAddedPatient,
  updateAddedPatientStorage,
} from '../storageService';

import { apiFetch } from './apiClient';

/* =========================================================
   BACKEND TYPES
   ========================================================= */

export interface BackendPatient {
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

export interface BackendEncounter {
  encounter_id: number;
  doctor_id?: number | null;
  doctor_name?: string | null;
  encounter_type: string;
  visit_date: string;
  status: string;
  chief_complaint?: string;

  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  temperature?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
}

export interface BackendSymptom {
  symptom_id: number;
  encounter_id: number;
  symptom_name: string;
  severity?: string;
  duration?: string;
}

export interface BackendClinicalData {
  patient_id: number;
  patient_name: string;
  encounters: BackendEncounter[];
  symptoms: BackendSymptom[];
}

/*
 * Kept here instead of importing it from aiService.ts.
 * This prevents the circular import problem.
 */
export interface BackendAiAssessment {
  encounter_id: number;
  risk_score: number;
  risk_level: string;
  priority_score: number;
  priority_level: string;
  explanation?: string;
}

/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() < birthDate.getDate()
    )
  ) {
    age--;
  }

  return age;
};

const mapPriorityLevel = (
  value?: string | number
): PriorityLevel => {
  const normalized = String(value ?? '').toUpperCase();

  if (
    normalized.includes('CRITICAL') ||
    normalized === '100'
  ) {
    return 'CRITICAL';
  }

  if (
    normalized.includes('HIGH') ||
    normalized === 'HIGH'
  ) {
    return 'HIGH';
  }

  if (
    normalized.includes('MODERATE') ||
    normalized.includes('MEDIUM')
  ) {
    return 'MODERATE';
  }

  return 'STABLE';
};

/* =========================================================
   BLOOD PRESSURE HELPERS
   ========================================================= */

const getSystolicBP = (
  vitals?: VitalSigns
): number => {
  if (!vitals) {
    return 120;
  }

  if (
    typeof vitals.systolicBP === 'number' &&
    Number.isFinite(vitals.systolicBP)
  ) {
    return vitals.systolicBP;
  }

  const bloodPressure =
    String(vitals.bloodPressure ?? '');

  const parts = bloodPressure.split('/');

  const value = Number(parts[0]);

  return Number.isFinite(value)
    ? value
    : 120;
};

const getDiastolicBP = (
  vitals?: VitalSigns
): number => {
  if (!vitals) {
    return 80;
  }

  if (
    typeof vitals.diastolicBP === 'number' &&
    Number.isFinite(vitals.diastolicBP)
  ) {
    return vitals.diastolicBP;
  }

  const bloodPressure =
    String(vitals.bloodPressure ?? '');

  const parts = bloodPressure.split('/');

  const value = Number(parts[1]);

  return Number.isFinite(value)
    ? value
    : 80;
};

/* =========================================================
   DELETED ID HELPER
   ========================================================= */

const isDeleted = (id: string | number): boolean => {
  if (id === null || id === undefined || id === '') return false;
  const deletedIds = getDeletedPatientIds();
  if (!deletedIds || deletedIds.length === 0) return false;

  const cleanId = String(id).trim().toLowerCase();
  if (!cleanId) return false;

  const numericId = cleanId.replace(/\D/g, '');
  const paddedId = numericId ? `p${numericId.padStart(3, '0')}` : '';

  return deletedIds.some((d) => {
    if (!d) return false;
    const cleanD = String(d).trim().toLowerCase();
    if (!cleanD) return false;

    const numD = cleanD.replace(/\D/g, '');
    const padD = numD ? `p${numD.padStart(3, '0')}` : '';

    return (
      cleanD === cleanId ||
      (numericId !== '' && numD !== '' && numericId === numD) ||
      (paddedId !== '' && cleanD === paddedId) ||
      (padD !== '' && cleanId === padD)
    );
  });
};

/* =========================================================
   NORMALIZE VITALS
   ========================================================= */

const normalizeVitals = (
  vitals: VitalSigns
): VitalSigns => {
  const bloodPressure =
    String(vitals.bloodPressure ?? '120/80');

  const parts =
    bloodPressure.split('/');

  const systolic =
    Number(parts[0]);

  const diastolic =
    Number(parts[1]);

  const systolicBP =
    Number.isFinite(systolic)
      ? systolic
      : (
        typeof vitals.systolicBP === 'number'
          ? vitals.systolicBP
          : 120
      );

  const diastolicBP =
    Number.isFinite(diastolic)
      ? diastolic
      : (
        typeof vitals.diastolicBP === 'number'
          ? vitals.diastolicBP
          : 80
      );

  return {
    ...vitals,
    bloodPressure:
      Number.isFinite(systolic) &&
        Number.isFinite(diastolic)
        ? `${systolic}/${diastolic}`
        : bloodPressure,

    systolicBP,
    diastolicBP,
  };
};

/* =========================================================
   LOCAL AI ASSESSMENT
   ========================================================= */

const calculateLocalAssessment = (
  patient: Patient
): {
  priority: PriorityLevel;
  score: number;
  treatmentStatus: TreatmentStatus;
  assessment: AiAssessment;
} => {

  const vitals =
    normalizeVitals(patient.vitals);

  const heartRate =
    Number(vitals.heartRate ?? 0);

  const systolicBP =
    getSystolicBP(vitals);

  const oxygen =
    Number(vitals.spO2 ?? 100);

  const temperature =
    Number(vitals.temperature ?? 36.5);

  const respiratoryRate =
    Number(vitals.respiratoryRate ?? 16);

  const glucose =
    Number(vitals.bloodGlucose ?? 100);

  const symptomsText = (
    Array.isArray(patient.symptoms)
      ? patient.symptoms.join(' ')
      : String(patient.symptoms ?? '')
  ).toLowerCase();

  let score = 20;

  const reasons: string[] = [];

  /* ---------- OXYGEN ---------- */

  if (oxygen < 85) {
    score += 35;
    reasons.push(
      'Very low oxygen saturation'
    );
  } else if (oxygen <= 91) {
    score += 22;
    reasons.push(
      'Low oxygen saturation'
    );
  } else if (oxygen <= 94) {
    score += 10;
    reasons.push(
      'Reduced oxygen saturation'
    );
  }

  /* ---------- HEART RATE ---------- */

  if (heartRate > 125) {
    score += 25;
    reasons.push(
      'Very high heart rate'
    );
  } else if (heartRate > 100) {
    score += 15;
    reasons.push(
      'High heart rate'
    );
  } else if (
    heartRate > 0 &&
    heartRate < 50
  ) {
    score += 20;
    reasons.push(
      'Very low heart rate'
    );
  }

  /* ---------- BLOOD PRESSURE ---------- */

  if (systolicBP < 90) {
    score += 25;
    reasons.push(
      'Very low systolic blood pressure'
    );
  } else if (systolicBP > 165) {
    score += 20;
    reasons.push(
      'Very high systolic blood pressure'
    );
  } else if (systolicBP > 140) {
    score += 10;
    reasons.push(
      'High systolic blood pressure'
    );
  }

  /* ---------- TEMPERATURE ---------- */

  if (temperature >= 38.8) {
    score += 15;
    reasons.push(
      'High temperature'
    );
  } else if (temperature >= 37.8) {
    score += 8;
    reasons.push(
      'Elevated temperature'
    );
  }

  /* ---------- RESPIRATORY RATE ---------- */

  if (respiratoryRate >= 26) {
    score += 15;
    reasons.push(
      'High respiratory rate'
    );
  }

  /* ---------- GLUCOSE ---------- */

  if (glucose > 200) {
    score += 10;
    reasons.push(
      'High blood glucose'
    );
  }

  /* ---------- SYMPTOMS ---------- */

  const seriousSymptoms = [
    'chest pain',
    'cyanosis',
    'severe',
    'breathlessness',
    'shortness of breath',
    'difficulty breathing',
    'unconsciousness',
    'unconscious',
    'fainting',
    'stroke',
    'bleeding',
  ];

  const hasSeriousSymptom =
    seriousSymptoms.some(
      symptom =>
        symptomsText.includes(symptom)
    );

  if (hasSeriousSymptom) {
    score += 20;
    reasons.push(
      'Serious emergency symptoms reported'
    );
  }

  /* ---------- LIMIT SCORE ---------- */

  score =
    Math.max(
      12,
      Math.min(100, score)
    );

  /* ---------- PRIORITY ---------- */

  let priority: PriorityLevel;

  if (score >= 75) {
    priority = 'CRITICAL';
  } else if (score >= 55) {
    priority = 'HIGH';
  } else if (score >= 35) {
    priority = 'MODERATE';
  } else {
    priority = 'STABLE';
  }

  /* ---------- TREATMENT STATUS ---------- */

  let treatmentStatus:
    TreatmentStatus;

  if (
    patient.treatmentStatus === 'IN_PROGRESS' ||
    patient.treatmentStatus === 'In Treatment' ||
    patient.treatmentStatus === 'COMPLETED' ||
    patient.treatmentStatus === 'Completed' ||
    patient.treatmentStatus === 'OBSERVATION' ||
    patient.treatmentStatus === 'Observation'
  ) {
    treatmentStatus =
      patient.treatmentStatus;
  } else if (
    priority === 'CRITICAL' ||
    priority === 'HIGH'
  ) {
    treatmentStatus = 'WAITING';
  } else if (
    priority === 'MODERATE'
  ) {
    treatmentStatus =
      'OBSERVATION';
  } else {
    treatmentStatus =
      'ROUTINE';
  }

  const explanation =
    reasons.length > 0
      ? reasons.join('. ') + '.'
      : 'No major risk factors detected.';

  const assessment: AiAssessment = {
    id: `ASS-${patient.id || 'P000'}-${Date.now()}`,
    patientId: patient.id || '',
    patientName: patient.name || '',
    riskScore: score,
    priority,
    assessedAt: new Date().toISOString(),
    riskFactors: reasons,
    explanation,
    recommendedActions: [],
    status: 'Active',
  };

  return {
    priority,
    score,
    treatmentStatus,
    assessment,
  };
};

/* =========================================================
   MAP BACKEND PATIENT
   ========================================================= */

const mapBackendPatientToFrontend = (
  backendPatient: BackendPatient,
  clinicalData?: BackendClinicalData,
  backendAssessment?: BackendAiAssessment,
  storedPatient?: Patient
): Patient => {

  const latestEncounter = clinicalData?.encounters?.length ? clinicalData.encounters[0] : undefined;

  if (!backendAssessment && (clinicalData as any)?.ai_assessments?.length) {
    const matched = latestEncounter
      ? (clinicalData as any).ai_assessments.find((a: any) => a.encounter_id === latestEncounter.encounter_id)
      : undefined;
    const raw = matched || (clinicalData as any).ai_assessments[0];
    if (raw) {
      backendAssessment = {
        encounter_id: raw.encounter_id,
        risk_score: Number(raw.risk_score ?? raw.priority_score ?? 0),
        risk_level: raw.risk_level || 'Low',
        priority_score: Number(raw.priority_score ?? raw.risk_score ?? 0),
        priority_level: raw.priority_level || 'Low',
        explanation: raw.explanation || '',
      };
    }
  }

  const symptomList: string[] = clinicalData?.symptoms
    ?.filter(
      symptom =>
        !latestEncounter ||
        symptom.encounter_id === latestEncounter.encounter_id
    )
    .map(symptom => symptom.symptom_name) || [];

  const symptomsStr = symptomList.join(', ');

  const symptoms: string[] = symptomList.length > 0
    ? symptomList
    : (Array.isArray(storedPatient?.symptoms)
      ? storedPatient.symptoms
      : (typeof storedPatient?.symptoms === 'string'
        ? [storedPatient.symptoms]
        : ['Mild headache']));

  const vitals: VitalSigns =
    normalizeVitals({
      heartRate:
        latestEncounter?.heart_rate ??
        78,

      bloodPressure:
        latestEncounter?.systolic_bp != null
          ? `${latestEncounter.systolic_bp}/${latestEncounter.diastolic_bp ?? 80}`
          : '120/80',

      systolicBP:
        latestEncounter?.systolic_bp ??
        120,

      diastolicBP:
        latestEncounter?.diastolic_bp ??
        80,

      spO2:
        latestEncounter?.oxygen_saturation ??
        98,

      temperature:
        latestEncounter?.temperature ??
        36.7,

      respiratoryRate:
        latestEncounter?.respiratory_rate ??
        16,

      bloodGlucose:
        100,

      measuredAt:
        latestEncounter?.visit_date ??
        'Recorded in Encounter',
    });

  const isLocallyEdited = Boolean(
    (storedPatient as any)?._isEdited || (storedPatient as any)?.isLocallyEdited
  );

  const effectiveName = isLocallyEdited && storedPatient?.name ? storedPatient.name : backendPatient.name;
  const effectiveAge = isLocallyEdited && storedPatient?.age ? storedPatient.age : calculateAge(backendPatient.date_of_birth);
  const effectiveGender = (isLocallyEdited && storedPatient?.gender ? storedPatient.gender : backendPatient.gender) as Gender;
  const effectivePhone = isLocallyEdited && storedPatient?.phone ? storedPatient.phone : backendPatient.phone;
  const effectiveBloodGroup = isLocallyEdited && storedPatient?.bloodGroup ? storedPatient.bloodGroup : backendPatient.blood_group;
  const effectiveSymptoms = symptoms.length > 0 ? symptoms : (isLocallyEdited && storedPatient?.symptoms ? storedPatient.symptoms : symptoms);
  const effectiveVitals = latestEncounter ? vitals : (isLocallyEdited && storedPatient?.vitals ? storedPatient.vitals : vitals);

  const tempPatientId = `P${String(backendPatient.patient_id).padStart(3, '0')}`;

  const backendPriority =
    backendAssessment
      ? mapPriorityLevel(
        backendAssessment.priority_level || backendAssessment.risk_level
      )
      : undefined;

  const status: PriorityLevel =
    backendPriority ??
    (isLocallyEdited && storedPatient?.status ? storedPatient.status : 'STABLE');

  const rawStatus = String(
    storedPatient?.treatmentStatus ||
    latestEncounter?.status ||
    clinicalData?.encounters?.[0]?.status ||
    'Open'
  ).toUpperCase().replace(/\s+/g, '_');

  let treatmentStatus: TreatmentStatus = 'WAITING';
  if (rawStatus === 'IN_PROGRESS' || rawStatus === 'IN_TREATMENT') {
    treatmentStatus = 'IN_PROGRESS';
  } else if (rawStatus === 'OBSERVATION') {
    treatmentStatus = 'OBSERVATION';
  } else if (rawStatus === 'COMPLETED') {
    treatmentStatus = storedPatient?.treatmentStatus === 'OBSERVATION' || storedPatient?.treatmentStatus === 'Observation'
      ? 'OBSERVATION'
      : 'COMPLETED';
  } else {
    treatmentStatus = storedPatient?.treatmentStatus || 'WAITING';
  }

  const latestAssessment: AiAssessment | undefined = backendAssessment
    ? {
        id: `ASS-${backendPatient.patient_id}-${backendAssessment.encounter_id || Date.now()}`,
        patientId: tempPatientId,
        patientName: effectiveName,
        riskScore: backendAssessment.risk_score ?? backendAssessment.priority_score ?? 0,
        riskLevel: backendAssessment.risk_level,
        priority: backendPriority || status,
        assessedAt: new Date().toISOString(),
        riskFactors: backendAssessment.explanation ? [backendAssessment.explanation] : [],
        explanation: backendAssessment.explanation || 'Backend AI assessment completed.',
        recommendedActions: [],
        status: 'Active',
      }
    : storedPatient?.latestAssessment;

  const clinicalRecord: ClinicalRecord = {
    id: String(
      latestEncounter?.encounter_id ??
      `${backendPatient.patient_id}-clinical`
    ),
    patientId: tempPatientId,
    visitDate:
      latestEncounter?.visit_date ??
      new Date().toISOString(),
    doctorName:
      storedPatient?.assignedDoctor ??
      latestEncounter?.doctor_name ??
      'Medical Team',
    heartRate: vitals.heartRate,
    bloodPressure: vitals.bloodPressure,
    spO2: vitals.spO2,
    temperature: vitals.temperature,
    chiefComplaint:
      symptomsStr ||
      latestEncounter?.chief_complaint ||
      'Routine assessment',
    diagnosis:
      latestEncounter?.chief_complaint ??
      storedPatient?.clinicalRecords?.[0]?.diagnosis ??
      'Routine assessment',
    notes:
      latestEncounter?.status ??
      'Clinical record from hospital database',
  };

  const medicalHistory: string[] = Array.isArray(storedPatient?.medicalHistory)
    ? storedPatient.medicalHistory
    : (typeof storedPatient?.medicalHistory === 'string' && storedPatient.medicalHistory
      ? [storedPatient.medicalHistory]
      : []);

  const emergencyContact = (typeof storedPatient?.emergencyContact === 'object' && storedPatient.emergencyContact)
    ? storedPatient.emergencyContact
    : {
      name: backendPatient.emergency_contact || 'Emergency Contact',
      relationship: 'Contact',
      phone: backendPatient.phone || '',
    };

  return {
    ...(storedPatient ?? {}),

    id: tempPatientId,

    encounterId: latestEncounter?.encounter_id,

    name: effectiveName,

    age: effectiveAge,

    gender: effectiveGender,

    phone: effectivePhone,

    bloodGroup: effectiveBloodGroup,

    department:
      storedPatient?.department ?? ('General Medicine' as Department),

    symptoms: effectiveSymptoms,

    vitals: effectiveVitals,

    clinicalRecords:
      latestEncounter
        ? [
          clinicalRecord,
          ...(storedPatient?.clinicalRecords ?? [])
            .filter(
              (record: ClinicalRecord) =>
                record.id !==
                clinicalRecord.id
            ),
        ]
        : (
          storedPatient?.clinicalRecords ??
          []
        ),

    status,

    treatmentStatus,

    assignedDoctor:
      storedPatient?.assignedDoctor ??
      latestEncounter?.doctor_name ??
      'Unassigned',

    assignedDoctorId:
      storedPatient?.assignedDoctorId ??
      (latestEncounter?.doctor_id ? String(latestEncounter.doctor_id) : undefined),

    medicalHistory,

    emergencyContact,

    latestAssessment,

    treatmentHistory:
      storedPatient?.treatmentHistory ??
      [],

    reports:
      storedPatient?.reports ??
      [],

    waitingTimeMinutes:
      storedPatient?.waitingTimeMinutes ?? 0,

    registeredAt:
      storedPatient?.registeredAt ??
      backendPatient.created_at ??
      new Date().toISOString(),

    updatedAt:
      storedPatient?.updatedAt ??
      new Date().toISOString(),
  };
};

/* =========================================================
   PATIENT SERVICE
   ========================================================= */

export const patientService = {

  /* =======================================================
     GET ALL PATIENTS
     ======================================================= */

  getPatients: async (): Promise<Patient[]> => {
    let backendPatients: BackendPatient[] = [];

    try {
      backendPatients = await apiFetch<BackendPatient[]>('/patients');
    } catch (error) {
      console.warn(
        'Backend patient fetch failed. Using local data.',
        error
      );
    }

    const storedPatients = getStoredPatients();

    const activeBackendPatients = backendPatients.filter(
      backendPatient =>
        !isDeleted(backendPatient.patient_id) &&
        !isDeleted(`P${String(backendPatient.patient_id).padStart(3, '0')}`)
    );

    // Batch Phase 1: Concurrently fetch clinical-data for all active backend patients
    const clinicalDataSettled = await Promise.allSettled(
      activeBackendPatients.map(bp =>
        apiFetch<BackendClinicalData>(`/patients/${bp.patient_id}/clinical-data`)
      )
    );

    const clinicalDataMap = new Map<number, BackendClinicalData>();
    clinicalDataSettled.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value) {
        const bp = activeBackendPatients[idx];
        clinicalDataMap.set(bp.patient_id, result.value);
      }
    });

    // Batch Phase 2: Extract latest encounters and fetch workflow data concurrently
    const encounterList: { patient_id: number; encounter_id: number }[] = [];
    const encounterMap = new Map<number, number>();
    const requestedEncounterIds = new Set<number>();

    activeBackendPatients.forEach(bp => {
      const cd = clinicalDataMap.get(bp.patient_id);
      const latestEncounter = cd?.encounters?.length ? cd.encounters[0] : undefined;

      if (latestEncounter) {
        encounterMap.set(bp.patient_id, latestEncounter.encounter_id);
        if (!requestedEncounterIds.has(latestEncounter.encounter_id)) {
          requestedEncounterIds.add(latestEncounter.encounter_id);
          encounterList.push({ patient_id: bp.patient_id, encounter_id: latestEncounter.encounter_id });
        }
      }
    });

    const workflowSettled = await Promise.allSettled(
      encounterList.map(item =>
        apiFetch<any>(`/patient-workflow/${item.encounter_id}`)
      )
    );

    const workflowMap = new Map<number, BackendAiAssessment>();
    workflowSettled.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value) {
        const wf = result.value;
        const encId = encounterList[idx].encounter_id;
        if (wf && wf.assessment_available) {
          workflowMap.set(encId, {
            encounter_id: encId,
            risk_score: wf.risk_score ?? 0,
            risk_level: wf.risk_level ?? 'Low',
            priority_score: wf.priority_score ?? 0,
            priority_level: wf.priority_level ?? 'Low',
            explanation: wf.explanation || '',
          });
        }
      }
    });

    // Synchronous Patient Mapping
    const mappedBackendPatients = activeBackendPatients.map(bp => {
      const id = `P${String(bp.patient_id).padStart(3, '0')}`;
      const storedPatient = storedPatients.find(
        patient =>
          patient.id === id ||
          patient.id.replace(/\D/g, '') === String(bp.patient_id)
      );

      const clinicalData = clinicalDataMap.get(bp.patient_id);
      const encId = encounterMap.get(bp.patient_id);
      const backendAssessment = encId != null ? workflowMap.get(encId) : undefined;

      return mapBackendPatientToFrontend(
        bp,
        clinicalData,
        backendAssessment,
        storedPatient
      );
    });

    const addedPatients = getAddedPatients();

    const activeAddedPatients = addedPatients.filter(
      patient => !isDeleted(patient.id)
    );

    const activePatients = [
      ...mappedBackendPatients,
      ...activeAddedPatients.filter(
        addedPatient =>
          !mappedBackendPatients.some(
            (backendPatient: Patient) =>
              backendPatient.id === addedPatient.id ||
              backendPatient.id.replace(/\D/g, '') === addedPatient.id.replace(/\D/g, '')
          )
      ),
    ].filter(patient => !isDeleted(patient.id));

    saveStoredPatients(activePatients);

    return activePatients;
  },

  /* =======================================================
     GET SINGLE PATIENT
     ======================================================= */

  getPatientById: async (
    id: string
  ): Promise<Patient> => {

    const numericId =
      Number(
        id.replace(/\D/g, '')
      );

    if (
      Number.isFinite(numericId) &&
      numericId > 0
    ) {
      try {

        const backendPatient =
          await apiFetch<BackendPatient>(
            `/patients/${numericId}`
          );

        let clinicalData:
          BackendClinicalData |
          undefined;

        let backendAssessment:
          BackendAiAssessment |
          undefined;

        try {
          clinicalData =
            await apiFetch<BackendClinicalData>(
              `/patients/${numericId}/clinical-data`
            );
        } catch {
          clinicalData =
            undefined;
        }

        const latestEncounter = clinicalData?.encounters?.length ? clinicalData.encounters[0] : undefined;

        if (latestEncounter) {
          try {
            const wf = await apiFetch<any>(`/patient-workflow/${latestEncounter.encounter_id}`).catch(() => null);
            if (wf && wf.assessment_available) {
              backendAssessment = {
                encounter_id: latestEncounter.encounter_id,
                risk_score: wf.risk_score ?? 0,
                risk_level: wf.risk_level ?? 'Low',
                priority_score: wf.priority_score ?? 0,
                priority_level: wf.priority_level ?? 'Low',
                explanation: wf.explanation || '',
              };
            }
          } catch {
            backendAssessment = undefined;
          }
        }

        const storedPatients =
          getStoredPatients();

        const storedPatient =
          storedPatients.find(
            patient =>
              patient.id === id ||
              patient.id.replace(/\D/g, '') ===
              String(numericId)
          );

        return mapBackendPatientToFrontend(
          backendPatient,
          clinicalData,
          backendAssessment,
          storedPatient
        );

      } catch {
        /* Backend patient may not exist.
           Try local storage instead. */
      }
    }

    const patients =
      getStoredPatients();

    const patient =
      patients.find(
        p =>
          p.id === id ||
          p.id.replace(/\D/g, '') ===
          id.replace(/\D/g, '')
      );

    if (!patient) {
      throw new Error(
        'Patient not found'
      );
    }

    return patient;
  },

  /* =======================================================
     ADD NEW PATIENT
     ======================================================= */

  addPatient: async (
    newPatientData: Omit<Patient, 'id'> | Partial<Patient>
  ): Promise<Patient> => {

    const existingPatients =
      getStoredPatients();

    const addedPatients =
      getAddedPatients();

    const allPatients = [
      ...existingPatients,
      ...addedPatients,
    ];

    const maxId =
      allPatients.reduce(
        (maximum, patient) => {

          const number =
            Number(
              patient.id.replace(
                /\D/g,
                ''
              )
            );

          return Number.isFinite(number)
            ? Math.max(
              maximum,
              number
            )
            : maximum;
        },
        0
      );

    const nextNumber =
      maxId + 1;

    const id =
      `P${String(
        nextNumber
      ).padStart(3, '0')}`;

    const now =
      new Date().toISOString();

    const initialPatient =
      {
        ...newPatientData,

        id,

        vitals:
          normalizeVitals(
            newPatientData.vitals || {
              heartRate: 75,
              bloodPressure: '120/80',
              systolicBP: 120,
              diastolicBP: 80,
              spO2: 98,
              temperature: 36.6,
              respiratoryRate: 16,
              bloodGlucose: 100,
              measuredAt: 'Just now',
            }
          ),

        status:
          'STABLE' as PriorityLevel,

        treatmentStatus:
          'ROUTINE' as TreatmentStatus,

        updatedAt:
          now,

        treatmentHistory:
          newPatientData.treatmentHistory ??
          [],

        clinicalRecords:
          newPatientData.clinicalRecords ??
          [],

        medicalHistory:
          newPatientData.medicalHistory ??
          [],

        emergencyContact:
          newPatientData.emergencyContact ??
          { name: '', relationship: '', phone: '' },

        assignedDoctor:
          newPatientData.assignedDoctor ??
          'Unassigned',

        waitingTimeMinutes:
          newPatientData.waitingTimeMinutes ?? 0,

        registeredAt:
          newPatientData.registeredAt ?? now,
      } as Patient;

    const result =
      calculateLocalAssessment(
        initialPatient
      );

    const patient: Patient = {
      ...initialPatient,

      status:
        result.priority,

      treatmentStatus:
        result.treatmentStatus,

      latestAssessment:
        result.assessment,

      updatedAt:
        now,
    };

    saveAddedPatient(
      patient
    );

    const stored =
      getStoredPatients();

    const index =
      stored.findIndex(
        existing =>
          existing.id === id
      );

    if (index >= 0) {
      stored[index] =
        patient;
    } else {
      stored.push(
        patient
      );
    }

    saveStoredPatients(
      stored
    );

    return patient;
  },

  /* =======================================================
     UPDATE PATIENT
     ======================================================= */

  updatePatient: async (
    id: string,
    updatedData: Partial<Patient>
  ): Promise<Patient> => {

    let patients = getStoredPatients();

    let index = patients.findIndex(
      patient =>
        patient.id === id ||
        patient.id.replace(/\D/g, '') === id.replace(/\D/g, '')
    );

    if (index === -1) {
      try {
        const fetched = await patientService.getPatientById(id);
        patients.push(fetched);
        index = patients.length - 1;
      } catch {
        throw new Error('Patient not found');
      }
    }

    const existing = patients[index];

    /*
     * IMPORTANT:
     * Merge old vitals with newly edited vitals.
     */
    const mergedVitals = normalizeVitals({
      ...existing.vitals,
      ...(updatedData.vitals ?? {}),
    });

    const merged: Patient & { _isEdited?: boolean; isLocallyEdited?: boolean } = {
      ...existing,

      ...updatedData,

      vitals: mergedVitals,

      updatedAt: new Date()
        .toISOString()
        .replace('T', ' ')
        .substring(0, 16),

      _isEdited: true,
      isLocallyEdited: true,
    };

    /*
     * Recalculate AI priority immediately.
     */
    const result = calculateLocalAssessment(merged);

    merged.status = result.priority;
    merged.treatmentStatus = result.treatmentStatus;
    merged.latestAssessment = result.assessment;

    /*
     * Keep assessment history.
     */
    merged.treatmentHistory = merged.treatmentHistory ?? [];

    /*
     * Update local storage for added patients.
     */
    updateAddedPatientStorage(merged);

    patients[index] = merged;

    saveStoredPatients(patients);

    return merged;
  },

  /* =======================================================
     DELETE PATIENT
     ======================================================= */

  deletePatient: async (
    id: string
  ): Promise<void> => {

    if (!id) return;
    const cleanId = String(id).trim();
    const numericId = cleanId.replace(/\D/g, '');

    addDeletedPatientId(cleanId);
    if (numericId) {
      addDeletedPatientId(numericId);
      addDeletedPatientId(`P${numericId.padStart(3, '0')}`);
      addDeletedPatientId(`p${numericId.padStart(3, '0')}`);
    }

    const patients = getStoredPatients();

    const remaining = patients.filter(
      patient => !isDeleted(patient.id)
    );

    saveStoredPatients(remaining);

    const addedPatients = getAddedPatients();
    const remainingAdded = addedPatients.filter(
      patient => !isDeleted(patient.id)
    );
    try {
      localStorage.setItem('mediqueue_added_patients_v1', JSON.stringify(remainingAdded));
    } catch (e) {
      console.error('Failed to update added patients storage on delete:', e);
    }
  },

  /* =======================================================
     ADD CLINICAL RECORD
     ======================================================= */

  addClinicalRecord: async (
    patientId: string,
    record: Omit<ClinicalRecord, 'id' | 'patientId'> | ClinicalRecord
  ): Promise<Patient> => {

    const patients =
      getStoredPatients();

    const index =
      patients.findIndex(
        patient =>
          patient.id === patientId ||
          patient.id.replace(/\D/g, '') ===
          patientId.replace(/\D/g, '')
      );

    if (index === -1) {
      throw new Error(
        'Patient not found'
      );
    }

    const existing =
      patients[index];

    const fullRecord: ClinicalRecord = {
      id: (record as ClinicalRecord).id || `CR-${Date.now()}`,
      patientId: (record as ClinicalRecord).patientId || existing.id,
      visitDate: (record as ClinicalRecord).visitDate || new Date().toISOString(),
      doctorName: (record as ClinicalRecord).doctorName || existing.assignedDoctor || 'Medical Team',
      heartRate: record.heartRate ?? existing.vitals?.heartRate ?? 75,
      bloodPressure: record.bloodPressure ?? existing.vitals?.bloodPressure ?? '120/80',
      spO2: record.spO2 ?? existing.vitals?.spO2 ?? 98,
      temperature: record.temperature ?? existing.vitals?.temperature ?? 36.6,
      chiefComplaint: record.chiefComplaint || 'Routine Checkup',
      diagnosis: record.diagnosis || 'Under Evaluation',
      notes: record.notes || '',
    };

    const updatedVitals =
      normalizeVitals({
        ...existing.vitals,
        heartRate: fullRecord.heartRate,
        bloodPressure: fullRecord.bloodPressure,
        spO2: fullRecord.spO2,
        temperature: fullRecord.temperature,
      });

    const existingSymptoms = Array.isArray(existing.symptoms)
      ? existing.symptoms
      : (typeof existing.symptoms === 'string' ? [existing.symptoms] : []);

    const updatedSymptoms = fullRecord.chiefComplaint && !existingSymptoms.includes(fullRecord.chiefComplaint)
      ? [fullRecord.chiefComplaint, ...existingSymptoms]
      : existingSymptoms;

    const merged: Patient & { _isEdited?: boolean; isLocallyEdited?: boolean } = {
      ...existing,
      vitals: updatedVitals,
      symptoms: updatedSymptoms,
      clinicalRecords: [fullRecord, ...(existing.clinicalRecords || [])],
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      _isEdited: true,
      isLocallyEdited: true,
    };

    const result = calculateLocalAssessment(merged);
    merged.status = result.priority;
    merged.treatmentStatus = result.treatmentStatus;
    merged.latestAssessment = result.assessment;

    updateAddedPatientStorage(merged);
    patients[index] = merged;
    saveStoredPatients(patients);

    return merged;
  },

  /* =======================================================
     GET CLINICAL DATA
     ======================================================= */

  getClinicalData: async (
    patientId: string
  ): Promise<BackendClinicalData | null> => {
    const numericId = Number(patientId.replace(/\D/g, ''));
    if (!Number.isFinite(numericId) || numericId <= 0) {
      return null;
    }

    try {
      return await apiFetch<BackendClinicalData>(
        `/patients/${numericId}/clinical-data`
      );
    } catch {
      return null;
    }
  },

  getPatientClinicalData: async (
    patientId: string
  ): Promise<BackendClinicalData | null> => {
    return patientService.getClinicalData(patientId);
  },
};

export default patientService;
