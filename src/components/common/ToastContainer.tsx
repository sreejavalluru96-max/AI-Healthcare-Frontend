import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 size={20} className="toast-icon success" />;
            case 'warning':
              return <AlertTriangle size={20} className="toast-icon warning" />;
            case 'error':
              return <AlertOctagon size={20} className="toast-icon error" />;
            default:
              return <Info size={20} className="toast-icon info" />;
          }
        };

        return (
          <div key={toast.id} className={`toast-card toast-${toast.type}`}>
            <div className="toast-content">
              {getIcon()}
              <div className="toast-text-box">
                <div className="toast-title">{toast.title}</div>
                <div className="toast-message">{toast.message}</div>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close"
              aria-label="Dismiss toast"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}

      <style>{`
        .toast-viewport {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          z-index: 2000;
          max-width: 420px;
          width: calc(100% - 3rem);
          pointer-events: none;
        }
        .toast-card {
          pointer-events: auto;
          background: #ffffff;
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
          border-left: 4px solid #cbd5e1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .toast-success { border-left-color: #16a34a; }
        .toast-warning { border-left-color: #d97706; }
        .toast-error { border-left-color: #dc2626; }
        .toast-info { border-left-color: #0284c7; }
        
        .toast-content {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .toast-icon.success { color: #16a34a; }
        .toast-icon.warning { color: #d97706; }
        .toast-icon.error { color: #dc2626; }
        .toast-icon.info { color: #0284c7; }
        
        .toast-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        .toast-message {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin-top: 0.125rem;
        }
        .toast-close {
          color: var(--text-muted);
          padding: 0.25rem;
          border-radius: 4px;
        }
        .toast-close:hover {
          color: var(--text-primary);
          background-color: #f1f5f9;
        }
      `}</style>
    </div>
  );
};
