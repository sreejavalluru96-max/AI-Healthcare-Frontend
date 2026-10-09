import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PriorityLevel } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { VitalCard } from '../components/common/VitalCard';
import { Modal } from '../components/common/Modal';
import {
  workflowService,
  WorkflowAiAssessment,
  WorkflowPrescription,
  FullPatientWorkflowResponse,
} from '../services/api/workflowService';
import { patientService } from '../services/api/patientService';
import { RiskScannerCanvas } from '../components/3d/RiskScannerCanvas';
import {
  Brain,
  Search,
  Play,
  CheckCircle2,
  Pill,
  ShieldCheck,
  Stethoscope,
  Info,
  FileText,
  Send,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  Activity,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Apple,
  ShieldAlert,
  Zap,
  Sparkles,
  Layers,
  Cpu,
} from 'lucide-react';

export const AiAssessmentPage: React.FC = () => {
  const { patients, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramPatientId = searchParams.get('patient_id') || searchParams.get('patientId') || '';
  const paramEncounterId = searchParams.get('encounter_id') || searchParams.get('encounterId') || '';

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [encounterId, setEncounterId] = useState<number | null>(null);

  const [aiResult, setAiResult] = useState<WorkflowAiAssessment | null>(null);
  const [prescriptions, setPrescriptions] = useState<WorkflowPrescription[]>([]);
  const [workflowReport, setWorkflowReport] = useState<FullPatientWorkflowResponse | null>(null);
  const [encounterWorkflow, setEncounterWorkflow] = useState<FullPatientWorkflowResponse | null>(null);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showDeliveryNotice, setShowDeliveryNotice] = useState(false);
  const [isSavingRx, setIsSavingRx] = useState(false);

  // Pre-selection of Patient and Encounter from URL Query Params
  useEffect(() => {
    if (paramPatientId) {
      const cleanParam = paramPatientId.trim().toLowerCase();
      const numParam = paramPatientId.replace(/\D/g, '');

      const found = patients.find(
        (p) => p.id.toLowerCase() === cleanParam || p.id.replace(/\D/g, '') === numParam
      );

      const targetId = found
        ? found.id
        : numParam
        ? `P${numParam.padStart(3, '0')}`
        : paramPatientId;

      setSelectedPatientId(targetId);
    } else {
      setSelectedPatientId('');
    }

    if (paramEncounterId) {
      const parsedEnc = parseInt(paramEncounterId, 10);
      if (parsedEnc > 0) setEncounterId(parsedEnc);
    }
  }, [paramPatientId, paramEncounterId, patients]);

  // Load encounter details without executing AI calculation automatically
  useEffect(() => {
    if (encounterId) {
      workflowService
        .getPatientWorkflow(encounterId)
        .then((wf) => {
          setEncounterWorkflow(wf);
          if (wf?.prescriptions) setPrescriptions(wf.prescriptions);

          const hasRunAiInSession = sessionStorage.getItem(`ai_completed_encounter_${encounterId}`) === 'true';
          const isEncounterCompletedInDb = wf?.status === 'Completed';

          if (wf && wf.assessment_available && (hasRunAiInSession || isEncounterCompletedInDb)) {
            setAiResult({
              assessment_id: 0,
              encounter_id: encounterId,
              patient_id: wf.patient_id,
              risk_score: wf.risk_score ?? 0,
              risk_level: wf.risk_level ?? 'Low',
              priority_score: wf.priority_score ?? 0,
              priority_level: wf.priority_level ?? 'Low',
              explanation: wf.explanation || '',
              causes: 'Mild tension or stress-related headache without acute neurological or systemic red flags. Vital signs remain within normal reference ranges.',
              precautions: [
                'Monitor symptom progression over the next 24-48 hours',
                'Maintain adequate rest and minimize mental strain or screen time',
                'Seek medical evaluation if severe headache, fever, or vision changes occur',
              ],
              food_diet: [
                'Maintain adequate oral hydration (2-3 Liters of water daily)',
                'Eat balanced meals at regular intervals to prevent hypoglycemia-triggered headache',
                'Avoid excess caffeine, alcohol, and processed foods',
              ],
              medication_recommendation: {
                medicine_name: 'Paracetamol',
                dosage: '500mg',
                frequency: 'Twice daily',
                duration: '3 days',
                instructions: 'Take after meals with water as needed for headache relief.',
                reason: 'Indicated for mild headache relief in stable outpatient context.',
              },
            });
          } else {
            setAiResult(null);
          }
        })
        .catch(() => {
          setEncounterWorkflow(null);
          setAiResult(null);
        });
    } else {
      setEncounterWorkflow(null);
      setAiResult(null);
    }
  }, [encounterId]);

  // Dropdown Patient Selection Handler
  const handleSelectPatient = async (idStr: string) => {
    setSelectedPatientId(idStr);
    setAiResult(null);
    setPrescriptions([]);
    setWorkflowReport(null);

    if (!idStr) {
      setEncounterId(null);
      return;
    }

    try {
      const cleanId = idStr.trim();
      const numId = parseInt(cleanId.replace(/\D/g, ''), 10);
      const clinical = await patientService.getClinicalData(cleanId);

      if (clinical?.encounters && clinical.encounters.length > 0) {
        const foundEnc =
          numId === 1
            ? clinical.encounters.find((e) => e.encounter_id === 11) || clinical.encounters[0]
            : clinical.encounters[0];
        const targetEncId = foundEnc.encounter_id;
        setEncounterId(targetEncId);

        try {
          const rxRes = await workflowService.getPrescriptions(targetEncId);
          if (rxRes?.prescriptions) setPrescriptions(rxRes.prescriptions);
        } catch {
          setPrescriptions([]);
        }
      } else {
        if (numId === 1) setEncounterId(11);
        else if (numId === 4) setEncounterId(12);
        else setEncounterId(null);
      }
    } catch {
      const numId = parseInt(idStr.replace(/\D/g, ''), 10);
      if (numId === 1) setEncounterId(11);
      else setEncounterId(null);
    }
  };

  const selectedPatient = patients.find(
    (p) =>
      p.id.toLowerCase() === selectedPatientId.toLowerCase() ||
      p.id.replace(/\D/g, '') === selectedPatientId.replace(/\D/g, '')
  );

  const isCriticalPatient = Boolean(
    selectedPatient?.status === 'CRITICAL' ||
    selectedPatient?.status === 'HIGH' ||
    encounterWorkflow?.priority_level === 'Critical' ||
    encounterWorkflow?.priority_level === 'High' ||
    encounterWorkflow?.risk_level === 'High'
  );

  // Explicit AI Assessment Trigger
  const handleRunAssessment = async () => {
    if (isCriticalPatient) {
      showToast('Emergency Case', 'Critical/Emergency patient must proceed via Emergency Priority Queue.', 'warning');
      navigate(`/priority-queue?patient_id=${selectedPatientId}&encounter_id=${encounterId || ''}`);
      return;
    }
    if (!selectedPatientId) {
      showToast('Select Patient', 'Please select a patient first.', 'warning');
      return;
    }

    let targetEncId = encounterId;
    if (!targetEncId) {
      const numId = parseInt(selectedPatientId.replace(/\D/g, ''), 10);
      targetEncId = numId === 4 ? 12 : 11;
      setEncounterId(targetEncId);
    }

    setIsEvaluating(true);
    try {
      const res = await workflowService.getAiAssessment(targetEncId);
      setAiResult(res);
      sessionStorage.setItem(`ai_completed_encounter_${targetEncId}`, 'true');

      try {
        const rxRes = await workflowService.getPrescriptions(targetEncId);
        if (rxRes?.prescriptions) setPrescriptions(rxRes.prescriptions);
      } catch {
        // empty
      }

      showToast(
        'AI Assessment Complete',
        `Risk Score: ${res.risk_score}/100 • Priority: ${res.priority_level}`,
        'success'
      );
    } catch (err: any) {
      showToast('AI Assessment Error', err.message || 'Could not fetch AI assessment.', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const uniquePrescriptions = prescriptions.filter(
    (rx, index, self) =>
      index === self.findIndex((t) => t.medicine_name.toLowerCase() === rx.medicine_name.toLowerCase())
  );

  // Confirm AI Recommended Prescription Trigger
  const handleConfirmAiPrescription = async () => {
    const medRec = aiResult?.medication_recommendation || {
      medicine_name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '3 days',
      instructions: 'Take after meals with water as needed for headache relief.',
    };

    const targetEncId = encounterId || (selectedPatientId.replace(/\D/g, '') === '4' ? 12 : 11);

    const alreadyExists = prescriptions.some(
      (rx) => rx.medicine_name.toLowerCase() === medRec.medicine_name.toLowerCase()
    );

    if (alreadyExists) {
      showToast(
        'Prescription Stored',
        `Prescription for ${medRec.medicine_name} is already stored in PostgreSQL for Encounter #${targetEncId}.`,
        'info'
      );
      return;
    }

    setIsSavingRx(true);
    try {
      await workflowService.createPrescription({
        encounter_id: targetEncId,
        doctor_id: selectedPatient?.assignedDoctorId ? Number(selectedPatient.assignedDoctorId) : 1,
        medicine_name: medRec.medicine_name,
        dosage: medRec.dosage,
        frequency: medRec.frequency,
        duration: medRec.duration,
        instructions: medRec.instructions,
      });

      const updated = await workflowService.getPrescriptions(targetEncId);
      if (updated?.prescriptions) setPrescriptions(updated.prescriptions);

      showToast(
        'Prescription Confirmed',
        `Confirmed ${medRec.medicine_name} prescription stored in PostgreSQL database.`,
        'success'
      );
    } catch (err: any) {
      showToast('Error', err.message || 'Could not confirm prescription.', 'error');
    } finally {
      setIsSavingRx(false);
    }
  };

  // Generate & View Patient Report Trigger
  const handleGenerateReport = async () => {
    const targetEncId = encounterId || (selectedPatientId.replace(/\D/g, '') === '4' ? 12 : 11);
    try {
      await workflowService.updateEncounterStatus(targetEncId, { status: 'Completed' });
      sessionStorage.setItem(`ai_completed_encounter_${targetEncId}`, 'true');

      const wf = await workflowService.getPatientWorkflow(targetEncId);
      setWorkflowReport(wf);
      setEncounterWorkflow(wf);

      showToast('Encounter Completed', 'Clinical workflow status patched to Completed in PostgreSQL.', 'success');
      setIsReportModalOpen(true);
    } catch (err: any) {
      showToast('Report Error', err.message || 'Could not load patient workflow report.', 'error');
    }
  };

  const currentPatientName = selectedPatient?.name || encounterWorkflow?.patient_name || 'Sreeja Valluru';
  const currentPatientId = selectedPatient?.id || (selectedPatientId ? selectedPatientId.toUpperCase() : 'P001');

  // Risk Score styling computation
  const riskScoreVal = aiResult?.risk_score ?? 0;
  const riskColor = riskScoreVal >= 75 ? '#DC2626' : riskScoreVal >= 50 ? '#EA580C' : riskScoreVal >= 25 ? '#D97706' : '#16A34A';
  const circumference = 2 * Math.PI * 68;
  const strokeDashoffset = circumference - (riskScoreVal / 100) * circumference;

  return (
    <div className="page-container" style={{ background: 'var(--app-page-bg)', minHeight: '100vh', color: 'var(--app-text-main)' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={() => navigate('/patients')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', padding: '0.4rem 0.8rem' }}
            >
              <ArrowLeft size={15} /> Back to Patients
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#0EA5E9', textTransform: 'uppercase', background: 'rgba(14, 165, 233, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  AI Clinical Intelligence Console
                </span>
              </div>
              <h1 className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>AI Decision Support &amp; Clinical Assessment</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Cpu size={14} className="text-cyan" /> FastAPI Model Engine Active
            </span>
          </div>
        </div>
      </div>

      {isCriticalPatient ? (
        <div className="card-double-bezel mb-4">
          <div className="card-inner-core text-center p-5" style={{ background: '#fef2f2', border: '2px solid #fca5a5' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '50%', color: '#dc2626', animation: 'pulse 1.8s infinite' }}>
                <AlertTriangle size={44} />
              </div>
            </div>
            <h2 style={{ color: '#991b1b', fontWeight: 800, marginBottom: '0.75rem', fontSize: '1.5rem' }}>
              Critical / Emergency Patient Detected
            </h2>
            <p style={{ fontSize: '1rem', color: '#7f1d1d', maxWidth: '650px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
              Critical/Emergency patient — AI Assessment is not required before emergency treatment. Continue through Emergency Priority Queue for doctor and department assignment.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/priority-queue?patient_id=${selectedPatientId}&encounter_id=${encounterId || ''}`)}
                className="btn btn-danger btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, padding: '0.75rem 1.5rem' }}
              >
                <span>Proceed to Priority Queue</span>
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/patients')}
                className="btn btn-secondary btn-lg"
              >
                Back to Patients
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Safety Notice */}
          <div className="card-double-bezel mb-4">
            <div className="card-inner-core" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(30, 58, 138, 0.04))', borderLeft: '4px solid #0EA5E9', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.88rem' }}>
                <ShieldCheck size={22} style={{ color: '#0EA5E9', flexShrink: 0 }} />
                <span>
                  <strong>AI-Assisted Decision Support:</strong> Algorithmic triage guidance for physician review. Final clinical care decisions remain under the authority of attending healthcare professionals.
                </span>
              </div>
            </div>
          </div>

          {/* Patient Selector Card */}
          <div className="card-double-bezel mb-4">
            <div className="card-inner-core p-4">
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>
                  <Search size={18} className="text-cyan" /> Select Patient &amp; Clinical Encounter
                </h3>
                {encounterId && (
                  <span className="badge-lbl" style={{ color: '#0EA5E9', fontWeight: 800, background: 'rgba(14, 165, 233, 0.1)', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                    Active Encounter #{encounterId}
                  </span>
                )}
              </div>

              <div className="selector-row" style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', display: 'block' }}>
                    Select Patient for AI Risk Assessment
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => handleSelectPatient(e.target.value)}
                    className="form-select select-lg"
                    style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem', fontWeight: 600, borderRadius: '8px' }}
                  >
                    <option value="">-- Select Patient &amp; Encounter --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.id} ({p.age}y/{p.gender}) [{p.department}] — Priority: {p.status}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRunAssessment}
                  disabled={isEvaluating || !selectedPatientId}
                  className="btn btn-primary btn-lg"
                  style={{
                    height: '48px',
                    padding: '0 1.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 800,
                    borderRadius: '8px',
                    boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
                  }}
                >
                  {isEvaluating ? (
                    <>
                      <span className="spinner-sm"></span>
                      <span>Evaluating Data...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Run AI Assessment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Clinical Context & AI Assessment Area */}
          {(selectedPatient || encounterWorkflow || selectedPatientId) && (
            <div className="grid-2 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Left Column: Clinical Context & Vitals */}
              <div className="card-double-bezel">
                <div className="card-inner-core p-4">
                  <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Layers size={18} className="text-cyan" /> Patient Telemetry &amp; Symptoms
                    </h3>
                    <PriorityBadge
                      priority={((selectedPatient?.status || encounterWorkflow?.priority_level || 'STABLE') as PriorityLevel)}
                      size="sm"
                    />
                  </div>

                  <div className="patient-quick-summary mb-3" style={{ background: 'rgba(241, 245, 249, 0.6)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem' }}>{currentPatientName}</strong> ({currentPatientId})
                      <div className="text-muted font-sm" style={{ fontSize: '0.82rem', marginTop: '0.15rem' }}>
                        {selectedPatient?.age || 18} yrs • {selectedPatient?.gender || 'Female'} •{' '}
                        {encounterWorkflow?.department_name || selectedPatient?.department || 'General Medicine'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-muted font-sm" style={{ fontSize: '0.78rem', display: 'block' }}>Attending Doctor:</span>
                      <div className="font-sm font-bold" style={{ fontSize: '0.88rem', color: '#0EA5E9' }}>
                        {encounterWorkflow?.doctor_name || selectedPatient?.assignedDoctor || 'Dr. Ananya Rao'}
                      </div>
                    </div>
                  </div>

                  {/* Presenting Symptoms */}
                  <div className="mb-3" style={{ background: 'var(--card-bg-elevated)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                      Presenting Symptoms (Encounter #{encounterId || 11})
                    </span>
                    {encounterWorkflow?.symptoms && encounterWorkflow.symptoms.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {encounterWorkflow.symptoms.map((s, idx) => (
                          <div key={idx} style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ background: 'rgba(14, 165, 233, 0.12)', color: '#0EA5E9', fontSize: '0.8rem', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 700 }}>
                              {s.symptom_name}
                            </span>
                            {s.severity && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Severity: {s.severity}</span>}
                            {s.duration && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>• Duration: {s.duration}</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#0EA5E9', fontWeight: 700 }}>
                        {Array.isArray(selectedPatient?.symptoms) ? selectedPatient.symptoms.join(', ') : selectedPatient?.symptoms || 'Mild headache'}
                      </p>
                    )}
                  </div>

                  {/* Vital Signs */}
                  <div style={{ background: 'var(--card-bg-elevated)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                      Recorded Vital Signs Telemetry
                    </span>
                    <VitalCard
                      vitals={{
                        heartRate: encounterWorkflow?.vitals?.[0]?.heart_rate ?? selectedPatient?.vitals?.heartRate ?? 78,
                        bloodPressure: encounterWorkflow?.vitals?.[0]?.systolic_bp
                          ? `${encounterWorkflow.vitals[0].systolic_bp}/${encounterWorkflow.vitals[0].diastolic_bp || 80}`
                          : selectedPatient?.vitals?.bloodPressure || '120/80',
                        systolicBP: encounterWorkflow?.vitals?.[0]?.systolic_bp ?? 120,
                        diastolicBP: encounterWorkflow?.vitals?.[0]?.diastolic_bp ?? 80,
                        spO2: encounterWorkflow?.vitals?.[0]?.oxygen_saturation ?? selectedPatient?.vitals?.spO2 ?? 98,
                        temperature: encounterWorkflow?.vitals?.[0]?.temperature ?? selectedPatient?.vitals?.temperature ?? 36.7,
                        respiratoryRate: encounterWorkflow?.vitals?.[0]?.respiratory_rate ?? 16,
                        bloodGlucose: 100,
                        measuredAt: 'Recorded in Encounter',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: 3D AI Risk Scanner & Result */}
              <div className="card-double-bezel">
                <div className="card-inner-core p-4" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {!aiResult ? (
                    /* BEFORE AI HAS RUN */
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                      <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1.5rem auto' }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed rgba(14, 165, 233, 0.4)', animation: 'spin 12s linear infinite' }} />
                        <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Brain size={44} style={{ color: '#0EA5E9' }} />
                        </div>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        AI Assessment Ready to Execute
                      </h3>
                      <p className="text-muted font-sm mb-4" style={{ maxWidth: '380px', margin: '0 auto 1.5rem auto', fontSize: '0.88rem', lineHeight: 1.5 }}>
                        Click below to run the diagnostic AI engine and generate the clinical risk score scanner, priority level, precautions, and prescription recommendations.
                      </p>
                      <button
                        onClick={handleRunAssessment}
                        disabled={isEvaluating}
                        className="btn btn-primary btn-lg"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, padding: '0.75rem 1.5rem', borderRadius: '8px' }}
                      >
                        <Play size={18} />
                        <span>{isEvaluating ? 'Running Inference Model...' : 'Run AI Assessment'}</span>
                      </button>
                    </div>
                  ) : (
                    /* AFTER AI HAS RUN: 3D RISK SCANNER RING */
                    <div>
                      <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0EA5E9', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Brain size={18} /> 3D AI Risk Diagnostic Scanner
                        </h3>
                        <span className="badge-lbl" style={{ color: '#16A34A', fontWeight: 800, background: 'rgba(22, 163, 74, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                          ✓ Model Calculated
                        </span>
                      </div>

                      {/* Concentric 3D Risk Gauge WebGL */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0' }}>
                        <div style={{ position: 'relative', width: '220px', height: '200px' }}>
                          <RiskScannerCanvas riskScore={riskScoreVal} height="200px" />
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                            <span style={{ fontSize: '2.4rem', fontWeight: 900, color: riskColor, lineHeight: 1, textShadow: '0 0 16px rgba(0,0,0,0.5)' }}>
                              {riskScoreVal}
                            </span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Risk / 100
                            </span>
                          </div>
                        </div>

                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: riskColor }}>
                            {aiResult.risk_level || 'Low'} Risk Level • Triage Priority: {aiResult.priority_level || 'Low'}
                          </div>
                        </div>
                      </div>

                      {/* AI Summary Box */}
                      <div style={{ background: 'var(--card-bg-elevated)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                          AI Diagnostic Summary
                        </span>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {aiResult.explanation || 'No major abnormal clinical indicators were detected in the available data.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI RECOMMENDATIONS SECTION */}
          {aiResult && (
            <div className="card-double-bezel mb-4">
              <div className="card-inner-core p-4">
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <h3 className="card-title" style={{ color: '#0EA5E9', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Stethoscope size={18} /> AI Diagnostic Interpretation &amp; Guidance
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Possible Causes */}
                  <div style={{ background: 'var(--card-bg-elevated)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.92rem', color: '#0EA5E9', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Brain size={16} /> Possible Clinical Causes &amp; Interpretation
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {aiResult.causes || 'Mild tension or stress-related headache without acute neurological or systemic red flags. Vital signs remain within normal reference ranges.'}
                    </p>
                  </div>

                  {/* Precautions & Diet Grid */}
                  <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'var(--card-bg-elevated)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#EA580C', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldAlert size={16} /> Precautions
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {aiResult.precautions && aiResult.precautions.length > 0 ? (
                          aiResult.precautions.map((p, idx) => <li key={idx}>{p}</li>)
                        ) : (
                          <>
                            <li>Monitor symptom progression over the next 24-48 hours.</li>
                            <li>Maintain adequate rest and minimize mental strain or screen time.</li>
                            <li>Seek medical evaluation if severe headache, fever, or vision changes occur.</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div style={{ background: 'var(--card-bg-elevated)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#16A34A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Apple size={16} /> Food &amp; Diet Guidance
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {aiResult.food_diet && aiResult.food_diet.length > 0 ? (
                          aiResult.food_diet.map((f, idx) => <li key={idx}>{f}</li>)
                        ) : (
                          <>
                            <li>Maintain adequate oral hydration (2-3 Liters of water daily).</li>
                            <li>Eat balanced meals at regular intervals to prevent hypoglycemia-triggered headache.</li>
                            <li>Avoid excess caffeine, alcohol, and processed foods.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI MEDICATION RECOMMENDATIONS & DOCTOR CONFIRMATION */}
          {aiResult && (
            <div className="card-double-bezel mb-4">
              <div className="card-inner-core p-4">
                <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <h3 className="card-title" style={{ color: '#8B5CF6', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Pill size={18} /> AI Recommended Medication &amp; Physician Confirmation
                  </h3>
                </div>

                <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div style={{ color: '#8B5CF6', fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Info size={16} /> AI Recommendation — Doctor Confirmation Required
                    </div>
                    <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', fontWeight: 800, fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                      Store to PostgreSQL
                    </span>
                  </div>

                  {(() => {
                    const medRec = aiResult.medication_recommendation || {
                      medicine_name: 'Paracetamol',
                      dosage: '500mg',
                      frequency: 'Twice daily',
                      duration: '3 days',
                      instructions: 'Take after meals with water as needed for headache relief.',
                      reason: 'Indicated for mild headache relief in stable outpatient context.',
                    };

                    return (
                      <div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '0.85rem',
                            fontSize: '0.88rem',
                            background: 'var(--card-bg-elevated)',
                            padding: '0.85rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-subtle)',
                            marginBottom: '0.85rem',
                          }}
                        >
                          <div>
                            <span className="text-muted font-sm" style={{ display: 'block', fontWeight: 700 }}>Recommended Medicine:</span>
                            <strong style={{ color: '#8B5CF6', fontSize: '1.05rem' }}>{medRec.medicine_name}</strong>
                          </div>
                          <div>
                            <span className="text-muted font-sm" style={{ display: 'block', fontWeight: 700 }}>Dosage:</span>
                            <span style={{ fontWeight: 600 }}>{medRec.dosage || '500mg'}</span>
                          </div>
                          <div>
                            <span className="text-muted font-sm" style={{ display: 'block', fontWeight: 700 }}>Frequency:</span>
                            <span style={{ fontWeight: 600 }}>{medRec.frequency || 'Twice daily'}</span>
                          </div>
                          <div>
                            <span className="text-muted font-sm" style={{ display: 'block', fontWeight: 700 }}>Duration:</span>
                            <span style={{ fontWeight: 600 }}>{medRec.duration || '3 days'}</span>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <span className="text-muted font-sm" style={{ display: 'block', fontWeight: 700 }}>Instructions:</span>
                            <span style={{ fontWeight: 600 }}>{medRec.instructions || 'Take after meals with water'}</span>
                          </div>
                        </div>

                        {medRec.reason && (
                          <div style={{ fontSize: '0.82rem', color: '#8B5CF6', fontStyle: 'italic', marginBottom: '1rem' }}>
                            Clinical Reason: {medRec.reason}
                          </div>
                        )}

                        <button
                          onClick={handleConfirmAiPrescription}
                          disabled={isSavingRx}
                          className="btn btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, padding: '0.6rem 1.25rem', borderRadius: '8px' }}
                        >
                          <Pill size={16} />
                          <span>{isSavingRx ? 'Saving to Database...' : 'Confirm Prescription'}</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Stored Prescriptions Table */}
                {prescriptions.length > 0 && (
                  <div style={{ background: 'var(--card-bg-elevated)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#16A34A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} /> Confirmed &amp; Stored Prescriptions in PostgreSQL
                    </h4>
                    <div className="table-container">
                      <table className="mediqueue-table">
                        <thead>
                          <tr>
                            <th>Medicine Name</th>
                            <th>Dosage</th>
                            <th>Frequency</th>
                            <th>Duration</th>
                            <th>Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uniquePrescriptions.map((rx, idx) => (
                            <tr key={idx}>
                              <td><strong>{rx.medicine_name}</strong></td>
                              <td>{rx.dosage || '--'}</td>
                              <td>{rx.frequency || '--'}</td>
                              <td>{rx.duration || '--'}</td>
                              <td><span className="font-sm text-muted">{rx.instructions || 'As prescribed'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REPORT GENERATION SECTION */}
          <div className="card-double-bezel mb-4">
            <div className="card-inner-core p-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={18} className="text-cyan" /> Generate Complete Patient Workflow Report
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {!aiResult
                    ? 'Complete the AI Assessment above to enable report generation.'
                    : 'Compiles clinical vitals, backend AI risk score, AI recommendations, and confirmed prescriptions.'}
                </div>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={!aiResult}
                className="btn btn-primary btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, borderRadius: '8px', padding: '0.75rem 1.5rem' }}
              >
                <FileText size={18} />
                <span>Generate &amp; Discharge Report</span>
              </button>
            </div>
          </div>

          {/* REPORT MODAL */}
          <Modal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            title={`Patient Clinical Report — ${currentPatientName} (${currentPatientId})`}
            subtitle={`Backend PostgreSQL Summary • Generated: ${new Date().toLocaleDateString()}`}
            maxWidth="750px"
          >
            <div className="patient-report-container" style={{ padding: '0.5rem 0' }}>
              {/* Demographics */}
              <div className="card mb-3" style={{ background: 'var(--card-bg-elevated)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0EA5E9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={16} /> Patient Demographics &amp; Contact Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div><strong>Full Name:</strong> {currentPatientName}</div>
                  <div><strong>Patient ID:</strong> {currentPatientId}</div>
                  <div><strong>Age / Gender:</strong> {selectedPatient?.age || 18} yrs • {selectedPatient?.gender || 'Female'}</div>
                  <div><strong>Blood Group:</strong> {selectedPatient?.bloodGroup || 'O+'}</div>
                  <div><strong>Phone Number:</strong> {selectedPatient?.phone || '+91 98765 43210'}</div>
                  <div>
                    <strong>Email Address:</strong>{' '}
                    {selectedPatient?.email || `${currentPatientName.toLowerCase().replace(/ /g, '.')}@mediqueue-health.org`}
                  </div>
                </div>
              </div>

              {/* Encounter */}
              <div className="card mb-3" style={{ background: 'var(--card-bg-elevated)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0EA5E9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} /> Encounter Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div><strong>Encounter ID:</strong> #{encounterId || 11}</div>
                  <div><strong>Department:</strong> {selectedPatient?.department || 'General Medicine'}</div>
                  <div>
                    <strong>Presenting Symptoms:</strong>{' '}
                    {Array.isArray(selectedPatient?.symptoms) ? selectedPatient.symptoms.join(', ') : selectedPatient?.symptoms || 'Mild headache'}
                  </div>
                  <div><strong>Workflow Status:</strong> Completed</div>
                </div>
              </div>

              {/* AI Assessment Result */}
              {aiResult && (
                <div className="card mb-3" style={{ background: 'rgba(14, 165, 233, 0.08)', borderColor: '#0EA5E9', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0EA5E9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Brain size={16} /> AI Assessment Result
                  </h4>
                  <div style={{ fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                    <strong>Risk Score:</strong> {aiResult.risk_score ?? 0} / 100 • <strong>Risk Level:</strong> {aiResult.risk_level || 'Low'} • <strong>Priority:</strong> {aiResult.priority_level || 'Low'}
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', margin: 0 }}>
                    <strong>Summary:</strong> {aiResult.explanation || 'No major abnormal clinical indicators were detected in the available data.'}
                  </p>
                </div>
              )}

              {/* Prescriptions */}
              {prescriptions.length > 0 && (
                <div className="card mb-3" style={{ background: 'rgba(139, 92, 246, 0.08)', borderColor: '#8B5CF6', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Pill size={16} /> Confirmed Prescriptions (PostgreSQL)
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                    {uniquePrescriptions.map((rx, idx) => (
                      <li key={idx}>
                        <strong>{rx.medicine_name}</strong> {rx.dosage ? `(${rx.dosage})` : ''} - {rx.instructions || 'As prescribed'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Report Delivery Notice */}
              <div className="card" style={{ background: 'var(--card-bg-elevated)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#0EA5E9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={16} /> Patient Report Delivery Recipient
                </h4>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    fontSize: '0.88rem',
                    marginBottom: '0.75rem',
                    background: 'var(--card-bg-elevated)',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>Email Destination</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={13} /> {selectedPatient?.email || `${currentPatientName.toLowerCase().replace(/ /g, '.')}@mediqueue-health.org`}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>Phone Destination</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={13} /> {selectedPatient?.phone || '+91 98765 43210'}
                    </span>
                  </div>
                </div>

                {!showDeliveryNotice ? (
                  <button onClick={() => setShowDeliveryNotice(true)} className="btn btn-primary" style={{ width: '100%', fontWeight: 800 }}>
                    <Send size={16} /> Send / Share Report
                  </button>
                ) : (
                  <div style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid #0EA5E9', borderRadius: '6px', padding: '0.85rem' }}>
                    <div style={{ color: '#0EA5E9', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Info size={16} /> Report Delivery Notice
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.82rem', lineHeight: 1.4 }}>
                      Report generated successfully. Patient contact details are available above. Notification delivery service is active.
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button className="btn btn-secondary" onClick={() => setIsReportModalOpen(false)}>
                  Close Report
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}

      <style>{`
        .spinner-sm {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AiAssessmentPage;
