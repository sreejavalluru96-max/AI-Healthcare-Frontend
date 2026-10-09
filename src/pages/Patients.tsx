import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Patient, PriorityLevel, Department, Gender } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { SearchBar } from '../components/common/SearchBar';
import { Modal } from '../components/common/Modal';
import { EditPatientModal } from '../components/common/EditPatientModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { EmptyState } from '../components/common/EmptyState';
import { UserPlus, Eye, Edit, Trash2, Filter, Phone, Heart, Wind, Building2, Zap, Calendar, AlertTriangle, CheckCircle2, Clock, Users } from 'lucide-react';
import { patientService } from '../services/api/patientService';
import { NetworkCanvas } from '../components/3d/NetworkCanvas';
import { PageTransition } from '../components/common/PageTransition';

export const Patients: React.FC = () => {
  const { patients, addPatient, updatePatient, deletePatient, loading, showToast } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterDept, setFilterDept] = useState<string>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  // New Patient Form State
  const [formData, setFormData] = useState({
    name: '',
    age: 45,
    gender: 'Male' as Gender,
    phone: '',
    bloodGroup: 'O+',
    department: 'General Medicine' as Department,
    symptoms: '',
    medicalHistory: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    heartRate: 85,
    bloodPressure: '120/80',
    systolicBP: 120,
    diastolicBP: 80,
    spO2: 96,
    temperature: 37.0,
    respiratoryRate: 18,
    bloodGlucose: 110,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bp = e.target.value;
    const parts = bp.split('/');
    const sys = parseInt(parts[0], 10) || 120;
    const dia = parseInt(parts[1], 10) || 80;

    setFormData((prev) => ({
      ...prev,
      bloodPressure: bp,
      systolicBP: sys,
      diastolicBP: dia,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    await addPatient({
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender,
      phone: formData.phone || '+91 98000 00000',
      bloodGroup: formData.bloodGroup,
      department: formData.department,
      status: 'STABLE',
      symptoms: formData.symptoms
        ? formData.symptoms.split(',').map((s) => s.trim())
        : ['General Assessment'],
      medicalHistory: formData.medicalHistory
        ? formData.medicalHistory.split(',').map((h) => h.trim())
        : ['None reported'],
      emergencyContact: {
        name: formData.emergencyName || 'Family Contact',
        relationship: formData.emergencyRelation || 'Relative',
        phone: formData.emergencyPhone || '+91 98000 00000',
      },
      vitals: {
        heartRate: Number(formData.heartRate),
        bloodPressure: formData.bloodPressure,
        systolicBP: Number(formData.systolicBP),
        diastolicBP: Number(formData.diastolicBP),
        spO2: Number(formData.spO2),
        temperature: Number(formData.temperature),
        respiratoryRate: Number(formData.respiratoryRate),
        bloodGlucose: Number(formData.bloodGlucose),
        measuredAt: 'Just now',
      },
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      age: 45,
      gender: 'Male',
      phone: '',
      bloodGroup: 'O+',
      department: 'General Medicine',
      symptoms: '',
      medicalHistory: '',
      emergencyName: '',
      emergencyRelation: '',
      emergencyPhone: '',
      heartRate: 85,
      bloodPressure: '120/80',
      systolicBP: 120,
      diastolicBP: 80,
      spO2: 96,
      temperature: 37.0,
      respiratoryRate: 18,
      bloodGlucose: 110,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deletingPatient) {
      await deletePatient(deletingPatient.id);
      setDeletingPatient(null);
    }
  };

  // Filtering Logic
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);

    const matchesPriority =
      filterPriority === 'ALL' || p.status.toUpperCase() === filterPriority.toUpperCase();

    const matchesDept =
      filterDept === 'ALL' || p.department.toLowerCase() === filterDept.toLowerCase();

    return matchesSearch && matchesPriority && matchesDept;
  });

  return (
    <PageTransition>
      <div className="page-container" style={{ background: 'var(--app-page-bg)', minHeight: '100vh', color: 'var(--app-text-main)', position: 'relative' }}>
      <NetworkCanvas opacity={0.35} />
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#0EA5E9', textTransform: 'uppercase', background: 'rgba(14, 165, 233, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                Patient Network &amp; Roster
              </span>
            </div>
            <h1 className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Patients Management Console</h1>
            <p className="page-subtitle" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Comprehensive patient directory, chief symptoms, vital records, and clinical status management.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, borderRadius: '8px', padding: '0.65rem 1.25rem', boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)' }}
          >
            <UserPlus size={18} />
            <span>+ Add New Patient</span>
          </button>
        </div>
      </div>

      {/* Controls Bar with Double-Bezel Styling */}
      <div className="card-double-bezel mb-4">
        <div className="card-inner-core p-3">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by Patient Name, ID (P001), or Phone..."
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                <Building2 size={14} /> Dept:
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="form-select select-sm"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.82rem', borderRadius: '6px' }}
                >
                  <option value="ALL">All Departments</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Emergency">Emergency</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Neurology">Neurology</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                <Filter size={14} /> Priority:
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'STABLE'].map((lvl) => (
                    <button
                      key={lvl}
                      className={`filter-pill-btn ${filterPriority === lvl ? 'active' : ''}`}
                      onClick={() => setFilterPriority(lvl)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: filterPriority === lvl ? '1px solid #0EA5E9' : '1px solid var(--border-subtle)',
                        background: filterPriority === lvl ? '#0EA5E9' : 'var(--card-bg-elevated)',
                        color: filterPriority === lvl ? '#FFFFFF' : 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {lvl === 'ALL' ? 'All' : lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Table with Double Bezel Wrapper */}
      {loading ? (
        <div className="card-double-bezel p-5 text-center text-muted">
          Loading patient network directory...
        </div>
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          title="No Patients Found"
          description="No patient record matches your search query or filter settings."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setFilterPriority('ALL');
            setFilterDept('ALL');
          }}
        />
      ) : (
        <div className="card-double-bezel">
          <div className="card-inner-core p-0" style={{ overflow: 'hidden' }}>
            <div className="table-container">
              <table className="mediqueue-table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Patient Details</th>
                    <th>Age / Gender</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Risk Score</th>
                    <th>Last Visit</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} style={{ transition: 'background 0.15s ease' }}>
                      <td>
                        <span style={{ background: 'var(--border-subtle)', color: 'var(--text-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'monospace' }}>
                          {patient.id}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{patient.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={12} /> {patient.phone}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          {patient.age} yrs • {patient.gender} ({patient.bloodGroup})
                        </span>
                      </td>
                      <td>
                        <span style={{ background: 'rgba(14, 165, 233, 0.12)', color: '#0EA5E9', border: '1px solid rgba(14, 165, 233, 0.25)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {patient.department}
                        </span>
                      </td>
                      <td>
                        {patient.latestAssessment ? (
                          <PriorityBadge priority={patient.status} size="sm" />
                        ) : (
                          <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            Not Assessed
                          </span>
                        )}
                      </td>
                      <td>
                        {patient.latestAssessment && patient.latestAssessment.riskScore !== undefined ? (
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: patient.latestAssessment.riskScore >= 80 ? '#DC2626' : patient.latestAssessment.riskScore >= 60 ? '#EA580C' : '#16A34A' }}>
                            {patient.latestAssessment.riskScore} / 100 — {(patient.latestAssessment.riskLevel || patient.latestAssessment.priority).toUpperCase()}
                          </span>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            Not Assessed
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{patient.registeredAt || 'Today'}</span>
                      </td>
                      <td className="text-right">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            onClick={() => navigate(`/patients/${patient.id}`)}
                            className="btn btn-secondary btn-sm"
                            title="View Clinical Details"
                            style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => setEditingPatient(patient)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Patient Record"
                            style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                          >
                            <Edit size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setDeletingPatient(patient)}
                            className="btn btn-danger btn-sm"
                            title="Delete Patient Record"
                            style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Patient */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Patient Record"
        subtitle="Register patient demographics, chief symptoms, and initial vital measurements."
        maxWidth="700px"
      >
        <form onSubmit={handleFormSubmit} className="add-patient-form">
          <div className="form-section-title" style={{ fontSize: '0.84rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0EA5E9', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem', marginBottom: '0.75rem' }}>
            Demographics &amp; Assignment
          </div>

          <div className="grid-2 mb-3">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g. Vikram Singh"
              />
            </div>

            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input
                  type="number"
                  name="age"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid-3 mb-3">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="+91 98000 00000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                className="form-select"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="Emergency">Emergency</option>
                <option value="Cardiology">Cardiology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Presenting Symptoms (comma-separated)</label>
            <input
              type="text"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. Chest discomfort, Shortness of breath, Fever"
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Past Medical History (comma-separated)</label>
            <input
              type="text"
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g. Hypertension, Diabetes, Asthma"
            />
          </div>

          <div className="form-section-title" style={{ fontSize: '0.84rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0EA5E9', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem', marginBottom: '0.75rem', marginTop: '1rem' }}>
            Initial Triage Vitals
          </div>

          <div className="grid-3 mb-3">
            <div className="form-group">
              <label className="form-label">Heart Rate (bpm)</label>
              <input
                type="number"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Pressure (mmHg)</label>
              <input
                type="text"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleBPChange}
                className="form-input"
                placeholder="120/80"
              />
            </div>
            <div className="form-group">
              <label className="form-label">SpO2 (%)</label>
              <input
                type="number"
                name="spO2"
                min="50"
                max="100"
                value={formData.spO2}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>
              Save &amp; Register Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Patient */}
      <EditPatientModal
        isOpen={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        patient={editingPatient}
        onSave={updatePatient}
      />

      {/* Modal: Delete Patient Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingPatient}
        onClose={() => setDeletingPatient(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient Record"
        message={`Are you sure you want to delete patient ${deletingPatient?.name} (${deletingPatient?.id})? This action cannot be undone.`}
        confirmText="Delete Patient"
        variant="danger"
      />
    </div>
    </PageTransition>
  );
};

export default Patients;
