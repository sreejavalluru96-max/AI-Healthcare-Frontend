import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Patient } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { VitalCard } from '../components/common/VitalCard';
import { Modal } from '../components/common/Modal';
import { DoctorAssignmentModal } from '../components/common/DoctorAssignmentModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import {
  Stethoscope,
  Clock,
  Play,
  CheckCircle2,
  FileText,
  UserCheck,
  Building2,
  AlertOctagon,
  Eye,
  Phone,
  Activity,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { workflowService, WorkflowPrescription } from '../services/api/workflowService';
import { NetworkCanvas } from '../components/3d/NetworkCanvas';
import { INITIAL_TREATMENT_OVERRIDES } from '../services/storageService';

const isDoctorAssigned = (p?: Patient | null): boolean => {
  if (!p) return false;
  const doc = p.assignedDoctor?.trim();
  return Boolean(
    doc &&
    doc !== 'Unassigned' &&
    doc !== 'Not Assigned' &&
    doc !== 'Unassigned Doctor'
  );
};

const TREATMENT_OVERRIDES_KEY = 'mediqueue_treatment_page_overrides_v1';

const getStoredOverrides = (): Record<string, 'IN_PROGRESS' | 'OBSERVATION' | 'COMPLETED' | 'WAITING'> => {
  try {
    const raw = localStorage.getItem(TREATMENT_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : (INITIAL_TREATMENT_OVERRIDES as any);
  } catch {
    return INITIAL_TREATMENT_OVERRIDES as any;
  }
};

const saveStoredOverrides = (overrides: Record<string, 'IN_PROGRESS' | 'OBSERVATION' | 'COMPLETED' | 'WAITING'>) => {
  try {
    localStorage.setItem(TREATMENT_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.error('Failed to save treatment overrides:', e);
  }
};

export const Treatment: React.FC = () => {
  const { patients, doctors, assignDoctor, startTreatment, completeTreatment, addClinicalRecord, showToast } = useApp();
  const navigate = useNavigate();

  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [treatmentNote, setTreatmentNote] = useState('');
  const [assigningPatient, setAssigningPatient] = useState<Patient | null>(null);
  const [completingPatient, setCompletingPatient] = useState<Patient | null>(null);
  const [startingPatientId, setStartingPatientId] = useState<string | null>(null);

  // Local treatment status overrides state for treatment page transition persistence
  const [overrides, setOverrides] = useState<Record<string, 'IN_PROGRESS' | 'OBSERVATION' | 'COMPLETED' | 'WAITING'>>(() => getStoredOverrides());

  // Reconcile and load baseline overrides if global Reset Demo occurs (sessionStorage cleared)
  React.useEffect(() => {
    const sessionActive = sessionStorage.getItem('mediqueue_treatment_active_session');
    const storedBase = localStorage.getItem('mediqueue_patients_v2');

    if (!sessionActive || !storedBase) {
      const current = getStoredOverrides();
      setOverrides(current);
      if (storedBase) {
        sessionStorage.setItem('mediqueue_treatment_active_session', 'true');
      }
    } else {
      sessionStorage.setItem('mediqueue_treatment_active_session', 'true');
    }
  }, [patients]);

  const setPatientOverride = (patientId: string, newStatus: 'IN_PROGRESS' | 'OBSERVATION' | 'COMPLETED') => {
    setOverrides((prev) => {
      const cleanId = patientId.trim();
      const numId = cleanId.replace(/\D/g, '');
      const updated = {
        ...prev,
        [cleanId]: newStatus,
        [cleanId.toLowerCase()]: newStatus,
        ...(numId ? { [numId]: newStatus, [`P${numId.padStart(3, '0')}`]: newStatus } : {}),
      };
      saveStoredOverrides(updated);
      return updated;
    });
  };

  const getEffectiveStatus = (p: Patient): string => {
    const cleanId = p.id.trim();
    const numId = cleanId.replace(/\D/g, '');
    const override =
      overrides[cleanId] ||
      overrides[cleanId.toLowerCase()] ||
      (numId ? overrides[numId] || overrides[`P${numId.padStart(3, '0')}`] : undefined);
    if (override) return override;
    return p.treatmentStatus || 'WAITING';
  };

  // Eligibility rule: STABLE and LOW patients must NEVER appear in Treatment Operations Board
  const isEligible = (p: Patient): boolean => {
    return p.status === 'CRITICAL' || p.status === 'HIGH' || p.status === 'MODERATE';
  };

  // Group patients by effective treatment status using strict eligibility rules for EVERY column
  const waitingPatients = patients.filter((p) => {
    if (!isEligible(p)) return false;

    const status = getEffectiveStatus(p).toUpperCase().replace(/\s+/g, '_');
    return (
      status !== 'IN_PROGRESS' &&
      status !== 'IN_TREATMENT' &&
      status !== 'COMPLETED' &&
      status !== 'OBSERVATION'
    );
  });

  const inProgressPatients = patients.filter((p) => {
    if (!isEligible(p)) return false;

    const status = getEffectiveStatus(p).toUpperCase().replace(/\s+/g, '_');
    return status === 'IN_PROGRESS' || status === 'IN_TREATMENT';
  });

  const completedPatients = patients.filter((p) => {
    if (!isEligible(p)) return false;

    const status = getEffectiveStatus(p).toUpperCase().replace(/\s+/g, '_');
    return status === 'COMPLETED' || status === 'OBSERVATION';
  });

  const getEncounterIdForPatient = (p: Patient | null | undefined): number | null => {
    if (!p) return null;
    if (typeof p.encounterId === 'number' && p.encounterId > 0) {
      return p.encounterId;
    }
    if (p.clinicalRecords && p.clinicalRecords.length > 0) {
      const firstId = String(p.clinicalRecords[0].id).trim();
      if (/^\d+$/.test(firstId)) {
        const parsed = parseInt(firstId, 10);
        if (parsed > 0) return parsed;
      }
    }
    if (p.latestAssessment?.id) {
      const parts = p.latestAssessment.id.split('-');
      if (parts.length >= 3) {
        const parsed = parseInt(parts[2], 10);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
      }
    }
    const numId = parseInt(p.id.replace(/\D/g, ''), 10);
    if (Number.isFinite(numId) && numId > 0) {
      return numId;
    }
    return null;
  };

  const handleOpenTreatmentModal = (patient: Patient) => {
    setActivePatient(patient);
    setTreatmentNote(patient.clinicalRecords[0]?.notes || 'Initial emergency treatment protocol initiated.');
  };

  const handleStartTreatment = async (patient: Patient) => {
    if (!isDoctorAssigned(patient)) {
      showToast(
        'Doctor Assignment Required',
        'Please assign a doctor before starting treatment.',
        'warning'
      );
      setAssigningPatient(patient);
      return;
    }

    setStartingPatientId(patient.id);
    setPatientOverride(patient.id, 'IN_PROGRESS');

    const encId = getEncounterIdForPatient(patient);
    try {
      await startTreatment(patient.id, encId || undefined);
    } catch (err: any) {
      console.warn('Backend startTreatment notification warning:', err);
    } finally {
      setStartingPatientId(null);
    }
  };

  const handleUpdateNotes = async () => {
    if (!activePatient || !treatmentNote.trim()) return;
    await addClinicalRecord(activePatient.id, {
      visitDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      doctorName: isDoctorAssigned(activePatient) ? activePatient.assignedDoctor! : 'Attending Physician',
      chiefComplaint: activePatient.symptoms[0] || 'Ongoing Emergency Treatment',
      diagnosis: 'Treatment Progress Note',
      notes: treatmentNote,
      heartRate: activePatient.vitals.heartRate,
      bloodPressure: activePatient.vitals.bloodPressure,
      spO2: activePatient.vitals.spO2,
      temperature: activePatient.vitals.temperature,
    });
    showToast('Treatment Updated', `Clinical treatment notes updated for ${activePatient.name}.`, 'success');
  };

  const handleConfirmCompleteTreatment = async () => {
    if (completingPatient) {
      setPatientOverride(completingPatient.id, 'OBSERVATION');
      const encId = getEncounterIdForPatient(completingPatient);
      try {
        await completeTreatment(completingPatient.id, treatmentNote, encId || undefined);
      } catch (err: any) {
        console.warn('Backend completeTreatment notification warning:', err);
      }
      setCompletingPatient(null);
      setActivePatient(null);
    }
  };

  // History Modal State
  const [historyPatient, setHistoryPatient] = useState<Patient | null>(null);
  const [historyWorkflowData, setHistoryWorkflowData] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const handleOpenHistoryModal = async (patient: Patient) => {
    setHistoryPatient(patient);
    setIsLoadingHistory(true);
    setHistoryWorkflowData(null);

    const encId = getEncounterIdForPatient(patient);
    if (encId) {
      try {
        const [wf, pres] = await Promise.all([
          workflowService.getPatientWorkflow(encId).catch(() => null),
          workflowService.getPrescriptions(encId).catch(() => null),
        ]);

        setHistoryWorkflowData({
          ...wf,
          prescriptions: pres?.prescriptions || wf?.prescriptions || [],
        });
      } catch {
        setHistoryWorkflowData(null);
      } finally {
        setIsLoadingHistory(false);
      }
    } else {
      setIsLoadingHistory(false);
    }
  };

  return (
    <div className="page-container" style={{ background: 'var(--app-page-bg)', minHeight: '100vh', color: 'var(--app-text-main)', position: 'relative' }}>
      <NetworkCanvas opacity={0.35} />
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#0EA5E9', textTransform: 'uppercase', background: 'rgba(14, 165, 233, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                Clinical Mission Timeline
              </span>
            </div>
            <h1 className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Treatment Operations Board</h1>
            <p className="page-subtitle" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Track patient emergency interventions from initial triage intake to active procedures and discharge.
            </p>
          </div>
        </div>
      </div>

      {/* Board Summary Statistics */}
      <div className="grid-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="card-double-bezel">
          <div className="card-inner-core p-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--border-subtle)', padding: '0.85rem', borderRadius: '10px' }}>
              <Clock size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Waiting for Treatment</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, marginTop: '0.2rem' }}>{waitingPatients.length}</div>
            </div>
          </div>
        </div>

        <div className="card-double-bezel">
          <div className="card-inner-core p-4" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(30, 58, 138, 0.04))', borderLeft: '4px solid #0EA5E9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.15)', padding: '0.85rem', borderRadius: '10px' }}>
              <Stethoscope size={24} style={{ color: '#0EA5E9' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0EA5E9', textTransform: 'uppercase' }}>Treatment In Progress</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0EA5E9', lineHeight: 1, marginTop: '0.2rem' }}>{inProgressPatients.length}</div>
            </div>
          </div>
        </div>

        <div className="card-double-bezel">
          <div className="card-inner-core p-4" style={{ background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(21, 128, 61, 0.04))', borderLeft: '4px solid #16A34A', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(22, 163, 74, 0.15)', padding: '0.85rem', borderRadius: '10px' }}>
              <CheckCircle2 size={24} style={{ color: '#16A34A' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase' }}>Completed Today</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#16A34A', lineHeight: 1, marginTop: '0.2rem' }}>{completedPatients.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Timeline Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {/* Column 1: Waiting */}
        <div className="card-double-bezel">
          <div className="card-inner-core p-4" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.95rem' }}>
              <Clock size={16} /> 1. WAITING FOR TREATMENT ({waitingPatients.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
              {waitingPatients.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem 1rem', border: '1px dashed var(--border-subtle)', borderRadius: '8px' }}>
                  No patients currently waiting for treatment.
                </div>
              ) : (
                waitingPatients.map((p) => {
                  const isStarting = startingPatientId === p.id;
                  const docAssigned = isDoctorAssigned(p);
                  return (
                    <div key={p.id} style={{ background: 'var(--card-bg-elevated)', border: '1px solid var(--border-subtle)', padding: '0.85rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'monospace', background: 'var(--border-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          {p.id}
                        </span>
                        <PriorityBadge priority={p.status} size="sm" />
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.35rem 0' }}>{p.name}</h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span><Building2 size={12} /> {p.department}</span>
                        <span>Score: <strong>{p.latestAssessment?.riskScore || 50}/100</strong></span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Doctor: <strong style={{ color: '#0EA5E9' }}>{docAssigned ? p.assignedDoctor : 'Unassigned'}</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => setAssigningPatient(p)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
                          <UserCheck size={13} /> {docAssigned ? 'Doctor' : 'Assign'}
                        </button>
                        <button
                          onClick={() => handleStartTreatment(p)}
                          disabled={isStarting}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.78rem', flex: 1, fontWeight: 800 }}
                        >
                          {isStarting ? 'Starting...' : 'Start Treatment'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="card-double-bezel">
          <div className="card-inner-core p-4" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.04), var(--card-bg-inner))' }}>
            <div style={{ borderBottom: '2px solid #0EA5E9', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.95rem', color: '#0EA5E9' }}>
              <Stethoscope size={16} /> 2. TREATMENT IN PROGRESS ({inProgressPatients.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
              {inProgressPatients.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem 1rem', border: '1px dashed var(--border-subtle)', borderRadius: '8px' }}>
                  No active treatments currently in progress.
                </div>
              ) : (
                inProgressPatients.map((p) => (
                  <div key={p.id} style={{ background: 'var(--card-bg-elevated)', borderLeft: '4px solid #0EA5E9', borderTop: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'monospace', background: 'var(--border-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {p.id}
                      </span>
                      <PriorityBadge priority={p.status} size="sm" />
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.35rem 0' }}>{p.name}</h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span><Building2 size={12} /> {p.department}</span>
                      <span>Doctor: <strong>{p.assignedDoctor || 'On Duty'}</strong></span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(14, 165, 233, 0.08)', padding: '0.35rem 0.6rem', borderRadius: '4px', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                      <span>HR: {p.vitals.heartRate} bpm</span>
                      <span>SpO2: {p.vitals.spO2}%</span>
                      <span>BP: {p.vitals.bloodPressure}</span>
                    </div>

                    <button
                      onClick={() => handleOpenTreatmentModal(p)}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', fontSize: '0.78rem', fontWeight: 800 }}
                    >
                      <FileText size={13} /> Open Treatment Workspace
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Completed Today */}
        <div className="card-double-bezel">
          <div className="card-inner-core p-4" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '2px solid #16A34A', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.95rem', color: '#16A34A' }}>
              <CheckCircle2 size={16} /> 3. COMPLETED TODAY ({completedPatients.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
              {completedPatients.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem 1rem', border: '1px dashed var(--border-subtle)', borderRadius: '8px' }}>
                  No completed treatments logged today.
                </div>
              ) : (
                completedPatients.map((p) => (
                  <div key={p.id} style={{ background: 'rgba(22, 163, 74, 0.05)', borderLeft: '4px solid #16A34A', borderTop: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'monospace', background: 'var(--border-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {p.id}
                      </span>
                      <StatusBadge status="COMPLETED" />
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.35rem 0' }}>{p.name}</h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>{p.age} yrs • {p.gender}</span>
                      <span>Doctor: {p.assignedDoctor || 'Attending'}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Discharged / Transferred to Ward
                    </div>
                    <button
                      onClick={() => handleOpenHistoryModal(p)}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', fontSize: '0.78rem' }}
                    >
                      <Eye size={12} /> View Treatment History
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Open Treatment Workspace */}
      <Modal
        isOpen={!!activePatient}
        onClose={() => setActivePatient(null)}
        title={activePatient ? `Treatment Workspace — ${activePatient.name} (${activePatient.id})` : 'Treatment Manager'}
        subtitle="Manage active emergency intervention, treatment notes, and completion records."
        maxWidth="720px"
      >
        {activePatient && (
          <div className="treatment-manager-modal" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', background: 'var(--card-bg-elevated)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <span className="info-lbl" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>Department</span>
                <span className="info-val" style={{ fontWeight: 700 }}><Building2 size={14} /> {activePatient.department}</span>
              </div>
              <div>
                <span className="info-lbl" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>Assigned Doctor</span>
                <span className="info-val font-bold text-cyan" style={{ fontWeight: 800, color: '#0EA5E9' }}><UserCheck size={14} /> {isDoctorAssigned(activePatient) ? activePatient.assignedDoctor : 'Unassigned'}</span>
              </div>
              <div>
                <span className="info-lbl" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>Emergency Priority</span>
                <PriorityBadge priority={activePatient.status} size="sm" />
              </div>
              <div>
                <span className="info-lbl" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>AI Risk Score</span>
                <span className="info-val font-bold text-cyan" style={{ fontWeight: 800, color: '#0EA5E9' }}>{activePatient.latestAssessment?.riskScore || 50}/100</span>
              </div>
            </div>

            <div>
              <h4 className="form-label" style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.4rem' }}>Current Vital Signs</h4>
              <VitalCard vitals={activePatient.vitals} compact />
            </div>

            <div className="form-group">
              <label className="form-label">Treatment Notes &amp; Interventions</label>
              <textarea
                rows={3}
                value={treatmentNote}
                onChange={(e) => setTreatmentNote(e.target.value)}
                className="form-textarea"
                placeholder="Enter ongoing clinical observations, IV fluids, medication, or physician notes..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActivePatient(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleUpdateNotes}
              >
                Update Notes
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCompletingPatient(activePatient)}
                style={{ fontWeight: 800 }}
              >
                <CheckCircle2 size={16} /> Mark Treatment Completed
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Assign Doctor */}
      <DoctorAssignmentModal
        isOpen={!!assigningPatient}
        onClose={() => setAssigningPatient(null)}
        patient={assigningPatient}
        doctors={doctors}
        onAssign={assignDoctor}
      />

      {/* Modal: Confirm Treatment Completion */}
      <ConfirmationModal
        isOpen={!!completingPatient}
        onClose={() => setCompletingPatient(null)}
        onConfirm={handleConfirmCompleteTreatment}
        title="Mark Treatment Completed"
        message={`Are you sure you want to mark ${completingPatient?.name}'s treatment as completed? The patient will move into post-treatment Observation.`}
        confirmText="Complete Treatment"
        variant="success"
      />

      {/* Modal: View Treatment History */}
      <Modal
        isOpen={!!historyPatient}
        onClose={() => setHistoryPatient(null)}
        title={historyPatient ? `Completed Treatment History — ${historyPatient.name} (${historyPatient.id})` : 'Treatment History'}
        subtitle="Historical clinical record logged for this completed encounter."
        maxWidth="750px"
      >
        {historyPatient && (
          <div className="treatment-history-modal" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {isLoadingHistory ? (
              <div className="text-center p-5 text-muted">Loading treatment encounter history...</div>
            ) : (
              <>
                <div style={{ background: 'var(--card-bg-elevated)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{historyPatient.name}</h3>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        ID: <strong>{historyPatient.id}</strong> • {historyPatient.age} yrs • {historyPatient.gender} ({historyPatient.bloodGroup})
                      </span>
                    </div>
                    <StatusBadge status="COMPLETED" />
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <span><Phone size={12} /> {historyPatient.phone}</span>
                    <span><Building2 size={12} /> {historyWorkflowData?.department_name || historyPatient.department}</span>
                    <span><UserCheck size={12} /> Doctor: <strong>{historyWorkflowData?.doctor_name || historyPatient.assignedDoctor || 'Attending Physician'}</strong></span>
                  </div>
                </div>

                <div className="history-section">
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#0EA5E9', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
                    Symptoms &amp; Presentation
                  </h4>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    <strong>Chief Complaint:</strong> {historyWorkflowData?.chief_complaint || historyPatient.symptoms[0] || 'Emergency clinical assessment'}
                  </div>
                </div>

                <div className="history-section">
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#0EA5E9', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
                    Treatment &amp; Discharge Summary
                  </h4>
                  <div style={{ background: 'rgba(22, 163, 74, 0.08)', border: '1px solid #16A34A', padding: '0.75rem 1rem', borderRadius: '8px', color: '#16A34A', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={15} /> Treatment Completed &amp; Patient Discharged
                    </div>
                    <div>{historyWorkflowData?.notes || historyPatient.clinicalRecords[0]?.notes || 'Emergency clinical intervention completed successfully. Patient stabilized.'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button onClick={() => setHistoryPatient(null)} className="btn btn-secondary">
                    Close History
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Treatment;
