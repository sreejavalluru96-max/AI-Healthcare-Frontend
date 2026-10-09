import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Users,
  BarChart3,
  Brain,
  AlertTriangle,
  Stethoscope,
  Server,
  Home as HomeIcon,
  Menu,
  X,
  RotateCcw,
  ArrowRight,
  Workflow,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const { patients, resetDemoData } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const criticalCount = patients.filter(
    (p) => p.status === 'CRITICAL' && p.treatmentStatus !== 'COMPLETED'
  ).length;

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // If on Landing Page (/), render dark minimal landing header
  if (isHomePage) {
    return (
      <header className="home-site-header">
        <div className="home-nav-container">
          <Link to="/" className="brand-logo">
            <div className="logo-icon-box">
              <Activity className="logo-icon" size={22} />
            </div>
            <div className="logo-text-box">
              <span className="logo-title">MediQueue</span>
            </div>
          </Link>

          <div className="home-nav-actions">
            <Link to="/patients" className="btn-enter-dashboard">
              <span>Enter Dashboard</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <style>{`
          .home-site-header {
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid #D7E8F5;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 4px 20px rgba(16, 42, 67, 0.04);
          }
          .home-nav-container {
            max-width: 1240px;
            margin: 0 auto;
            padding: 0 1.5rem;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .brand-logo {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            color: #102A43;
            text-decoration: none;
          }
          .logo-icon-box {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: linear-gradient(135deg, #087FC1, #12BDEB);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            box-shadow: 0 2px 8px rgba(18, 189, 235, 0.3);
          }
          .logo-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 1.2rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #102A43;
          }
          .btn-enter-dashboard {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, #087FC1, #12BDEB);
            color: #ffffff;
            padding: 0.45rem 1rem;
            border-radius: 6px;
            font-size: 0.8125rem;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(18, 189, 235, 0.3);
          }
          .btn-enter-dashboard:hover {
            background: linear-gradient(135deg, #066fa9, #0fb1dd);
            transform: translateY(-1px);
          }
          .mr-2 { margin-right: 0.5rem; }
        `}</style>
      </header>
    );
  }

  // Standard Header for Dashboard Application pages (/patients, /reports, etc.)
  return (
    <header className="site-header">
      <div className="nav-container">
        {/* Logo & Home Link */}
        <div className="logo-group">
          <Link to="/" className="brand-logo" onClick={closeMobileMenu}>
            <div className="logo-icon-box">
              <Activity className="logo-icon" size={24} />
            </div>
            <div className="logo-text-box">
              <span className="logo-title">MediQueue</span>
              <span className="logo-tagline">AI Emergency Triage</span>
            </div>
          </Link>

          {criticalCount > 0 && (
            <Link to="/priority-queue" className="critical-alert-pill">
              <span className="pulse-dot"></span>
              <AlertTriangle size={14} />
              <span>{criticalCount} Critical Case{criticalCount > 1 ? 's' : ''}</span>
            </Link>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <HomeIcon size={16} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/patients"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Users size={16} />
            <span>Patients</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <BarChart3 size={16} />
            <span>Reports & Analytics</span>
          </NavLink>

          <NavLink
            to="/ai-assessment"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Brain size={16} />
            <span>AI Assessment</span>
          </NavLink>

          <NavLink
            to="/priority-queue"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <AlertTriangle size={16} />
            <span>Priority Queue</span>
          </NavLink>

          <NavLink
            to="/treatment"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Stethoscope size={16} />
            <span>Treatment</span>
          </NavLink>

          <NavLink
            to="/system-status"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Server size={16} />
            <span>System Status</span>
          </NavLink>
        </nav>

        {/* Right side actions */}
        <div className="nav-actions">
          <button
            onClick={resetDemoData}
            className="btn-reset-demo"
            title="Reset dataset to initial state"
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>

          <button className="mobile-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="mobile-nav">
          <NavLink to="/" end onClick={closeMobileMenu} className="mobile-nav-item">
            <HomeIcon size={18} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/patients" onClick={closeMobileMenu} className="mobile-nav-item">
            <Users size={18} />
            <span>Patients</span>
          </NavLink>
          <NavLink to="/reports" onClick={closeMobileMenu} className="mobile-nav-item">
            <BarChart3 size={18} />
            <span>Reports & Analytics</span>
          </NavLink>
          <NavLink to="/ai-assessment" onClick={closeMobileMenu} className="mobile-nav-item">
            <Brain size={18} />
            <span>AI Assessment</span>
          </NavLink>
          <NavLink to="/priority-queue" onClick={closeMobileMenu} className="mobile-nav-item">
            <AlertTriangle size={18} />
            <span>Priority Queue</span>
          </NavLink>
          <NavLink to="/treatment" onClick={closeMobileMenu} className="mobile-nav-item">
            <Stethoscope size={18} />
            <span>Treatment</span>
          </NavLink>
          <NavLink to="/system-status" onClick={closeMobileMenu} className="mobile-nav-item">
            <Server size={18} />
            <span>System Status</span>
          </NavLink>
        </nav>
      )}

      <style>{`
        .site-header {
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #D7E8F5;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 15px rgba(16, 42, 67, 0.04);
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #102A43;
          transition: opacity var(--transition-fast);
        }

        .brand-logo:hover {
          opacity: 0.9;
        }

        .logo-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #087FC1, #12BDEB);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(18, 189, 235, 0.3);
        }

        .logo-text-box {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #102A43;
          line-height: 1.1;
        }

        .logo-tagline {
          font-size: 0.7rem;
          color: #087FC1;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .critical-alert-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          animation: pulseBorder 2s infinite;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #DC2626;
          box-shadow: 0 0 6px #DC2626;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          color: #52677D;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .nav-item:hover {
          color: #087FC1;
          background-color: rgba(8, 127, 193, 0.08);
        }

        .nav-item.active {
          color: #087FC1;
          background-color: #E8F5FF;
          border: 1px solid #D7E8F5;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(8, 127, 193, 0.08);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-reset-demo {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid #D7E8F5;
          background: #FFFFFF;
          color: #52677D;
          font-size: 0.75rem;
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .btn-reset-demo:hover {
          color: #087FC1;
          border-color: #087FC1;
          background: #E8F5FF;
        }

        .mobile-toggle {
          display: none;
          color: #102A43;
        }

        .mobile-nav {
          display: none;
          background-color: #FFFFFF;
          border-top: 1px solid #D7E8F5;
          padding: 1rem 1.5rem;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          color: #52677D;
          font-size: 1rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
        }

        .mobile-nav-item.active {
          background-color: #E8F5FF;
          color: #087FC1;
        }

        @media (max-width: 1100px) {
          .desktop-nav {
            display: none;
          }
          .mobile-toggle {
            display: block;
          }
          .mobile-nav {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
};
