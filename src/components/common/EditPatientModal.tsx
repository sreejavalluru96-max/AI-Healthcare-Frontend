import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Patient, Department, Gender } from '../../types';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: (id: string, updatedData: Partial<Patient>) => Promise<Patient>;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
}) => {
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
    heartRate: 80,
    bloodPressure: '120/80',
    spO2: 96,
    temperature: 37,
    respiratoryRate: 18,
    bloodGlucose: 110,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patient || !isOpen) return;

    setError('');

    setFormData({
      name: patient.name ?? '',
      age: patient.age ?? 45,
      gender: patient.gender ?? 'Male',
      phone: patient.phone ?? '',
      bloodGroup: patient.bloodGroup ?? 'O+',
      department: patient.department ?? 'General Medicine',
      symptoms: Array.isArray(patient.symptoms)
        ? patient.symptoms.join(', ')
        : '',
      medicalHistory: Array.isArray(patient.medicalHistory)
        ? patient.medicalHistory.join(', ')
        : '',
      emergencyName: patient.emergencyContact?.name ?? '',
      emergencyRelation: patient.emergencyContact?.relationship ?? '',
      emergencyPhone: patient.emergencyContact?.phone ?? '',
      heartRate: patient.vitals?.heartRate ?? 80,
      bloodPressure: patient.vitals?.bloodPressure ?? '120/80',
      spO2: patient.vitals?.spO2 ?? 96,
      temperature: patient.vitals?.temperature ?? 37,
      respiratoryRate: patient.vitals?.respiratoryRate ?? 18,
      bloodGlucose: patient.vitals?.bloodGlucose ?? 110,
    });
  }, [patient, isOpen]);

  if (!patient) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient) return;

    setSaving(true);
    setError('');

    try {
      const updatedPatient: Partial<Patient> = {
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone.trim(),
        bloodGroup: formData.bloodGroup,
        department: formData.department,

        symptoms: formData.symptoms
          ? formData.symptoms
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        medicalHistory: formData.medicalHistory
          ? formData.medicalHistory
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        emergencyContact: {
          name: formData.emergencyName.trim(),
          relationship: formData.emergencyRelation.trim(),
          phone: formData.emergencyPhone.trim(),
        },

        vitals: {
          ...patient.vitals,
          heartRate: Number(formData.heartRate),
          bloodPressure: formData.bloodPressure.trim(),
          spO2: Number(formData.spO2),
          temperature: Number(formData.temperature),
          respiratoryRate: Number(formData.respiratoryRate),
          bloodGlucose: Number(formData.bloodGlucose),
          measuredAt: 'Updated just now',
        },
      };

      const savedPatient = await onSave(patient.id, updatedPatient);

      console.log('Patient updated successfully:', savedPatient);

      onClose();
    } catch (err) {
      console.error('Failed to update patient:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update patient. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Patient — ${patient.name} (${patient.id})`}
      subtitle="Update clinical records, vitals parameters, and department assignment."
      maxWidth="700px"
    >
      <form onSubmit={handleFormSubmit} className="add-patient-form">

        {error && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              background: '#fff1f2',
              color: '#b42318',
              border: '1px solid #fecdd3',
            }}
          >
            {error}
          </div>
        )}

        <div className="form-section-title">
          Demographics &amp; Department
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Full Name *</label>

            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div
            className="grid-2"
            style={{ gap: '0.75rem' }}
          >
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

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Phone Number</label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
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
              {[
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-',
              ].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
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
              <option value="General Medicine">
                General Medicine
              </option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Presenting Symptoms (comma-separated)
          </label>

          <input
            type="text"
            name="symptoms"
            value={formData.symptoms}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Past Medical History (comma-separated)
          </label>

          <input
            type="text"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div className="form-section-title">
          Current Vital Signs
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">
              Heart Rate (bpm)
            </label>

            <input
              type="number"
              name="heartRate"
              min="0"
              value={formData.heartRate}
              onChange={handleInputChange}
              className="form-input"
            />
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
              Normal: 60–100 bpm | Range: 30–180 bpm
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Blood Pressure (mmHg)
            </label>

            <input
              type="text"
              name="bloodPressure"
              value={formData.bloodPressure}
              onChange={handleInputChange}
              className="form-input"
            />
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
              Normal: 120/80 (Sys: 90–120, Dia: 60–80)
            </span>
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
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
              Normal: 95–100% | Range: 50–100%
            </span>
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">
              Temperature (°C)
            </label>

            <input
              type="number"
              step="0.1"
              name="temperature"
              value={formData.temperature}
              onChange={handleInputChange}
              className="form-input"
            />
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
              Normal: 36.5–37.5 °C | Range: 30.0–43.0 °C
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Resp Rate (/min)
            </label>

            <input
              type="number"
              name="respiratoryRate"
              min="0"
              value={formData.respiratoryRate}
              onChange={handleInputChange}
              className="form-input"
            />
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
              Normal: 12–20 breaths/min | Range: 8–40
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Blood Glucose (mg/dL)
            </label>

            <input
              type="number"
              name="bloodGlucose"
              min="0"
              value={formData.bloodGlucose}
              onChange={handleInputChange}
              className="form-input"
            />
            <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
              Normal: 70–140 mg/dL | Range: 40–500
            </span>
          </div>
        </div>

        <div className="form-section-title">
          Emergency Contact
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">
              Contact Name
            </label>

            <input
              type="text"
              name="emergencyName"
              value={formData.emergencyName}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Relationship
            </label>

            <input
              type="text"
              name="emergencyRelation"
              value={formData.emergencyRelation}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Contact Phone
            </label>

            <input
              type="text"
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Patient Changes'}
          </button>
        </div>

      </form>
    </Modal>
  );
};