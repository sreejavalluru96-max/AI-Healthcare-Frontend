import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <Activity size={22} className="footer-icon" />
            <span className="footer-title">MediQueue</span>
          </div>
          <p className="footer-desc">
            Hospital Management & AI-Assisted Emergency Triage System. Designed for high-acuity clinical decision support.
          </p>
          <div className="footer-badges">
            <span className="footer-pill"><ShieldCheck size={14} /> Clinical Prototype</span>
            <span className="footer-pill"><HeartPulse size={14} /> FastAPI Integration Ready</span>
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/patients">Patients Directory</Link></li>
              <li><Link to="/reports">Reports & Analytics</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Clinical Tools</h4>
            <ul className="footer-links">
              <li><Link to="/ai-assessment">AI Risk Assessment</Link></li>
              <li><Link to="/priority-queue">Emergency Priority Queue</Link></li>
              <li><Link to="/treatment">Treatment Workflow</Link></li>
              <li><Link to="/system-status">System Status</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>© {new Date().getFullYear()} MediQueue Systems. Frontend Clinical Prototype — Decision support only.</p>
        </div>
      </div>

      <style>{`
        .site-footer {
          background-color: var(--bg-nav);
          color: var(--text-nav-muted);
          border-top: 1px solid var(--border-nav);
          padding-top: 3rem;
          margin-top: auto;
        }
        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem 3rem;
          display: flex;
          justify-content: space-between;
          gap: 3rem;
          flex-wrap: wrap;
        }
        .footer-brand {
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          color: #ffffff;
        }
        .footer-icon {
          color: var(--primary-500);
        }
        .footer-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
        }
        .footer-desc {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-nav-muted);
        }
        .footer-badges {
          display: flex;
          gap: 0.625rem;
          flex-wrap: wrap;
        }
        .footer-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-nav);
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--text-nav);
        }
        .footer-links-group {
          display: flex;
          gap: 4rem;
          flex-wrap: wrap;
        }
        .footer-col-title {
          color: #ffffff;
          font-size: 0.9375rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .footer-links a {
          color: var(--text-nav-muted);
          font-size: 0.875rem;
          transition: color var(--transition-fast);
        }
        .footer-links a:hover {
          color: var(--primary-500);
        }
        .footer-bottom {
          border-top: 1px solid var(--border-nav);
          background-color: #0b1120;
          padding: 1.25rem 1.5rem;
        }
        .footer-bottom-content {
          max-width: 1280px;
          margin: 0 auto;
          font-size: 0.8125rem;
          text-align: center;
          color: #64748b;
        }
      `}</style>
    </footer>
  );
};
