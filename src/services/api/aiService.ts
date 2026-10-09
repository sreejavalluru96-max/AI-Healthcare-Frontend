import { AiAssessment, Patient, PriorityLevel, MedicationConsideration, GeneralCarePlan, TreatmentStatus } from '../../types';
import { getStoredPatients, saveStoredPatients } from '../storageService';
import { apiFetch } from './apiClient';
import { patientService } from './patientService';

export interface BackendAiAssessment {
  assessment_id: number;
  encounter_id: number;
  patient_id: number;
  risk_score: number;
  risk_level: string;
  priority_score: number;
  priority_level: string;
  explanation: string;
}

function mapPriorityLevel(level?: string): PriorityLevel {
  if (!level) return 'STABLE';
  const u = level.toUpperCase();
  if (u === 'CRITICAL') return 'CRITICAL';
  if (u === 'HIGH') return 'HIGH';
  if (u === 'MODERATE') return 'MODERATE';
  if (u === 'LOW' || u === 'STABLE') return 'STABLE';
  return 'STABLE';
}

const generateGeneralCarePlan = (patient: Patient, riskScore: number, priority: PriorityLevel): GeneralCarePlan => {
  const symptomText = (patient.symptoms || []).join(' ').toLowerCase();
  const vitals = patient.vitals;

  // 1. Mild Fever / Pyrexia
  if (symptomText.includes('fever') || vitals.temperature > 37.5) {
    return {
      possibleIssue: 'Mild fever / general pyrexia',
      generalCare: [
        'Take adequate rest and avoid strenuous physical activity while symptomatic.',
        'Monitor body temperature periodically (every 4–6 hours).',
        'Maintain a comfortable room temperature and wear light, breathable clothing.',
      ],
      foodDiet: [
        'Prefer light, easily digestible meals (warm broths, soups, khichdi).',
        'Include fresh fruits and vegetables rich in vitamin C as tolerated.',
        'Avoid very heavy, greasy, or excessively spicy foods.',
      ],
      hydration: [
        'Maintain adequate fluid intake to support body thermoregulation.',
        'Water, warm fluids, and suitable herbal teas can be consumed based on tolerance.',
      ],
      restLifestyle: [
        'Ensure 8–9 hours of restful sleep in a quiet, ventilated space.',
        'Minimize physical exertion and heavy cognitive strain.',
      ],
      precautions: [
        'Monitor body temperature trends closely.',
        'Watch for developing symptoms or signs of dehydration.',
        'Maintain appropriate personal and hand hygiene.',
      ],
      whenToSeekMedicalAttention: [
        'Fever becomes persistent or exceeds 38.5°C.',
        'New breathing difficulty, severe cough, or chest tightness develops.',
        'Severe weakness, confusion, or persistent vomiting appears.',
      ],
      mockMedication: {
        medication: 'Paracetamol 500mg',
        reason: 'Symptomatic fever and discomfort management consideration.',
        caution: 'Verify liver function baseline and do not exceed recommended dosage.',
        approvalRequired: true,
      },
      doctorReviewNotice:
        'AI-assisted decision support only. Not a medical diagnosis. Medication suggestions are mock examples and require physician approval before use.',
    };
  }

  // 2. Mild Headache / Tension
  if (symptomText.includes('headache') || symptomText.includes('migraine')) {
    return {
      possibleIssue: 'Mild headache / tension symptoms',
      generalCare: [
        'Rest in a quiet, dimly lit, and comfortable environment.',
        'Maintain regular sleep patterns and avoid sleep deprivation.',
        'Avoid prolonged screen exposure (phones, laptops) if it worsens symptoms.',
      ],
      foodDiet: [
        'Maintain regular balanced meals without skipping.',
        'Limit foods or caffeinated beverages known to trigger individual headaches.',
        'Avoid excessively processed or high-sodium foods.',
      ],
      hydration: [
        'Maintain adequate fluid intake throughout the day (water, clear liquids).',
        'Dehydration is a common headache trigger; ensure steady oral intake.',
      ],
      restLifestyle: [
        'Practice mild relaxation techniques or apply a cool compress to forehead.',
        'Avoid loud environments and harsh lighting.',
      ],
      precautions: [
        'Monitor headache severity, location, and duration.',
        'Avoid strenuous physical exertion if symptoms intensify.',
      ],
      whenToSeekMedicalAttention: [
        'Sudden onset of severe, excruciating headache ("thunderclap").',
        'New neurological symptoms (vision changes, numbness, weakness, neck stiffness).',
        'Persistent or progressively worsening headache despite adequate rest.',
      ],
      mockMedication: {
        medication: 'Mild Analgesic Consideration',
        reason: 'Symptomatic headache relief consideration.',
        caution: 'Check allergy history and avoid taking on an empty stomach.',
        approvalRequired: true,
      },
      doctorReviewNotice:
        'AI-assisted decision support only. Not a medical diagnosis. Medication suggestions are mock examples and require physician approval before use.',
    };
  }

  // 3. Mild Dehydration / Fluid Deficit
  if (symptomText.includes('dehydration') || symptomText.includes('thirst') || symptomText.includes('fluid')) {
    return {
      possibleIssue: 'Mild dehydration & fluid deficit',
      generalCare: [
        'Rest in a cool, ventilated environment.',
        'Increase fluid intake gradually in small, frequent sips as tolerated.',
      ],
      foodDiet: [
        'Light, balanced meals containing liquid content (broths, clear soups).',
        'Foods rich in natural fluids and electrolytes (bananas, coconut water, watermelons).',
      ],
      hydration: [
        'Water and appropriate fluid intake.',
        'Oral Rehydration Solution (ORS) may be considered when clinically appropriate.',
      ],
      restLifestyle: [
        'Avoid physical exertion or direct heat exposure.',
        'Rest in a shaded, ventilated space.',
      ],
      precautions: [
        'Monitor for dizziness, lightheadedness, or orthostatic weakness.',
        'Monitor urine volume and color (dark urine indicates dehydration).',
      ],
      whenToSeekMedicalAttention: [
        'Persistent vomiting or inability to retain oral fluids.',
        'Severe dizziness, fainting spells, or confusion.',
        'Significant reduction in urine output or extreme lethargy.',
      ],
      mockMedication: {
        medication: 'Oral Rehydration Salts (ORS)',
        reason: 'Replenish essential electrolytes and fluid balance.',
        caution: 'Monitor oral fluid tolerance and renal history.',
        approvalRequired: true,
      },
      doctorReviewNotice:
        'AI-assisted decision support only. Not a medical diagnosis. Medication suggestions are mock examples and require physician approval before use.',
    };
  }

  // 4. Mild Cold / Upper Respiratory / Seasonal
  if (
    symptomText.includes('cold') ||
    symptomText.includes('cough') ||
    symptomText.includes('throat') ||
    symptomText.includes('runny') ||
    symptomText.includes('allerg')
  ) {
    return {
      possibleIssue: 'Mild upper-respiratory / seasonal symptoms',
      generalCare: [
        'Ensure adequate physical rest and comfortable indoor humidity.',
        'Monitor respiratory symptoms periodically.',
        'Use steam inhalation or warm saline gargles for throat discomfort.',
      ],
      foodDiet: [
        'Warm fluids, herbal teas, or warm broths to soothe throat irritation.',
        'Balanced, light meals rich in natural vitamins.',
        'Avoid cold beverages or throat-irritating food items.',
      ],
      hydration: [
        'Maintain generous fluid intake to help thin respiratory secretions.',
      ],
      restLifestyle: [
        'Elevate head slightly with extra pillows during sleep if congested.',
        'Ensure good indoor air ventilation.',
      ],
      precautions: [
        'Practice proper respiratory hygiene (cover mouth when coughing/sneezing).',
        'Avoid close contact with vulnerable individuals if infectious symptoms are suspected.',
        'Monitor for worsening breathing symptoms or chest tightness.',
      ],
      whenToSeekMedicalAttention: [
        'Development of shortness of breath, wheezing, or labored breathing.',
        'Persistent high fever or purulent sputum.',
        'Chest pain or significant decline in oxygen saturation.',
      ],
      mockMedication: {
        medication: 'Symptomatic Antihistamine / Saline Gargle',
        reason: 'Symptomatic relief for mild throat and nasal discomfort.',
        caution: 'Avoid antibiotics unless specifically prescribed by a physician.',
        approvalRequired: true,
      },
      doctorReviewNotice:
        'AI-assisted decision support only. Not a medical diagnosis. Medication suggestions are mock examples and require physician approval before use.',
    };
  }

  // 5. Mild Digestive / Gastric Discomfort
  if (
    symptomText.includes('abdominal') ||
    symptomText.includes('nausea') ||
    symptomText.includes('gastric') ||
    symptomText.includes('stomach')
  ) {
    return {
      possibleIssue: 'Mild digestive / abdominal discomfort',
      generalCare: [
        'Rest in a comfortable position (upright after eating).',
        'Avoid lying down immediately after meals.',
      ],
      foodDiet: [
        'Bland, non-spicy, low-fat meals (toast, rice, bananas, applesauce).',
        'Eat smaller, more frequent meals rather than large heavy ones.',
        'Avoid fried, greasy, or highly acidic food items.',
      ],
      hydration: [
        'Sip small amounts of water, clear fluids, or ginger tea.',
      ],
      restLifestyle: [
        'Avoid tight clothing around the abdomen.',
        'Avoid strenuous physical exertion right after meals.',
      ],
      precautions: [
        'Monitor for abdominal pain localization or persistent vomiting.',
      ],
      whenToSeekMedicalAttention: [
        'Severe localized abdominal pain, severe tenderness, or rigidity.',
        'Persistent vomiting, blood in stool, or high fever.',
        'Inability to keep liquids down for > 12 hours.',
      ],
      mockMedication: {
        medication: 'Antacid Gel / Solution',
        reason: 'Symptomatic relief for gastric acidity and upper stomach discomfort.',
        caution: 'Use only as a temporary measure; physician review required.',
        approvalRequired: true,
      },
      doctorReviewNotice:
        'AI-assisted decision support only. Not a medical diagnosis. Medication suggestions are mock examples and require physician approval before use.',
    };
  }

  // 6. Default General Fatigue / Rest Guidance
  return {
    possibleIssue: 'General fatigue & minor physical exertion',
    generalCare: [
      'Ensure adequate quality sleep (7–9 hours).',
      'Pace daily activities and take scheduled rest breaks.',
      'Avoid physical overexertion and heavy mental burnout.',
    ],
    foodDiet: [
      'Balanced meals containing adequate protein, complex carbohydrates, fruits, and vegetables.',
      'Avoid relying on excessive caffeine or high-sugar energy drinks.',
    ],
    hydration: [
      'Maintain consistent, adequate fluid intake throughout the day.',
    ],
    restLifestyle: [
      'Structure calm rest intervals and avoid sleep deprivation.',
      'Maintain a clean, quiet sleep environment.',
    ],
    precautions: [
      'Monitor persistence or worsening of tiredness over time.',
      'Review underlying medical history and dietary habits.',
    ],
    whenToSeekMedicalAttention: [
      'Severe, debilitating, or sudden onset exhaustion.',
      'Fainting, dizziness, or loss of consciousness.',
      'Chest pain, palpitations, or shortness of breath.',
    ],
    mockMedication: {
      medication: 'Nutritional Support Consideration',
      reason: 'Mock consideration for general recovery support if dietary gaps exist.',
      caution: 'Requires physician approval before use.',
      approvalRequired: true,
    },
    doctorReviewNotice:
      'AI-assisted decision support only. Not a medical diagnosis. Medication suggestions are mock examples and require physician approval before use.',
  };
};

export const aiService = {
  // GET /ai-assessment/:encounter_id
  getAiAssessmentByEncounterId: async (encounterId: number): Promise<BackendAiAssessment> => {
    return apiFetch<BackendAiAssessment>(`/ai-assessment/${encounterId}`);
  },

  // Connect AI assessment functionality to GET /ai-assessment/{encounter_id}
  runAssessment: async (patientId: string): Promise<AiAssessment> => {
    try {
      // 1. Fetch clinical data to obtain encounter ID
      const clinicalData = await patientService.getPatientClinicalData(patientId);
      const encounterId = clinicalData?.encounters?.[0]?.encounter_id;

      if (encounterId) {
        // 2. Call FastAPI GET /ai-assessment/{encounter_id}
        const backendAss = await aiService.getAiAssessmentByEncounterId(encounterId);
        const patient = await patientService.getPatientById(patientId);
        const priority = mapPriorityLevel(backendAss.priority_level || backendAss.risk_level);

        const newAssessment: AiAssessment = {
          id: `AI-${backendAss.assessment_id}`,
          patientId: patientId,
          patientName: patient?.name || backendAss.patient_id.toString(),
          riskScore: backendAss.risk_score,
          priority,
          assessedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          riskFactors: backendAss.explanation
            ? [backendAss.explanation]
            : ['FastAPI AI Clinical Assessment Completed'],
          explanation: backendAss.explanation || 'FastAPI clinical risk assessment executed successfully.',
          recommendedActions: [
            'Physician review of automated triage assessment',
            'Continuous monitoring of baseline vitals',
            'Follow treatment workflow guidance',
          ],
          generalCarePlan: patient ? generateGeneralCarePlan(patient, backendAss.risk_score, priority) : undefined,
          status: 'Active',
        };

        // Cache assessment in patient record
        if (patient) {
          const patients = getStoredPatients();
          const index = patients.findIndex((p) => p.id === patient.id || p.id === patientId);
          if (index !== -1) {
            patients[index].latestAssessment = newAssessment;
            if (!patients[index].assessmentHistory) patients[index].assessmentHistory = [];
            patients[index].assessmentHistory?.unshift(newAssessment);
            saveStoredPatients(patients);
          }
        }

        return newAssessment;
      }
    } catch (error) {
      console.warn(`[aiService] Backend GET /ai-assessment failed or no encounter found for ${patientId}. Using fallback evaluation engine:`, error);
    }

    // Fallback: rule-based engine if backend assessment is unavailable
    const patients = getStoredPatients();
    const index = patients.findIndex((p) => p.id === patientId);
    if (index === -1) throw new Error('Patient not found');

    const patient = patients[index];
    const { spO2, heartRate, systolicBP, temperature, respiratoryRate, bloodGlucose } = patient.vitals;

    const riskFactors: string[] = [];
    let calculatedScore = 20;

    if (spO2 < 85) {
      riskFactors.push(`Critical Hypoxia (SpO2 ${spO2}%)`);
      calculatedScore += 35;
    } else if (spO2 <= 91) {
      riskFactors.push(`Moderate Hypoxia (SpO2 ${spO2}%)`);
      calculatedScore += 22;
    } else if (spO2 <= 94) {
      riskFactors.push(`Borderline SpO2 (${spO2}%)`);
      calculatedScore += 10;
    }

    if (heartRate > 125) {
      riskFactors.push(`Severe Tachycardia (${heartRate} bpm)`);
      calculatedScore += 25;
    } else if (heartRate > 100) {
      riskFactors.push(`Elevated Heart Rate (${heartRate} bpm)`);
      calculatedScore += 15;
    } else if (heartRate < 50) {
      riskFactors.push(`Bradycardia (${heartRate} bpm)`);
      calculatedScore += 20;
    }

    if (systolicBP > 165) {
      riskFactors.push(`Hypertensive Crisis (${systolicBP} mmHg)`);
      calculatedScore += 20;
    } else if (systolicBP > 140) {
      riskFactors.push(`Elevated Blood Pressure (${systolicBP} mmHg)`);
      calculatedScore += 10;
    }

    if (temperature >= 38.8) {
      riskFactors.push(`High Grade Pyrexia (${temperature}°C)`);
      calculatedScore += 15;
    } else if (temperature >= 37.8) {
      riskFactors.push(`Low Grade Fever (${temperature}°C)`);
      calculatedScore += 8;
    }

    if (respiratoryRate >= 26) {
      riskFactors.push(`Tachypnea (${respiratoryRate}/min)`);
      calculatedScore += 15;
    }

    if (bloodGlucose > 200) {
      riskFactors.push(`Hyperglycemia (${bloodGlucose} mg/dL)`);
      calculatedScore += 10;
    }

    const symptomText = (patient.symptoms || []).join(' ').toLowerCase();
    if (symptomText.includes('chest pain') || symptomText.includes('cyanosis') || symptomText.includes('severe')) {
      riskFactors.push('Emergency Presenting Symptoms');
      calculatedScore += 20;
    }

    calculatedScore = Math.min(Math.max(calculatedScore, 12), 96);

    let priority: PriorityLevel = 'STABLE';
    let targetTreatmentStatus: TreatmentStatus = 'ROUTINE';
    let explanation = '';
    let recommendedActions: string[] = [];

    if (calculatedScore >= 80) {
      priority = 'CRITICAL';
      targetTreatmentStatus = 'WAITING';
      explanation = `Patient classified as CRITICAL emergency risk (Score ${calculatedScore}/100). Immediate resuscitation required.`;
      recommendedActions = [
        'Immediate clinical evaluation and emergency treatment workflow',
        'Assign available doctor immediately',
        'Continuous high-flow oxygen and ECG monitoring',
        'Prepare emergency resuscitation bed',
      ];
    } else if (calculatedScore >= 60) {
      priority = 'HIGH';
      targetTreatmentStatus = 'WAITING';
      explanation = `Patient classified as HIGH emergency risk (Score ${calculatedScore}/100). Placed in Priority Queue.`;
      recommendedActions = [
        'Priority clinical evaluation & doctor assignment',
        'Continuous vital signs tracking (SpO2, HR, BP)',
        'Review diagnostic blood work and telemetry',
      ];
    } else if (calculatedScore >= 30) {
      priority = 'MODERATE';
      targetTreatmentStatus = 'OBSERVATION';
      explanation = `Patient assigned MODERATE risk score (${calculatedScore}/100). Placed under clinical observation.`;
      recommendedActions = [
        'Place patient under clinical observation & follow-up',
        'Continue monitoring vital signs every 30-60 minutes',
        'Review available diagnostic reports',
      ];
    } else {
      priority = 'STABLE';
      targetTreatmentStatus = 'ROUTINE';
      explanation = `Low immediate risk score (${calculatedScore}/100). Vital parameters remain stable.`;
      recommendedActions = [
        'Continue routine clinical monitoring',
        'Schedule standard outpatient follow-up evaluation',
        'Maintain appropriate hydration and rest',
      ];
    }

    const newAssessment: AiAssessment = {
      id: `AI-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      patientName: patient.name,
      riskScore: calculatedScore,
      priority,
      assessedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      riskFactors: riskFactors.length > 0 ? riskFactors : ['Vital signs within normal limits'],
      explanation,
      recommendedActions,
      generalCarePlan: generateGeneralCarePlan(patient, calculatedScore, priority),
      status: 'Active',
    };

    patients[index].status = priority;
    if (patients[index].treatmentStatus !== 'IN_PROGRESS' && patients[index].treatmentStatus !== 'COMPLETED') {
      patients[index].treatmentStatus = targetTreatmentStatus;
    }
    patients[index].latestAssessment = newAssessment;
    if (!patients[index].assessmentHistory) {
      patients[index].assessmentHistory = [];
    }
    patients[index].assessmentHistory?.unshift(newAssessment);
    patients[index].updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

    saveStoredPatients(patients);
    return newAssessment;
  },

  // GET /ai-assessment/history
  getAssessmentHistory: async (): Promise<AiAssessment[]> => {
    const patients = getStoredPatients();
    const history: AiAssessment[] = [];
    patients.forEach((p) => {
      if (p.assessmentHistory && p.assessmentHistory.length > 0) {
        history.push(...p.assessmentHistory);
      } else if (p.latestAssessment) {
        history.push(p.latestAssessment);
      }
    });
    return history.sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());
  },
};
