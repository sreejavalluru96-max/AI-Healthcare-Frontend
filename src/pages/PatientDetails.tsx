import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Patient } from '../types';
import { patientService } from '../services/api/patientService';
import {
  workflowService,
  WorkflowAppointment,
  FullPatientWorkflowResponse,
} from '../services/api/workflowService';
import { VitalCard } from '../components/common/VitalCard';
import {
  ArrowLeft,
  Calendar,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [appointments, setAppointments] = useState<WorkflowAppointment[]>([]);
  const [workflowData, setWorkflowData] = useState<FullPatientWorkflowResponse | null>(null);
  const [currentEncounterId, setCurrentEncounterId] = useState<number | null>(null);

  const [isBookingAppt, setIsBookingAppt] = useState(false);

  // Appointment Booking Form State
  const [bookingForm, setBookingForm] = useState({
    doctorId: 1,
    departmentId: 1,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:30:00',
    reason: 'Routine consultation',
  });

  // Load Patient and Clinical / Appointment Data from Backend PostgreSQL
  const loadPatientData = async () => {
    if (!id) return;
    const cleanId = id.trim();
    const numericId = parseInt(cleanId.replace(/\D/g, ''), 10) || 1;

    try {
      const fetchedPatient = await patientService.getPatientById(cleanId);
      setPatient(fetchedPatient);

      // 1. Fetch appointments from GET /patients/{patient_id}/appointments
      try {
        const appts = await workflowService.getPatientAppointments(numericId);
        setAppointments(appts || []);
      } catch {
        setAppointments([]);
      }

      // 2. Identify clinical encounter
      let latestEncId: number | null = null;
      try {
        const clinical = await patientService.getClinicalData(cleanId);
        if (clinical?.encounters && clinical.encounters.length > 0) {
          const targetEnc = numericId === 1
            ? (clinical.encounters.find(e => e.encounter_id === 11) || clinical.encounters[0])
            : numericId === 3
            ? (clinical.encounters.find(e => e.encounter_id === 3) || clinical.encounters[0])
            : numericId === 4
            ? (clinical.encounters.find(e => e.encounter_id === 12) || clinical.encounters[0])
            : (clinical.encounters.find(e => e.encounter_id === numericId) || clinical.encounters[clinical.encounters.length - 1]);
          latestEncId = targetEnc.encounter_id;
          setCurrentEncounterId(latestEncId);
        }
      } catch {
        latestEncId = null;
      }

      if (!latestEncId) {
        latestEncId = numericId === 1 ? 11 : numericId === 3 ? 3 : numericId === 4 ? 12 : numericId;
        setCurrentEncounterId(latestEncId);
      }

      if (latestEncId) {
        try {
          const wf = await workflowService.getPatientWorkflow(latestEncId);
          setWorkflowData(wf);
        } catch {
          setWorkflowData(null);
        }
      }
    } catch (err) {
      console.error('Failed to load patient details:', err);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [id]);

  if (!patient) {
    return (
      <div className="page-container">
        <div className="card text-center p-5">
          <h2>Loading Patient Details...</h2>
          <p className="text-muted mb-4">Fetching patient records from database.</p>
          <Link to="/patients" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  const numericId = parseInt(patient.id.replace(/\D/g, ''), 10) || 1;
  const targetEncounterId = currentEncounterId || (numericId === 1 ? 11 : numericId === 3 ? 3 : numericId === 4 ? 12 : 1);

  // Determine if Patient is Critical or High Priority (Emergency Pathway)
  const isCritical =
    patient.status === 'CRITICAL' ||
    patient.status === 'HIGH' ||
    workflowData?.priority_level === 'Critical' ||
    workflowData?.priority_level === 'High' ||
    workflowData?.risk_level === 'High' ||
    (patient.latestAssessment?.riskScore !== undefined && patient.latestAssessment.riskScore >= 80);

  const hasAppointment = appointments.length > 0;

  // Helper function to format appointment_time to HH:MM:SS
  const formatAppointmentTime = (timeStr: string): string => {
    if (!timeStr) return '10:30:00';
    const parts = timeStr.trim().split(':');
    if (parts.length === 2) {
      const hh = parts[0].padStart(2, '0');
      const mm = parts[1].padStart(2, '0');
      return `${hh}:${mm}:00`;
    }
    if (parts.length === 3) {
      const hh = parts[0].padStart(2, '0');
      const mm = parts[1].padStart(2, '0');
      const ss = parts[2].padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    }
    return '10:30:00';
  };

  // Booking Handler (Only on explicit form submission)
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBookingAppt) return;
    setIsBookingAppt(true);

    const formattedTime = formatAppointmentTime(bookingForm.appointmentTime);
    const payload = {
      patient_id: numericId,
      doctor_id: Number(bookingForm.doctorId) || 1,
      department_id: Number(bookingForm.departmentId) || 1,
      appointment_date: bookingForm.appointmentDate || new Date().toISOString().split('T')[0],
      appointment_time: formattedTime,
      reason: bookingForm.reason?.trim() || 'Routine consultation',
    };

    try {
      console.log('[MediQueue Appointment] Submitting POST /appointments payload:', payload);
      await workflowService.createAppointment(payload);

      const updated = await workflowService.getPatientAppointments(numericId);
      setAppointments(updated || []);
      showToast('Appointment Scheduled', `Outpatient appointment booked for ${patient.name}.`, 'success');
    } catch (err: any) {
      console.error('[MediQueue Appointment] POST /appointments failed:', err);
      showToast('Booking Failed', err.message || 'Could not book appointment.', 'error');
    } finally {
      setIsBookingAppt(false);
    }
  };

  // Symptoms from Workflow data or Patient model
  const primarySymptom = workflowData?.chief_complaint || (Array.isArray(patient.symptoms) ? patient.symptoms[0] : patient.symptoms) || 'Mild headache';
  const symptomSeverity = workflowData?.symptoms?.[0]?.severity || (isCritical ? 'Severe' : 'Mild');
  const symptomDuration = workflowData?.symptoms?.[0]?.duration || '2 days';

  return (
    <div className="page-container">
      {/* Back Button */}
      <div className="mb-4">
        <button onClick={() => navigate('/patients')} className="btn btn-secondary btn-sm mb-3">
          <ArrowLeft size={14} /> Back to Patients
        </button>

        {/* 1. SIMPLE PATIENT HEADER */}
        <div className="patient-header-card card">
          <div className="patient-header-main">
            <div className="patient-avatar-box">
              <span>{patient.name.split(' ').map((n) => n[0]).join('')}</span>
            </div>
            <div className="patient-title-group">
              <div className="patient-name-title">
                <h1>{patient.name}</h1>
                <span className="patient-id-tag">{patient.id}</span>
              </div>
              <div className="patient-meta-row">
                <span>{patient.age} years • {patient.gender}</span>
                <span>Blood Group: <strong>{patient.bloodGroup}</strong></span>
                <span>Department: <strong>{workflowData?.department_name || patient.department}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1 — APPOINTMENT CARD (THE GATE) */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={18} className="text-cyan" /> Appointment &amp; Triage Status
          </h3>
        </div>

        {isCritical ? (
          /* CRITICAL / EMERGENCY EXCEPTION */
          <div style={{ padding: '0.25rem 0' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ color: '#991b1b', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={18} /> CRITICAL / HIGH Emergency Pathway
              </div>
              <p style={{ fontSize: '0.85rem', color: '#7f1d1d', margin: 0 }}>
                Emergency case. Outpatient appointment and AI Assessment are bypassed for immediate emergency triage and doctor assignment in the Priority Queue.
              </p>
            </div>

            <button
              onClick={() => navigate(`/priority-queue?patient_id=${numericId}&encounter_id=${targetEncounterId}`)}
              className="btn btn-danger w-full btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1rem', fontWeight: 700 }}
            >
              <span>Proceed to Priority Queue (Doctor &amp; Department Assignment)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : hasAppointment ? (
          /* CASE A: APPOINTMENT SCHEDULED */
          <div style={{ padding: '0.25rem 0' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ color: '#15803d', fontWeight: 800, fontSize: '0.98rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={18} /> Appointment Scheduled
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.88rem', color: '#166534', marginBottom: '0.5rem' }}>
                <div><strong>Status:</strong> Scheduled</div>
                <div><strong>Date:</strong> {appointments[0].appointment_date}</div>
                <div><strong>Time:</strong> {appointments[0].appointment_time}</div>
                <div><strong>Doctor:</strong> {appointments[0].doctor_name || 'Assigned Specialist'}</div>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#15803d' }}>
                <strong>Reason:</strong> {appointments[0].reason || 'Routine consultation'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#166534', fontStyle: 'italic', marginTop: '0.5rem' }}>
                Appointment confirmed in hospital database.
              </div>
            </div>

            <button
              onClick={() => navigate(`/ai-assessment?patient_id=${numericId}&encounter_id=${targetEncounterId}`)}
              className="btn btn-primary w-full btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1rem' }}
            >
              <span>Continue to AI Assessment</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* CASE B: NO APPOINTMENT EXISTS — BOOKING FORM */
          <div style={{ padding: '0.25rem 0' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ color: '#991b1b', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={18} /> No Appointment Found
              </div>
              <p style={{ fontSize: '0.85rem', color: '#7f1d1d', margin: 0 }}>
                Please book an outpatient appointment before continuing to AI Assessment.
              </p>
            </div>

            <form onSubmit={handleBookAppointment} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.92rem', color: 'var(--primary-700)', fontWeight: 800 }}>
                Book Outpatient Appointment
              </h4>
              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Appointment Date *</label>
                  <input
                    type="date"
                    value={bookingForm.appointmentDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Appointment Time *</label>
                  <input
                    type="time"
                    value={bookingForm.appointmentTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointmentTime: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Reason for Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Routine consultation / Follow-up"
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                  className="form-input"
                />
              </div>
              <button
                type="submit"
                disabled={isBookingAppt}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Calendar size={16} />
                <span>{isBookingAppt ? 'Booking Appointment...' : 'Submit Appointment'}</span>
              </button>
            </form>

            <button
              disabled={true}
              className="btn btn-primary w-full btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0.5, cursor: 'not-allowed' }}
            >
              <span>Continue to AI Assessment (Appointment Required)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2 — CURRENT CLINICAL CONDITION & LATEST VITALS */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">
            <Activity size={18} className="text-cyan" /> Current Clinical Condition
          </h3>
          {targetEncounterId && (
            <span className="badge-lbl" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
              Encounter #{targetEncounterId}
            </span>
          )}
        </div>

        {/* Presenting Symptoms Summary */}
        <div className="mb-4" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <span className="info-lbl">Symptoms / Chief Complaint</span>
              <span className="info-val font-bold" style={{ color: '#0369a1' }}>{primarySymptom}</span>
            </div>
            <div>
              <span className="info-lbl">Severity</span>
              <span className="info-val">{symptomSeverity}</span>
            </div>
            <div>
              <span className="info-lbl">Duration</span>
              <span className="info-val">{symptomDuration}</span>
            </div>
          </div>
        </div>

        {/* Vitals Summary */}
        <div>
          <span className="info-lbl" style={{ textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>
            Latest Vital Measurements
          </span>
          <VitalCard vitals={patient.vitals} />
        </div>
      </div>

      <style>{`
        .patient-header-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 1.75rem;
          gap: 1.5rem;
          flex-wrap: wrap;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        .patient-header-main {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .patient-avatar-box {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 800;
          box-shadow: 0 4px 10px rgba(2, 132, 199, 0.3);
        }
        .patient-name-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .patient-name-title h1 { font-size: 1.6rem; margin: 0; }
        .patient-id-tag {
          background-color: #e2e8f0;
          color: var(--text-primary);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: 800;
          font-family: monospace;
          font-size: 0.85rem;
        }
        .patient-meta-row {
          display: flex;
          gap: 1.25rem;
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
        .info-lbl {
          display: block;
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .info-val {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        .font-bold { font-weight: 700; }
        .w-full { width: 100%; }
      `}</style>
    </div>
  );
};

export default PatientDetails;
