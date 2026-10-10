import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Patient } from '../types';
import { treatmentService } from '../services/api/treatmentService';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { DoctorAssignmentModal } from '../components/common/DoctorAssignmentModal';
import { EmptyState } from '../components/common/EmptyState';
import {
  AlertTriangle,
  Clock,
  Heart,
  Wind,
  Gauge,
  Eye,
  Play,
  ShieldAlert,
  Building2,
  UserCheck,
  Stethoscope,
  Radio,
  Zap,
  Flame,
  Activity,
} from 'lucide-react';
import { NetworkCanvas } from '../components/3d/NetworkCanvas';

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

export const PriorityQueue: React.FC = () => {
  const { patients, doctors, assignDoctor, startTreatment, showToast } = useApp();
  const navigate = useNavigate();
  const [queue, setQueue] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [assigningPatient, setAssigningPatient] = useState<Patient | null>(null);
  const [startingPatientId, setStartingPatientId] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await treatmentService.getPriorityQueue();
      setQueue(data);
    } catch (err: any) {
      console.error('Failed to load priority queue data:', err);
      setError(err?.message || 'Failed to load priority queue telemetry');
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [patients]);

  const criticalCount = queue.filter((p) => p.status === 'CRITICAL').length;
  const highCount = queue.filter((p) => p.status === 'HIGH').length;
  const moderateCount = queue.filter((p) => p.status === 'MODERATE').length;

  const handleStartTreatment = async (patient: Patient) => {
    if (!isDoctorAssigned(patient)) {
      showToast(
        'Doctor Assignment Required',
        `Please assign an attending doctor to ${patient.name} before starting emergency treatment.`,
        'warning'
      );
      setAssigningPatient(patient);
      return;
    }

    setStartingPatientId(patient.id);
    showToast('Initiating Treatment', `Preparing emergency treatment bay for ${patient.name}...`, 'info');
    const encId = patient.clinicalRecords?.[0]?.id;

    setTimeout(async () => {
      await startTreatment(patient.id, encId);
      setStartingPatientId(null);
      navigate('/treatment');
    }, 1800);
  };

  return (
    <div className="page-container" style={{ background: 'var(--app-page-bg)', minHeight: '100vh', color: 'var(--app-text-main)', position: 'relative' }}>
      <NetworkCanvas opacity={0.35} />
      {/* Header & Command Center Console */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#DC2626', textTransform: 'uppercase', background: 'rgba(220, 38, 38, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Radio size={13} className="text-red" style={{ animation: 'pulse 1.2s infinite' }} /> Emergency Command Operations
              </span>
            </div>
            <h1 className="page-title" style={{ fontSize: '1.65rem', fontWeight: 800 }}>Triage &amp; Priority Command Center</h1>
            <p className="page-subtitle" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Real-time spatial triage matrix ranking emergency cases dynamically based on AI risk indices and vital severity.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'var(--card-bg-elevated)', border: '1px solid var(--border-subtle)', padding: '0.4rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={14} style={{ color: '#0EA5E9' }} /> Live Triage Radar Active
            </span>
          </div>
        </div>
      </div>

      {/* Spatial Summary Matrix Cards */}
      <div className="grid-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="card-double-bezel">
          <div className="card-inner-core p-4" style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(153, 27, 27, 0.03))', borderLeft: '4px solid #DC2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CRITICAL RESUSCITATION</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#DC2626', lineHeight: 1, marginTop: '0.2rem' }}>{criticalCount}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Immediate Bay Allocation</div>
            </div>
            <Flame size={36} style={{ color: '#DC2626', opacity: 0.8 }} />
          </div>
        </div>

        <div className="card-double-bezel">
          <div className="card-inner-core p-4" style={{ background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08), rgba(194, 65, 12, 0.03))', borderLeft: '4px solid #EA580C', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HIGH URGENCY</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#EA580C', lineHeight: 1, marginTop: '0.2rem' }}>{highCount}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Urgent Clinical Review</div>
            </div>
            <Zap size={36} style={{ color: '#EA580C', opacity: 0.8 }} />
          </div>
        </div>

        <div className="card-double-bezel">
          <div className="card-inner-core p-4" style={{ background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(180, 83, 9, 0.03))', borderLeft: '4px solid #D97706', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MODERATE / STABLE</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#D97706', lineHeight: 1, marginTop: '0.2rem' }}>{moderateCount}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Observation &amp; Monitoring</div>
            </div>
            <Clock size={36} style={{ color: '#D97706', opacity: 0.8 }} />
          </div>
        </div>
      </div>

      {/* Priority Queue Spatial Roster */}
      {loading ? (
        <div className="card-double-bezel p-5 text-center text-muted">
          <div className="spinner-sm" style={{ margin: '0 auto 1rem auto' }}></div>
          Scanning priority queue telemetries...
        </div>
      ) : error ? (
        <div className="card-double-bezel p-5 text-center" style={{ color: '#DC2626' }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem auto', color: '#DC2626' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Unable to load Priority Queue data</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{error}</p>
          <button onClick={fetchQueue} className="btn btn-secondary btn-sm" style={{ margin: '0 auto' }}>
            Retry Telemetry Scan
          </button>
        </div>
      ) : queue.length === 0 ? (
        <EmptyState
          title="No critical or high-priority cases currently available."
          description="There are currently no active critical or high-priority patients requiring emergency triage."
          actionLabel="View Patient Roster"
          onAction={() => navigate('/patients')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {queue.map((patient, index) => {
            const rank = String(index + 1).padStart(2, '0');
            const score = patient.latestAssessment?.riskScore || 50;
            const riskFactors = patient.latestAssessment?.riskFactors || ['Awaiting clinical assessment'];
            const isStarting = startingPatientId === patient.id;
            const isCrit = patient.status === 'CRITICAL';

            return (
              <div key={patient.id} className="card-double-bezel" style={{ transition: 'transform 0.2s ease' }}>
                <div
                  className="card-inner-core p-4"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.3fr 1.3fr',
                    gap: '1.5rem',
                    alignItems: 'center',
                    borderLeft: `6px solid ${isCrit ? '#DC2626' : patient.status === 'HIGH' ? '#EA580C' : '#D97706'}`,
                    background: isCrit ? 'linear-gradient(90deg, rgba(220, 38, 38, 0.04), var(--card-bg-elevated))' : 'var(--card-bg-elevated)',
                  }}
                >
                  {/* Left Column: Rank & Patient Demographics */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                    <div
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        color: isCrit ? '#DC2626' : 'var(--text-muted)',
                        background: isCrit ? 'rgba(220, 38, 38, 0.12)' : 'var(--border-subtle)',
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {rank}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{patient.name}</h3>
                        <span style={{ background: 'var(--border-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'monospace' }}>
                          {patient.id}
                        </span>
                        <PriorityBadge priority={patient.status} size="md" />
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.84rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                        <span>{patient.age} yrs • {patient.gender}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Building2 size={13} /> {patient.department}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={13} /> Wait: <strong>{patient.waitingTimeMinutes}m</strong>
                        </span>
                      </div>

                      {/* Vitals Telemetry Tags */}
                      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                          <Wind size={13} style={{ color: '#0EA5E9' }} /> SpO2: <strong>{patient.vitals.spO2}%</strong>
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                          <Heart size={13} style={{ color: '#DC2626' }} /> HR: <strong>{patient.vitals.heartRate} bpm</strong>
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                          <Gauge size={13} style={{ color: '#3B82F6' }} /> BP: <strong>{patient.vitals.bloodPressure}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Column: Risk Score & Key Factors */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card-bg-elevated)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--card-bg-inner)',
                        border: `2px solid ${isCrit ? '#DC2626' : '#0EA5E9'}`,
                        borderRadius: '8px',
                        width: '54px',
                        height: '54px',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: isCrit ? '#DC2626' : '#0EA5E9', lineHeight: 1 }}>{score}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/100</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ShieldAlert size={14} style={{ color: '#EA580C' }} /> Main Risk Indicators
                      </div>
                      <ul style={{ listStyle: 'disc', paddingLeft: '1rem', margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {riskFactors.slice(0, 2).map((factor, i) => (
                          <li key={i}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Assigned Doctor & Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>Attending Doctor</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem', fontWeight: 800, color: '#0EA5E9' }}>
                        <Stethoscope size={14} /> {isDoctorAssigned(patient) ? patient.assignedDoctor : 'Unassigned'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                      >
                        <Eye size={13} /> View
                      </button>

                      <button
                        onClick={() => setAssigningPatient(patient)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                      >
                        <UserCheck size={13} /> {isDoctorAssigned(patient) ? 'Doctor' : 'Assign'}
                      </button>

                      <button
                        onClick={() => handleStartTreatment(patient)}
                        disabled={isStarting}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', fontWeight: 800 }}
                      >
                        {isStarting ? (
                          <>
                            <span className="spinner-sm"></span>
                            <span>Starting...</span>
                          </>
                        ) : (
                          <>
                            <Play size={13} />
                            <span>Start Treatment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Assign Doctor */}
      <DoctorAssignmentModal
        isOpen={!!assigningPatient}
        onClose={() => setAssigningPatient(null)}
        patient={assigningPatient}
        doctors={doctors}
        onAssign={assignDoctor}
      />

      <style>{`
        .spinner-sm {
          width: 14px;
          height: 14px;
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

export default PriorityQueue;
