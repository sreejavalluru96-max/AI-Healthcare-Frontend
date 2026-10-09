import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleConfirmClick = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="480px">
      <div className="confirm-modal-body">
        <div className={`confirm-icon-box ${variant}`}>
          {variant === 'danger' ? (
            <Trash2 size={28} />
          ) : variant === 'warning' ? (
            <AlertTriangle size={28} />
          ) : (
            <CheckCircle2 size={28} />
          )}
        </div>

        <p className="confirm-message-text">{message}</p>

        <div className="confirm-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleConfirmClick}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>

      <style>{`
        .confirm-modal-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0.5rem 0;
        }
        .confirm-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .confirm-icon-box.danger {
          background-color: #fee2e2;
          color: #dc2626;
        }
        .confirm-icon-box.warning {
          background-color: #fef3c7;
          color: #d97706;
        }
        .confirm-icon-box.success {
          background-color: #dcfce7;
          color: #16a34a;
        }

        .confirm-message-text {
          font-size: 1rem;
          color: var(--text-primary);
          line-height: 1.5;
          margin-bottom: 1.75rem;
        }

        .confirm-modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          width: 100%;
        }
      `}</style>
    </Modal>
  );
};
