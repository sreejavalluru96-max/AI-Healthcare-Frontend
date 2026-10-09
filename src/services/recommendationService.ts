import { Patient } from '../types';

export interface AiRecommendationDetails {
  assessment: string;
  recommendedMedication: string;
  reason: string;
  isEmergency?: boolean;
  suggestedName?: string;
  suggestedDosage?: string;
  suggestedFrequency?: string;
  suggestedInstructions?: string;
}

/**
 * Evaluates the patient's actual clinical parameters (symptoms, chief complaint,
 * vitals, AI risk score, priority level) and returns a condition-based medication
 * recommendation with Assessment, Recommended Medication, and Reason.
 *
 * NOTE: Strictly advisory decision support for attending physicians.
 * Does NOT auto-prescribe or alter DB records autonomously.
 */
export const getAiMedicationRecommendationDetails = (
  patient: Patient | null | undefined
): AiRecommendationDetails => {
  if (!patient) {
    return {
      assessment: 'No clinical data available for evaluation.',
      recommendedMedication: 'N/A',
      reason: 'No patient selected.',
      isEmergency: false,
    };
  }

  const symptomsList: string[] = Array.isArray(patient.symptoms)
    ? patient.symptoms
    : typeof patient.symptoms === 'string'
    ? [patient.symptoms]
    : [];

  const chiefComplaint = patient.clinicalRecords?.[0]?.chiefComplaint || '';
  const notesText = patient.clinicalRecords?.[0]?.notes || '';
  const allSymptomText = `${symptomsList.join(' ')} ${chiefComplaint} ${notesText}`.toLowerCase();

  const vitals = patient.vitals || {};
  const spO2 = Number(vitals.spO2 ?? 98);
  const temp = Number(vitals.temperature ?? 36.6);
  const heartRate = Number(vitals.heartRate ?? 75);
  const bpStr = String(vitals.bloodPressure || '120/80');

  const sysBp =
    typeof vitals.systolicBP === 'number' && Number.isFinite(vitals.systolicBP)
      ? vitals.systolicBP
      : (parseInt(bpStr.split('/')[0], 10) || 120);

  const priority = String(patient.status || 'STABLE').toUpperCase();
  const riskScore = Number(patient.latestAssessment?.riskScore ?? 20);

  // Critical Emergency Evaluation
  const isEmergency =
    priority === 'CRITICAL' ||
    priority === 'HIGH' ||
    riskScore >= 65 ||
    spO2 < 92 ||
    sysBp > 165 ||
    heartRate > 125 ||
    /chest\s*pain|breathlessness|shortness of breath|difficulty breathing|cyanosis|unconscious|stroke|severe bleeding/.test(allSymptomText);

  if (isEmergency) {
    return {
      assessment: `Acute emergency risk profile (Risk Score: ${riskScore}/100, Priority: ${priority}, SpO2: ${spO2}%, BP: ${bpStr}).`,
      recommendedMedication: 'Urgent Physician Emergency Evaluation Required',
      reason: 'Urgent medical evaluation and emergency management required. Medication should be determined by treating physician based on direct emergency clinical assessment.',
      isEmergency: true,
      suggestedName: '',
      suggestedDosage: '',
      suggestedFrequency: '',
      suggestedInstructions: '',
    };
  }

  // Febrile / Fever Presentation
  if (/fever|febrile|pyrexia|chills|high temp/.test(allSymptomText) || temp >= 37.8) {
    return {
      assessment: `Febrile presentation evaluated with body temperature (${temp}°C) and reported systemic symptoms.`,
      recommendedMedication: 'Paracetamol 500 mg',
      reason: 'Antipyretic and analgesic therapy for fever control and symptomatic temperature management.',
      isEmergency: false,
      suggestedName: 'Paracetamol',
      suggestedDosage: '500 mg',
      suggestedFrequency: 'Twice daily',
      suggestedInstructions: 'Take after meals with water as needed for fever control.',
    };
  }

  // Knee / Joint / Musculoskeletal Pain Presentation
  if (/knee|joint|back|arthritis|swelling|leg pain|sprain/.test(allSymptomText)) {
    return {
      assessment: `Localized musculoskeletal / joint pain presentation with stable systemic vitals (BP: ${bpStr}, SpO2: ${spO2}%).`,
      recommendedMedication: 'Ibuprofen 400 mg',
      reason: 'Analgesic and anti-inflammatory relief for joint and musculoskeletal discomfort.',
      isEmergency: false,
      suggestedName: 'Ibuprofen',
      suggestedDosage: '400 mg',
      suggestedFrequency: 'Twice daily',
      suggestedInstructions: 'Take strictly after meals with water.',
    };
  }

  // Headache / Migraine Presentation
  if (/headache|migraine|cephalgia|head pain/.test(allSymptomText)) {
    return {
      assessment: `Cephalgia / Headache presentation evaluated with stable vital signs and absence of acute neurological red flags.`,
      recommendedMedication: 'Paracetamol 500 mg',
      reason: 'Symptomatic analgesic relief for acute headache in stable outpatient context.',
      isEmergency: false,
      suggestedName: 'Paracetamol',
      suggestedDosage: '500 mg',
      suggestedFrequency: 'Twice daily',
      suggestedInstructions: 'Take after meals with water as needed for headache relief.',
    };
  }

  // Upper Respiratory Presentation
  if (/cough|cold|sore throat|bronchitis|congestion|runny nose/.test(allSymptomText)) {
    return {
      assessment: `Upper respiratory presentation evaluated with normal oxygen saturation (SpO2: ${spO2}%).`,
      recommendedMedication: 'Cough / Respiratory Suppressant',
      reason: 'Symptomatic relief for airway congestion, cough, and upper throat irritation.',
      isEmergency: false,
      suggestedName: 'Cough Suppressant',
      suggestedDosage: '10 mL',
      suggestedFrequency: 'Three times daily',
      suggestedInstructions: 'Take after food for airway relief.',
    };
  }

  // Gastrointestinal Presentation
  if (/abdominal|stomach|nausea|vomiting|gastric|acidity|indigestion/.test(allSymptomText)) {
    return {
      assessment: `Upper gastrointestinal discomfort presentation evaluated with recorded vital signs.`,
      recommendedMedication: 'Antacid Gel',
      reason: 'Symptomatic relief for upper abdominal tightness, hyperacidity, or stomach discomfort.',
      isEmergency: false,
      suggestedName: 'Antacid Gel',
      suggestedDosage: '10 mL',
      suggestedFrequency: 'Twice daily',
      suggestedInstructions: 'Take after meals.',
    };
  }

  // High Blood Pressure Presentation
  if (sysBp > 140) {
    return {
      assessment: `Elevated blood pressure presentation (${bpStr}) with stable peripheral oxygenation.`,
      recommendedMedication: 'Cardiovascular Evaluation & Supportive Care',
      reason: 'Blood pressure monitoring and clinical observation pending attending physician review.',
      isEmergency: false,
      suggestedName: '',
      suggestedDosage: '',
      suggestedFrequency: '',
      suggestedInstructions: '',
    };
  }

  // General Outpatient Stable Presentation
  const symptomsFormatted = symptomsList.length > 0 ? symptomsList.join(', ') : 'routine clinical presentation';
  return {
    assessment: `General outpatient clinical presentation (${symptomsFormatted}) with stable vitals (HR: ${heartRate} bpm, SpO2: ${spO2}%, BP: ${bpStr}).`,
    recommendedMedication: 'Multivitamin Supplement',
    reason: 'General supportive therapy for stable outpatient presentation.',
    isEmergency: false,
    suggestedName: 'Multivitamin Supplement',
    suggestedDosage: '1 Tablet',
    suggestedFrequency: 'Once daily',
    suggestedInstructions: 'Take after breakfast with water.',
  };
};

export const generateTreatmentRecommendation = (patient: Patient | null | undefined): string => {
  const rec = getAiMedicationRecommendationDetails(patient);
  return `${rec.assessment} Recommended: ${rec.recommendedMedication}. Reason: ${rec.reason}`;
};
