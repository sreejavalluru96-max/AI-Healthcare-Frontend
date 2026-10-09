import React, { useState } from 'react';
import { Modal } from './Modal';
import { Doctor, Patient } from '../../types';
import { UserCheck, Stethoscope, CheckCircle2, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isDoctorBusy } from '../../services/api/doctorService';

interface DoctorAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  doctors: Doctor[];
  onAssign: (patientId: string, doctorId: string) => Promise<void>;
}

export const DoctorAssignmentModal: React.FC<DoctorAssignmentModalProps> = ({
  isOpen,
  onClose,
  patient,
  doctors,
  onAssign,
}) => {
  const { patients } = useApp();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  if (!patient) return null;

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;

    setIsAssigning(true);
    try {
      await onAssign(patient.id, selectedDoctorId);
      onClose();
    } catch (err) {
      console.error('Failed to assign doctor', err);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Attending Physician"
      subtitle={`Assign a qualified doctor to ${patient.name} (${patient.id}) — ${patient.department}`}
      maxWidth="620px"
    >
      <form onSubmit={handleAssignSubmit} className="doctor-assignment-form">
        <div className="patient-target-card mb-3">
          <div>
            <strong>{patient.name}</strong> ({patient.id})
            <div className="text-muted font-sm">{patient.age} yrs • {patient.gender} • {patient.department}</div>
          </div>
          <div className="text-right">
            <span className="info-lbl">Assigned Doctor</span>
            <span className="font-bold text-cyan">
              {patient.assignedDoctor && patient.assignedDoctor !== 'Unassigned' && patient.assignedDoctor !== 'Not Assigned' ? patient.assignedDoctor : 'Unassigned'}
            </span>
          </div>
        </div>

        <h4 className="form-label mb-2">Available Physicians ({doctors.length})</h4>

        <div className="doctors-list-grid mb-4">
          {doctors.map((doc) => {
            const isSelected = selectedDoctorId === doc.id;
            const isBusyWithOtherActive = isDoctorBusy(doc.id, doc.name, patient.id, patients);
            const isCurrentlyAssignedToThisPatient = Boolean(
              (patient.assignedDoctorId && patient.assignedDoctorId === doc.id) ||
              (patient.assignedDoctor && patient.assignedDoctor.trim().toLowerCase() === doc.name.trim().toLowerCase())
            );
            const isAvailable = !isBusyWithOtherActive || isCurrentlyAssignedToThisPatient;

            return (
              <div
                key={doc.id}
                className={`doctor-select-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                onClick={() => {
                  if (isAvailable) setSelectedDoctorId(doc.id);
                }}
              >
                <div className="doc-avatar-box">
                  <Stethoscope size={20} />
                </div>
                <div className="doc-info-col">
                  <div className="doc-name">{doc.name}</div>
                  <div className="doc-spec">{doc.specialization}</div>
                  <div className="doc-meta-row">
                    <span><Building2 size={12} /> {doc.department}</span>
                    <span>{isAvailable ? (isCurrentlyAssignedToThisPatient ? 'Assigned to Patient' : 'Available') : 'Assigned to Active Patient'}</span>
                  </div>
                </div>

                <div className="doc-status-col">
                  <span className={`doc-avail-pill ${isAvailable ? 'available' : 'busy'}`}>
                    {isAvailable ? 'Available' : 'Busy'}
                  </span>
                  {isSelected && (
                    <CheckCircle2 size={20} className="text-cyan mt-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedDoctorId || isAssigning}
            className="btn btn-primary"
          >
            {isAssigning ? 'Assigning...' : 'Confirm Doctor Assignment'}
          </button>
        </div>
      </form>

      <style>{`
        .patient-target-card {
          display: flex;
          justify-content: space-between;
          background-color: #f8fafc;
          padding: 0.875rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }
        .doctors-list-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 320px;
          overflow-y: auto;
        }
        .doctor-select-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background-color: #ffffff;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .doctor-select-card:hover:not(.disabled) {
          border-color: var(--primary-500);
          background-color: #f0f9ff;
        }
        .doctor-select-card.selected {
          border-color: var(--primary-600);
          background-color: #e0f2fe;
          box-shadow: 0 2px 6px rgba(2, 132, 199, 0.2);
        }
        .doctor-select-card.disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .doc-avatar-box {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-sm);
          background-color: #e0f2fe;
          color: var(--primary-700);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .doc-info-col {
          flex: 1;
        }
        .doc-name {
          font-weight: 700;
          font-size: 0.95rem;
        }
        .doc-spec {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }
        .doc-meta-row {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .doc-status-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .doc-avail-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .doc-avail-pill.available {
          background-color: #dcfce7;
          color: #15803d;
        }
        .doc-avail-pill.busy {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
      `}</style>
    </Modal>
  );
};
