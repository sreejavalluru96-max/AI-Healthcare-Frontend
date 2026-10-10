import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  AlertTriangle,
  Brain,
  Zap,
  Users,
  ClipboardList,
  BarChart3,
  Stethoscope,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Pill,
  CheckCircle,
  Activity,
  Radio,
  Cpu,
  HeartPulse,
  FileText,
  Layers,
  Activity as ECGIcon
} from 'lucide-react';
import { HeroScene3D } from '../components/3d/HeroScene3D';
import { PageTransition } from '../components/common/PageTransition';
import { Footer } from '../components/layout/Footer';
import hospitalBg from '../assets/hospital-hero-bg.png';

export const Home: React.FC = () => {
  const { patients } = useApp();

  // Dynamic Metrics derived directly from live backend / AppContext patient records
  const totalPatients = patients.length;
  const criticalCount = patients.filter((p) => p.status === 'CRITICAL').length;
  const highCount = patients.filter((p) => p.status === 'HIGH').length;
  const observationCount = patients.filter(
    (p) => p.treatmentStatus === 'IN_PROGRESS' || p.treatmentStatus === 'OBSERVATION'
  ).length;
  const completedCount = patients.filter(
    (p) => p.treatmentStatus === 'COMPLETED' || p.treatmentStatus === 'Completed'
  ).length;

  // Real patient reference for dynamic 3D hero panel
  const topCriticalPatient = patients.find((p) => p.status === 'CRITICAL') || patients[0];

  // Mouse tilt tracking state for 3D interactive hero card parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12; // -6deg to +6deg tilt
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    const bgX = ((e.clientX - rect.left) / rect.width - 0.5) * -15; // background subtle parallax
    const bgY = ((e.clientY - rect.top) / rect.height - 0.5) * -15;
    setMousePos({ x, y, bgX, bgY });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0, bgX: 0, bgY: 0 });
  };

  // Smooth scroll handler for anchor links
  const scrollToSection = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PageTransition>
      <div className="home-landing-page">
        {/* ===================================================
            CINEMATIC HOSPITAL HERO SECTION
           =================================================== */}
        <section
          className="hospital-hero-section"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Direct Hospital Ward Background Image Layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <img
              src={hospitalBg}
              alt="Hospital Ward Corridor"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                transform: `scale(1.04) translate(${mousePos.bgX}px, ${mousePos.bgY}px)`,
                transition: 'transform 0.2s ease-out',
                filter: 'contrast(1.03) brightness(1.02)',
              }}
            />
            {/* Left-focused gradient overlay for crystal clear text contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.72) 42%, rgba(255, 255, 255, 0.25) 75%, rgba(255, 255, 255, 0.05) 100%)',
              }}
            />
          </div>
          <div className="hero-container max-w-7xl">
            <div className="hero-split-grid">
              
              {/* LEFT CONTENT AREA */}
              <div className="hero-left-content">
                
                {/* 1. Small Glass-Style Eyebrow Badge */}
                <div className="glass-badge-pill">
                  <span className="badge-glow-dot" />
                  <span className="badge-text font-mono">
                    AI-POWERED HEALTHCARE PLATFORM
                  </span>
                </div>

                {/* 2. Main Heading (Exact Title from Request) */}
                <h1 className="hero-main-title">
                  AI-Powered Healthcare &amp;<br />
                  <span className="title-accent-gradient">
                    Patient Information Management System
                  </span>
                </h1>

                {/* 3. Supporting Headline & Tagline */}
                <div className="hero-tagline-block">
                  <h2 className="hero-headline-sub">
                    Smarter Healthcare. More Connected Care.
                  </h2>
                  <p className="hero-tagline-quote">
                    “Intelligent Patient Care. Smarter Decisions. Healthier Tomorrows.”
                  </p>
                </div>

                {/* 4. Supporting Description */}
                <p className="hero-description-text">
                  A unified healthcare platform that organizes patient information, manages clinical records, and supports AI-assisted risk assessment and emergency prioritization.
                </p>

                {/* 5. Modern Action Buttons */}
                <div className="hero-action-buttons">
                  <Link to="/patients" className="btn-explore-platform group">
                    <span>Explore Platform</span>
                    <div className="btn-arrow-circle">
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>

                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="btn-how-it-works group"
                  >
                    <Layers size={18} className="text-[#1687D4] group-hover:scale-110 transition-transform" />
                    <span>How It Works</span>
                  </button>
                </div>

                {/* 6. Three Feature Indicators */}
                <div className="hero-feature-indicators">
                  <div className="indicator-item">
                    <div className="indicator-icon-box">
                      <FileText size={16} className="text-[#1687D4]" />
                    </div>
                    <span className="indicator-label">Centralized Patient Records</span>
                  </div>

                  <div className="indicator-divider" />

                  <div className="indicator-item">
                    <div className="indicator-icon-box">
                      <Brain size={16} className="text-[#16B8B0]" />
                    </div>
                    <span className="indicator-label">AI-Assisted Risk Assessment</span>
                  </div>

                  <div className="indicator-divider" />

                  <div className="indicator-item">
                    <div className="indicator-icon-box">
                      <AlertTriangle size={16} className="text-amber-500" />
                    </div>
                    <span className="indicator-label">Emergency Priority Management</span>
                  </div>
                </div>

              </div>

              {/* RIGHT VISUAL AREA — 3D-INSPIRED HEALTHCARE COMPOSITION */}
              <div className="hero-right-visual">
                <div
                  className="hero-3d-wrapper"
                  style={{
                    transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
                  }}
                >
                  {/* Main Glass Dashboard Shell */}
                  <div className="glass-dashboard-card">
                    
                    {/* Glass Header Bar */}
                    <div className="dashboard-glass-header">
                      <div className="dash-brand-title">
                        <div className="pulse-cross-icon">
                          <HeartPulse size={18} className="text-[#1687D4]" />
                        </div>
                        <span className="dash-header-label">
                          Clinical AI &amp; Risk Command Center
                        </span>
                      </div>
                      <div className="dash-live-badge">
                        <span className="live-ping-dot" />
                        <span>LIVE MONITORING</span>
                      </div>
                    </div>

                    {/* ECG Line Motion Graphic */}
                    <div className="ecg-graphic-bar">
                      <svg viewBox="0 0 500 40" className="ecg-svg-line" preserveAspectRatio="none">
                        <path
                          d="M 0 20 L 100 20 L 110 5 L 120 35 L 130 10 L 140 25 L 150 20 L 250 20 L 260 0 L 270 40 L 280 12 L 290 28 L 300 20 L 500 20"
                          fill="none"
                          stroke="url(#ecgGradient)"
                          strokeWidth="2.5"
                        />
                        <defs>
                          <linearGradient id="ecgGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#1687D4" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#16B8B0" stopOpacity="1" />
                            <stop offset="100%" stopColor="#1687D4" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Central 3D Visual Stage */}
                    <div className="dash-3d-stage-viewport">
                      <HeroScene3D height="320px" />
                    </div>

                    {/* FLOATING GLASS DATA CARDS (Layered Depth) */}
                    
                    {/* Floating Card 1: Patient Record Card */}
                    <div className="float-card card-patient-record">
                      <div className="float-card-header">
                        <Users size={14} className="text-[#1687D4]" />
                        <span>Patient Directory</span>
                      </div>
                      <div className="float-card-big-val font-mono">{totalPatients} Active</div>
                      <div className="float-card-sub text-slate-500">Synchronized Records</div>
                    </div>

                    {/* Floating Card 2: AI Risk Assessment Visualization */}
                    <div className="float-card card-ai-risk">
                      <div className="float-card-header text-purple-700">
                        <Brain size={14} className="text-purple-600 animate-pulse" />
                        <span>AI Risk Engine</span>
                      </div>
                      {topCriticalPatient ? (
                        <>
                          <div className="float-card-big-val text-red-600 font-bold truncate max-w-[130px]">
                            {topCriticalPatient.name}
                          </div>
                          <div className="float-card-sub text-red-500 font-mono">
                            Risk Score: {topCriticalPatient.latestAssessment?.riskScore || 92}/100 ({topCriticalPatient.status})
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="float-card-big-val text-[#1687D4]">Score 92/100</div>
                          <div className="float-card-sub text-slate-500">Emergency Priority</div>
                        </>
                      )}
                    </div>

                    {/* Floating Card 3: Emergency Priority Indicator */}
                    <div className="float-card card-emergency-priority">
                      <div className="float-card-header text-amber-700">
                        <AlertTriangle size={14} className="text-amber-500" />
                        <span>Priority Queue</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-600">Critical:</span>
                        <span className="text-sm font-bold text-red-600">{criticalCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">High Risk:</span>
                        <span className="text-sm font-bold text-orange-500">{highCount}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* INTEGRATED LIVE HOSPITAL STATUS COUNTERS STRIP */}
            <div className="hospital-status-strip-container">
              <div className="strip-top-bar">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#1687D4]" />
                  <span className="strip-heading-title">LIVE SYSTEM METRICS</span>
                </div>
                <span className="strip-[#123B67] text-xs font-mono text-slate-500">
                  PostgreSQL &amp; FastAPI Backend Synchronized
                </span>
              </div>

              <div className="strip-grid-metrics">
                {/* Metric 1 */}
                <div className="strip-card-item">
                  <div className="metric-box-icon icon-blue">
                    <Users size={18} className="text-[#1687D4]" />
                  </div>
                  <div>
                    <div className="metric-number-val">{totalPatients}</div>
                    <div className="metric-label-text">Total Patients</div>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="strip-card-item">
                  <div className="metric-box-icon icon-red">
                    <AlertTriangle size={18} className="text-red-500" />
                  </div>
                  <div>
                    <div className="metric-number-val text-red-600">{criticalCount}</div>
                    <div className="metric-label-text">Critical Cases</div>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="strip-card-item">
                  <div className="metric-box-icon icon-orange">
                    <Activity size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <div className="metric-number-val text-orange-600">{highCount}</div>
                    <div className="metric-label-text">High Risk Queue</div>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="strip-card-item">
                  <div className="metric-box-icon icon-amber">
                    <Zap size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <div className="metric-number-val text-amber-600">{observationCount}</div>
                    <div className="metric-label-text">Under Observation</div>
                  </div>
                </div>

                {/* Metric 5 */}
                <div className="strip-card-item">
                  <div className="metric-box-icon icon-emerald">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="metric-number-val text-emerald-600">{completedCount}</div>
                    <div className="metric-label-text">Treatments Completed</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ===================================================
            SECTION 1 — VISUAL PATIENT WORKFLOW PIPELINE (How It Works)
           =================================================== */}
        <section id="how-it-works" className="landing-section bg-[#F2F8FC] border-t border-sky-100">
          <div className="landing-container max-w-7xl">
            <div className="section-header text-center">
              <span className="section-eyebrow-badge">CLINICAL WORKFLOW ARCHITECTURE</span>
              <h2 className="section-main-heading">Visual Patient Flow &amp; Triage Lifecycle</h2>
              <p className="section-sub-paragraph">
                From immediate emergency intake to AI risk assessment, physician assignment, and finalized medical treatment.
              </p>
            </div>

            <div className="workflow-pipeline-scroll">
              <div className="workflow-nodes-row">
                
                {/* Stage 1 */}
                <div className="pipeline-step-card group">
                  <div className="step-number-tag font-mono">01</div>
                  <div className="step-icon-circle bg-sky-50 text-[#1687D4] border-sky-200 group-hover:border-[#1687D4]">
                    <Users size={22} />
                  </div>
                  <h3 className="step-card-title">Patient Intake</h3>
                  <p className="step-card-desc">Registration, personal information &amp; chief complaints.</p>
                </div>

                <div className="pipeline-connector-beam">
                  <div className="beam-glow-dot" />
                </div>

                {/* Stage 2 */}
                <div className="pipeline-step-card group">
                  <div className="step-number-tag font-mono">02</div>
                  <div className="step-icon-circle bg-teal-50 text-[#16B8B0] border-teal-200 group-hover:border-[#16B8B0]">
                    <ClipboardList size={22} />
                  </div>
                  <h3 className="step-card-title">Vitals &amp; Triage</h3>
                  <p className="step-card-desc">Heart rate, BP, oxygen saturation &amp; initial observations.</p>
                </div>

                <div className="pipeline-connector-beam">
                  <div className="beam-glow-dot" />
                </div>

                {/* Stage 3 */}
                <div className="pipeline-step-card highlight-purple-card group">
                  <div className="step-number-tag font-mono text-purple-700">03</div>
                  <div className="step-icon-circle bg-purple-100 text-purple-700 border-purple-300 group-hover:border-purple-600">
                    <Brain size={22} />
                  </div>
                  <h3 className="step-card-title text-purple-950">AI Risk Assessment</h3>
                  <p className="step-card-desc text-purple-800">Automated 0–100 risk scoring &amp; severity rating.</p>
                </div>

                <div className="pipeline-connector-beam">
                  <div className="beam-glow-dot" />
                </div>

                {/* Stage 4 */}
                <div className="pipeline-step-card group">
                  <div className="step-number-tag font-mono">04</div>
                  <div className="step-icon-circle bg-indigo-50 text-indigo-600 border-indigo-200 group-hover:border-indigo-500">
                    <Stethoscope size={22} />
                  </div>
                  <h3 className="step-card-title">Doctor Assignment</h3>
                  <p className="step-card-desc">Automatic queueing to appropriate attending physician.</p>
                </div>

                <div className="pipeline-connector-beam">
                  <div className="beam-glow-dot" />
                </div>

                {/* Stage 5 */}
                <div className="pipeline-step-card group">
                  <div className="step-number-tag font-mono">05</div>
                  <div className="step-icon-circle bg-amber-50 text-amber-600 border-amber-200 group-hover:border-amber-500">
                    <Zap size={22} />
                  </div>
                  <h3 className="step-card-title">Treatment &amp; Care</h3>
                  <p className="step-card-desc">Active intervention, monitoring &amp; clinical notes.</p>
                </div>

                <div className="pipeline-connector-beam">
                  <div className="beam-glow-dot" />
                </div>

                {/* Stage 6 */}
                <div className="pipeline-step-card group">
                  <div className="step-number-tag font-mono">06</div>
                  <div className="step-icon-circle bg-blue-50 text-[#123B67] border-blue-200 group-hover:border-[#123B67]">
                    <Pill size={22} />
                  </div>
                  <h3 className="step-card-title">Prescriptions</h3>
                  <p className="step-card-desc">Medication management &amp; treatment directives.</p>
                </div>

                <div className="pipeline-connector-beam">
                  <div className="beam-glow-dot" />
                </div>

                {/* Stage 7 */}
                <div className="pipeline-step-card highlight-green-card group">
                  <div className="step-number-tag font-mono text-emerald-800">07</div>
                  <div className="step-icon-circle bg-emerald-100 text-emerald-700 border-emerald-300 group-hover:border-emerald-600">
                    <CheckCircle size={22} />
                  </div>
                  <h3 className="step-card-title text-emerald-950">Patient Resolution</h3>
                  <p className="step-card-desc text-emerald-800">Treatment completed &amp; clinical record archived.</p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            SECTION 2 — PLATFORM ECOSYSTEM BENTO GRID
           =================================================== */}
        <section id="ecosystem" className="landing-section bg-white border-t border-sky-100">
          <div className="landing-container max-w-7xl">
            <div className="section-header text-center">
              <span className="section-eyebrow-badge">PLATFORM ECOSYSTEM</span>
              <h2 className="section-main-heading">Integrated Healthcare Modules</h2>
              <p className="section-sub-paragraph">
                Seamlessly connected modules powering modern clinical operations and patient information management.
              </p>
            </div>

            <div className="bento-modules-grid">
              
              {/* Module 1: Patient Directory */}
              <div className="bento-glass-wrapper group">
                <div className="bento-card-content">
                  <div className="bento-top-row">
                    <div className="bento-icon-container bg-sky-50 text-[#1687D4]">
                      <Users size={20} />
                    </div>
                    <span className="bento-module-tag">MODULE 01</span>
                  </div>
                  <h3 className="bento-card-heading">Patient Directory &amp; Records</h3>
                  <p className="bento-card-body">
                    Centralized database of patient profiles, vitals history, symptoms, emergency contacts, and assigned clinical care teams.
                  </p>
                  <div className="bento-action-footer">
                    <Link to="/patients" className="bento-nav-link">
                      <span>Access Patients</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Module 2: AI Risk Intelligence */}
              <div className="bento-glass-wrapper group">
                <div className="bento-card-content border-purple-200 bg-purple-50/20">
                  <div className="bento-top-row">
                    <div className="bento-icon-container bg-purple-100 text-purple-700">
                      <Brain size={20} />
                    </div>
                    <span className="bento-module-tag text-purple-700 font-bold">AI POWERED</span>
                  </div>
                  <h3 className="bento-card-heading text-purple-950">AI Risk Assessment</h3>
                  <p className="bento-card-body">
                    Objective 0–100 risk scoring engine, symptom analysis, vital sign anomaly detection, and decision support alerts.
                  </p>
                  <div className="bento-action-footer">
                    <Link to="/ai-assessment" className="bento-nav-link text-purple-700">
                      <span>Explore AI Assessment</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Module 3: Emergency Priority Queue */}
              <div className="bento-glass-wrapper group">
                <div className="bento-card-content">
                  <div className="bento-top-row">
                    <div className="bento-icon-container bg-amber-50 text-amber-600">
                      <AlertTriangle size={20} />
                    </div>
                    <span className="bento-module-tag text-amber-700 font-bold">LIVE TRIAGE</span>
                  </div>
                  <h3 className="bento-card-heading">Emergency Priority Queue</h3>
                  <p className="bento-card-body">
                    Real-time prioritization queue ensuring high-risk emergency cases automatically move to the top of doctor worklists.
                  </p>
                  <div className="bento-action-footer">
                    <Link to="/priority-queue" className="bento-nav-link">
                      <span>View Priority Queue</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Module 4: Treatment Management */}
              <div className="bento-glass-wrapper group">
                <div className="bento-card-content">
                  <div className="bento-top-row">
                    <div className="bento-icon-container bg-teal-50 text-[#16B8B0]">
                      <Zap size={20} />
                    </div>
                    <span className="bento-module-tag">MODULE 04</span>
                  </div>
                  <h3 className="bento-card-heading">Treatment Workflow</h3>
                  <p className="bento-card-body">
                    Tracks physician assignments, ongoing observations, medical intervention status, and active patient care plans.
                  </p>
                  <div className="bento-action-footer">
                    <Link to="/treatment" className="bento-nav-link">
                      <span>Open Treatment</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Module 5: Clinical Analytics */}
              <div className="bento-glass-wrapper group">
                <div className="bento-card-content">
                  <div className="bento-top-row">
                    <div className="bento-icon-container bg-sky-50 text-[#1687D4]">
                      <BarChart3 size={20} />
                    </div>
                    <span className="bento-module-tag">MODULE 05</span>
                  </div>
                  <h3 className="bento-card-heading">Reports &amp; Analytics</h3>
                  <p className="bento-card-body">
                    Aggregated clinical metrics, triage volume distribution, vital sign historical trends, and hospital efficiency reports.
                  </p>
                  <div className="bento-action-footer">
                    <Link to="/reports" className="bento-nav-link">
                      <span>View Analytics</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Module 6: System Operations */}
              <div className="bento-glass-wrapper group">
                <div className="bento-card-content">
                  <div className="bento-top-row">
                    <div className="bento-icon-container bg-emerald-50 text-emerald-600">
                      <ShieldCheck size={20} />
                    </div>
                    <span className="bento-module-tag text-emerald-700 font-bold">100% HEALTH</span>
                  </div>
                  <h3 className="bento-card-heading">System Status &amp; Integrity</h3>
                  <p className="bento-card-body">
                    Monitors connection health across FastAPI endpoints, PostgreSQL database, AI model readiness, and service latencies.
                  </p>
                  <div className="bento-action-footer">
                    <Link to="/system-status" className="bento-nav-link">
                      <span>Check System Status</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ===================================================
            SECTION 3 — FINAL CALL TO ACTION
           =================================================== */}
        <section className="final-call-to-action bg-gradient-to-b from-[#F2F8FC] to-white border-t border-sky-100">
          <div className="landing-container text-center max-w-3xl">
            <div className="cta-pill-badge">
              <Sparkles size={14} className="text-[#1687D4]" />
              <span>TRANSFORMING PATIENT CARE &amp; EMERGENCY TRIAGE</span>
            </div>

            <h2 className="cta-title-text">
              Intelligent Patient Care.<br />Smarter Decisions. Healthier Tomorrows.
            </h2>
            <p className="cta-desc-text">
              Streamline emergency patient flow, empower clinical decisions with AI risk scoring, and maintain complete patient record organization on one platform.
            </p>
            
            <div className="hero-action-buttons justify-center mb-0">
              <Link to="/priority-queue" className="btn-explore-platform group">
                <span>View Emergency Priority Queue</span>
                <div className="btn-arrow-circle">
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link to="/patients" className="btn-how-it-works">
                <Users size={18} className="text-[#1687D4]" />
                <span>Open Patient Directory</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer Component */}
        <Footer />

        {/* ===================================================
            HOME PAGE SPECIFIC STYLES (Design Token System)
           =================================================== */}
        <style>{`
          /* Core Page Canvas */
          .home-landing-page {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #F2F8FC;
            color: #123B67;
            overflow-x: hidden;
            width: 100%;
          }

          /* --------------------------------------------------
             CINEMATIC HOSPITAL HERO SECTION & BACKGROUND
             -------------------------------------------------- */
          .hospital-hero-section {
            position: relative;
            min-height: 90vh;
            padding: 4.5rem 1.5rem 3.5rem;
            display: flex;
            align-items: center;
            overflow: hidden;
            background-image: url('/images/hospital-image.png') !important;
            background-size: cover !important;
            background-position: center center !important;
            background-repeat: no-repeat !important;
          }

          .hero-container {
            position: relative;
            z-index: 5;
            margin: 0 auto;
            width: 100%;
          }

          .hero-split-grid {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 3.5rem;
            align-items: center;
            margin-bottom: 3rem;
          }

          @media (max-width: 1024px) {
            .hero-split-grid {
              grid-template-columns: 1fr;
              gap: 2.5rem;
            }
          }

          /* --------------------------------------------------
             LEFT CONTENT AREA
             -------------------------------------------------- */
          .hero-left-content {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            background: rgba(255, 255, 255, 0.84);
            border: 1px solid rgba(255, 255, 255, 0.95);
            outline: 1px solid rgba(22, 135, 212, 0.18);
            padding: 2.25rem 2.5rem;
            border-radius: 24px;
            backdrop-filter: blur(16px);
            box-shadow: 0 16px 40px rgba(18, 59, 103, 0.12), inset 0 1px 1px #ffffff;
            max-width: 620px;
          }

          @media (max-width: 1024px) {
            .hero-left-content {
              align-items: center;
              text-align: center;
              padding: 1.75rem 1.5rem;
            }
          }

          /* Glass Badge Pill */
          .glass-badge-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.625rem;
            background: #ffffff;
            border: 1px solid rgba(22, 135, 212, 0.3);
            padding: 0.35rem 1.1rem;
            border-radius: 9999px;
            margin-bottom: 1.25rem;
            box-shadow: 0 4px 15px rgba(22, 135, 212, 0.1);
            backdrop-filter: blur(12px);
            animation: fadeInDown 0.8s ease-out;
          }

          .badge-glow-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #16B8B0;
            box-shadow: 0 0 10px #16B8B0;
            animation: pulseDot 2s infinite ease-in-out;
          }

          @keyframes pulseDot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
          }

          .badge-text {
            font-size: 0.72rem;
            font-weight: 800;
            color: #0284C7;
            letter-spacing: 0.08em;
          }

          /* Main Title */
          .hero-main-title {
            font-size: 2.65rem;
            font-weight: 900;
            line-height: 1.18;
            letter-spacing: -0.03em;
            color: #0F2942;
            margin-bottom: 1rem;
            animation: fadeInUp 0.9s ease-out;
          }

          @media (max-width: 1024px) {
            .hero-main-title {
              font-size: 2.15rem;
            }
          }

          .title-accent-gradient {
            background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
          }

          /* Tagline & Headline */
          .hero-tagline-block {
            margin-bottom: 1rem;
          }

          .hero-headline-sub {
            font-size: 1.25rem;
            font-weight: 800;
            color: #0284C7;
            margin-bottom: 0.35rem;
          }

          .hero-tagline-quote {
            font-size: 0.95rem;
            font-style: italic;
            font-weight: 700;
            color: #0D9488;
          }

          /* Description */
          .hero-description-text {
            font-size: 1.05rem;
            line-height: 1.6;
            color: #1E293B;
            font-weight: 500;
            margin-bottom: 1.75rem;
            max-width: 580px;
          }

          /* Action Buttons */
          .hero-action-buttons {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
            margin-bottom: 2.25rem;
          }

          .btn-explore-platform {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            background: linear-gradient(135deg, #123B67 0%, #1687D4 100%);
            color: #ffffff;
            padding: 0.875rem 1.65rem;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 0.95rem;
            box-shadow: 0 6px 20px rgba(22, 135, 212, 0.32);
            transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .btn-explore-platform:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(22, 135, 212, 0.45);
          }

          .btn-arrow-circle {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-how-it-works {
            display: inline-flex;
            align-items: center;
            gap: 0.625rem;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(22, 135, 212, 0.3);
            color: #123B67;
            padding: 0.875rem 1.5rem;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 0.95rem;
            box-shadow: 0 4px 14px rgba(18, 59, 103, 0.05);
            backdrop-filter: blur(8px);
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .btn-how-it-works:hover {
            background: #ffffff;
            border-color: #1687D4;
            color: #1687D4;
            transform: translateY(-2px);
          }

          /* Feature Indicators */
          .hero-feature-indicators {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(255, 255, 255, 0.75);
            border: 1px solid rgba(22, 135, 212, 0.18);
            border-radius: 16px;
            padding: 0.75rem 1.25rem;
            backdrop-filter: blur(12px);
            box-shadow: 0 4px 18px rgba(18, 59, 103, 0.04);
            flex-wrap: wrap;
          }

          @media (max-width: 640px) {
            .hero-feature-indicators {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.75rem;
            }
            .indicator-divider {
              display: none;
            }
          }

          .indicator-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .indicator-icon-box {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            background: rgba(22, 135, 212, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .indicator-label {
            font-size: 0.8125rem;
            font-weight: 700;
            color: #123B67;
          }

          .indicator-divider {
            width: 1px;
            height: 22px;
            background-color: rgba(22, 135, 212, 0.2);
          }

          /* --------------------------------------------------
             RIGHT VISUAL AREA — 3D-INSPIRED COMPOSITION
             -------------------------------------------------- */
          .hero-right-visual {
            width: 100%;
            display: flex;
            justify-content: center;
          }

          .hero-3d-wrapper {
            width: 100%;
            max-width: 540px;
            transition: transform 0.25s ease-out;
            transform-style: preserve-3d;
          }

          .glass-dashboard-card {
            background: rgba(255, 255, 255, 0.82);
            border: 1px solid rgba(255, 255, 255, 0.9);
            outline: 1px solid rgba(22, 135, 212, 0.2);
            border-radius: 24px;
            padding: 1.25rem;
            box-shadow: 
              0 20px 50px rgba(18, 59, 103, 0.14),
              inset 0 1px 2px rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            position: relative;
            overflow: visible;
          }

          .dashboard-glass-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid rgba(22, 135, 212, 0.15);
            margin-bottom: 0.5rem;
          }

          .dash-brand-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .pulse-cross-icon {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            background: rgba(22, 135, 212, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .dash-header-label {
            font-size: 0.78rem;
            font-weight: 800;
            color: #123B67;
            letter-spacing: 0.03em;
            text-transform: uppercase;
          }

          .dash-live-badge {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.65rem;
            font-weight: 800;
            color: #059669;
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 0.2rem 0.6rem;
            border-radius: 9999px;
            letter-spacing: 0.04em;
          }

          .live-ping-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #059669;
            box-shadow: 0 0 6px #059669;
          }

          /* Animated ECG Line SVG */
          .ecg-graphic-bar {
            height: 28px;
            width: 100%;
            overflow: hidden;
            margin-bottom: 0.5rem;
          }

          .ecg-svg-line {
            width: 100%;
            height: 100%;
            stroke-dasharray: 600;
            stroke-dashoffset: 600;
            animation: ecgStroke 3s linear infinite;
          }

          @keyframes ecgStroke {
            0% { stroke-dashoffset: 600; }
            100% { stroke-dashoffset: 0; }
          }

          .dash-3d-stage-viewport {
            height: 280px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle, rgba(22, 135, 212, 0.06) 0%, transparent 70%);
            border-radius: 16px;
          }

          /* Floating Cards */
          .float-card {
            position: absolute;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(22, 135, 212, 0.2);
            border-radius: 14px;
            padding: 0.65rem 0.85rem;
            box-shadow: 0 10px 25px rgba(18, 59, 103, 0.12);
            backdrop-filter: blur(14px);
            z-index: 10;
            animation: floatAnim 4s ease-in-out infinite;
          }

          .card-patient-record {
            top: -12px;
            left: -12px;
            transform: translateZ(30px);
            animation-delay: 0s;
          }

          .card-ai-risk {
            top: -12px;
            right: -12px;
            transform: translateZ(40px);
            animation-delay: 1s;
          }

          .card-emergency-priority {
            bottom: -15px;
            right: -10px;
            transform: translateZ(45px);
            min-width: 150px;
            animation-delay: 2s;
          }

          @keyframes floatAnim {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }

          .float-card-header {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.68rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }

          .float-card-big-val {
            font-size: 0.85rem;
            font-weight: 700;
            color: #123B67;
            margin-top: 0.15rem;
          }

          .float-card-sub {
            font-size: 0.65rem;
          }

          /* --------------------------------------------------
             INTEGRATED LIVE HOSPITAL STATUS STRIP
             -------------------------------------------------- */
          .hospital-status-strip-container {
            background: rgba(255, 255, 255, 0.85);
            border: 1px solid rgba(22, 135, 212, 0.2);
            border-radius: 20px;
            padding: 1.25rem 1.5rem;
            backdrop-filter: blur(16px);
            box-shadow: 0 10px 30px rgba(18, 59, 103, 0.06);
          }

          .strip-top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid rgba(22, 135, 212, 0.15);
          }

          .strip-heading-title {
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: #1687D4;
            text-transform: uppercase;
          }

          .strip-grid-metrics {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 1rem;
          }

          @media (max-width: 900px) {
            .strip-grid-metrics {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 500px) {
            .strip-grid-metrics {
              grid-template-columns: 1fr;
            }
          }

          .strip-card-item {
            background: rgba(242, 248, 252, 0.8);
            border: 1px solid rgba(22, 135, 212, 0.15);
            border-radius: 14px;
            padding: 0.875rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.875rem;
            transition: transform 0.25s ease, border-color 0.25s ease;
          }

          .strip-card-item:hover {
            transform: translateY(-3px);
            border-color: #1687D4;
            box-shadow: 0 6px 18px rgba(22, 135, 212, 0.12);
          }

          .metric-box-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .icon-blue { background: rgba(22, 135, 212, 0.12); }
          .icon-red { background: rgba(239, 68, 68, 0.12); }
          .icon-orange { background: rgba(249, 115, 22, 0.12); }
          .icon-amber { background: rgba(245, 158, 11, 0.12); }
          .icon-emerald { background: rgba(16, 185, 129, 0.12); }

          .metric-number-val {
            font-size: 1.4rem;
            font-weight: 800;
            line-height: 1;
            color: #123B67;
          }

          .metric-label-text {
            font-size: 0.75rem;
            color: #52677D;
            margin-top: 0.2rem;
          }

          /* --------------------------------------------------
             GENERAL LANDING SECTIONS & 7-NODE PIPELINE
             -------------------------------------------------- */
          .landing-section {
            padding: 5rem 1.5rem;
          }

          .landing-container {
            margin: 0 auto;
          }

          .section-header {
            margin-bottom: 3.5rem;
          }

          .section-eyebrow-badge {
            display: inline-block;
            font-size: 0.72rem;
            font-weight: 800;
            color: #1687D4;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 0.5rem;
          }

          .section-main-heading {
            font-size: 2.25rem;
            font-weight: 800;
            color: #123B67;
            letter-spacing: -0.02em;
            margin-bottom: 0.75rem;
          }

          .section-sub-paragraph {
            font-size: 1.05rem;
            color: #52677D;
            max-width: 650px;
            margin: 0 auto;
            line-height: 1.6;
          }

          /* 7-STEP PIPELINE */
          .workflow-pipeline-scroll {
            width: 100%;
            overflow-x: auto;
            padding: 1rem 0;
          }

          .workflow-nodes-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            min-width: 980px;
          }

          .pipeline-step-card {
            flex: 1;
            background: #ffffff;
            border: 1px solid rgba(22, 135, 212, 0.2);
            border-radius: 18px;
            padding: 1.25rem 1rem;
            text-align: center;
            box-shadow: 0 4px 16px rgba(18, 59, 103, 0.04);
            transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
          }

          .pipeline-step-card:hover {
            transform: translateY(-5px);
            border-color: #1687D4;
            box-shadow: 0 10px 25px rgba(22, 135, 212, 0.15);
          }

          .highlight-purple-card {
            background: #F5F3FF;
            border-color: #DDD6FE;
          }

          .highlight-green-card {
            background: #ECFDF5;
            border-color: #A7F3D0;
          }

          .step-number-tag {
            font-size: 0.6875rem;
            font-weight: 800;
            color: #52677D;
            margin-bottom: 0.625rem;
          }

          .step-icon-circle {
            width: 46px;
            height: 46px;
            border-radius: 12px;
            border: 1px solid;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 0.875rem;
            transition: border-color 0.2s ease;
          }

          .step-card-title {
            font-size: 0.9375rem;
            font-weight: 700;
            color: #123B67;
            margin-bottom: 0.35rem;
          }

          .step-card-desc {
            font-size: 0.75rem;
            color: #52677D;
            line-height: 1.4;
          }

          .pipeline-connector-beam {
            width: 24px;
            height: 2px;
            background: rgba(22, 135, 212, 0.2);
            position: relative;
            flex-shrink: 0;
          }

          .beam-glow-dot {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, #1687D4, transparent);
            animation: beamMotion 2.2s infinite linear;
          }

          @keyframes beamMotion {
            0% { left: -100%; }
            100% { left: 100%; }
          }

          /* --------------------------------------------------
             ECOSYSTEM BENTO GRID
             -------------------------------------------------- */
          .bento-modules-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }

          @media (max-width: 960px) {
            .bento-modules-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 600px) {
            .bento-modules-grid {
              grid-template-columns: 1fr;
            }
          }

          .bento-glass-wrapper {
            background: rgba(22, 135, 212, 0.03);
            border: 1px solid rgba(22, 135, 212, 0.15);
            border-radius: 20px;
            padding: 6px;
            transition: transform 0.3s ease, border-color 0.3s ease;
          }

          .bento-glass-wrapper:hover {
            transform: translateY(-4px);
            border-color: #1687D4;
          }

          .bento-card-content {
            background: #ffffff;
            border: 1px solid rgba(22, 135, 212, 0.15);
            border-radius: 14px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            height: 100%;
            box-shadow: 0 4px 16px rgba(18, 59, 103, 0.03);
          }

          .bento-top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.25rem;
          }

          .bento-icon-container {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .bento-module-tag {
            font-family: monospace;
            font-size: 0.72rem;
            color: #52677D;
          }

          .bento-card-heading {
            font-size: 1.15rem;
            font-weight: 700;
            color: #123B67;
            margin-bottom: 0.5rem;
          }

          .bento-card-body {
            font-size: 0.875rem;
            color: #52677D;
            line-height: 1.55;
            margin-bottom: 1.5rem;
            flex: 1;
          }

          .bento-action-footer {
            margin-top: auto;
          }

          .bento-nav-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 700;
            color: #1687D4;
            transition: color 0.2s ease;
          }

          .bento-nav-link:hover {
            color: #123B67;
          }

          /* --------------------------------------------------
             FINAL CALL TO ACTION & FOOTER
             -------------------------------------------------- */
          .final-call-to-action {
            padding: 5.5rem 1.5rem;
          }

          .cta-pill-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 1rem;
            border-radius: 9999px;
            background: #ffffff;
            border: 1px solid rgba(22, 135, 212, 0.25);
            color: #1687D4;
            font-size: 0.72rem;
            font-weight: 800;
            font-family: monospace;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 10px rgba(22, 135, 212, 0.08);
          }

          .cta-title-text {
            font-size: 2.5rem;
            font-weight: 800;
            color: #123B67;
            line-height: 1.2;
            margin-bottom: 1rem;
          }

          .cta-desc-text {
            font-size: 1.1rem;
            color: #52677D;
            margin-bottom: 2.25rem;
            line-height: 1.6;
          }

          /* Entrance Keyframes */
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-15px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* REDUCED MOTION ACCESSIBILITY */
          @media (prefers-reduced-motion: reduce) {
            .beam-glow-dot, .badge-glow-dot, .float-card, .ecg-svg-line {
              animation: none !important;
            }
            .hero-3d-wrapper, .hospital-bg-photo {
              transform: none !important;
            }
          }
        `}</style>
      </div>
    </PageTransition>
  );
};

export default Home;

