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
  Search,
  Stethoscope,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Pill,
  CheckCircle,
  Activity,
  Radio,
  Cpu,
  Eye,
} from 'lucide-react';
import { HeroScene3D } from '../components/3d/HeroScene3D';
import { PageTransition } from '../components/common/PageTransition';
import { Footer } from '../components/layout/Footer';

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

  // Real patient reference for dynamic 3D hero panel (if available)
  const topCriticalPatient = patients.find((p) => p.status === 'CRITICAL') || patients[0];

  // Mouse tilt tracking state for subtle 3D interactive hero parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20; // -10deg to +10deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20; // -10deg to +10deg
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <PageTransition>
      <div className="home-landing-page">
      {/* ===================================================
          SPLIT HERO SECTION — 3D AI TRIAGE CENTERPIECE
         =================================================== */}
      <section className="bright-hero-section">
        {/* Subtle Ambient Background Mesh Orbs */}
        <div className="hero-mesh-orb orb-cyan"></div>
        <div className="hero-mesh-orb orb-navy"></div>
        <div className="hero-grid-pattern"></div>

        <div className="dark-hero-container max-w-7xl">
          <div className="hero-split-grid">
            {/* LEFT COLUMN: BRANDING & ACTION CTAs */}
            <div className="hero-left-col">
              {/* Eyebrow Live Status Pill */}
              <div className="hero-status-pill">
                <span className="cyan-status-dot"></span>
                <span className="font-mono text-xs uppercase tracking-wider text-[#087FC1] font-bold">
                  REAL-TIME HOSPITAL AI PLATFORM
                </span>
              </div>

              {/* Main Brand Title & Headline */}
              <div className="hero-brand-badge">
                <Brain className="w-8 h-8 text-[#087FC1] animate-pulse" />
                <span className="text-2xl font-black tracking-tight text-[#102A43] font-display">MediQueueAI</span>
              </div>

              <h1 className="hero-main-headline">
                AI-Powered Emergency Triage
                <span className="headline-accent-line">&amp; Real-Time Patient Care</span>
              </h1>

              {/* Supporting Description */}
              <p className="hero-supporting-desc">
                Empowering hospital emergency teams with instant AI risk scoring, automated priority queueing, doctor decision support, and real-time clinical workflow tracking.
              </p>

              {/* Primary Action Buttons */}
              <div className="hero-btn-row">
                <Link to="/patients" className="btn-hero-primary group">
                  <span>Start Patient Workflow</span>
                  <div className="btn-icon-wrapper">
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                <Link to="/priority-queue" className="btn-hero-secondary group">
                  <AlertTriangle size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />
                  <span>View Priority Queue</span>
                </Link>

                <Link to="/ai-assessment" className="btn-hero-secondary group">
                  <Brain size={16} className="text-[#087FC1] group-hover:rotate-12 transition-transform" />
                  <span>Explore AI Assessment</span>
                </Link>
              </div>

              {/* Live Triage Status Indicators */}
              <div className="hero-mini-status-row">
                <div className="mini-status-item">
                  <Radio size={14} className="text-emerald-600 animate-pulse" />
                  <span>Triage Engine: <strong>Active</strong></span>
                </div>
                <div className="mini-status-item">
                  <Cpu size={14} className="text-[#087FC1]" />
                  <span>FastAPI Backend: <strong>Connected</strong></span>
                </div>
                <div className="mini-status-item">
                  <ShieldCheck size={14} className="text-teal-600" />
                  <span>Hospital Database: <strong>Operational</strong></span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: THE 3D AI HEALTHCARE CENTERPIECE */}
            <div className="hero-right-col">
              <div
                className="hero-3d-stage"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `perspective(1200px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
                }}
              >
                {/* 3D DOUBLE-BEZEL CONTAINER */}
                <div className="scene-outer-shell">
                  <div className="scene-inner-core">
                    {/* Header Bar */}
                    <div className="scene-header-bar">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-[#087FC1]" />
                        <span className="font-bold text-xs uppercase tracking-wider text-[#102A43]">
                          AI Triage &amp; Clinical Flow Center
                        </span>
                      </div>
                      <div className="scene-live-pill">
                        <span className="live-dot"></span>
                        <span>LIVE MONITORING</span>
                      </div>
                    </div>

                    {/* CENTRAL REAL 3D WEBGL AI TRIAGE CORE */}
                    <div className="ai-core-visual-stage" style={{ position: 'relative', overflow: 'hidden' }}>
                      <HeroScene3D height="460px" />

                      {/* FLOATING 3D DATA PANELS (Layered Depth) */}
                      {/* Node 1: Patient Intake (Top Left) */}
                      <div className="float-depth-card card-top-left">
                        <div className="card-tag">
                          <Users size={12} className="text-[#087FC1]" />
                          <span>Patient Intake</span>
                        </div>
                        <div className="card-main-val font-mono">{totalPatients} Registered</div>
                        <div className="card-sub-info">Real-Time Queue</div>
                      </div>

                      {/* Node 2: AI Triage Assessment (Top Right) */}
                      <div className="float-depth-card card-top-right">
                        <div className="card-tag">
                          <Brain size={12} className="text-purple-600" />
                          <span>Risk Assessment</span>
                        </div>
                        {topCriticalPatient ? (
                          <>
                            <div className="card-main-val text-red-600 font-semibold truncate max-w-[120px]">
                              {topCriticalPatient.name}
                            </div>
                            <div className="card-sub-info font-mono text-[10px]">
                              Score: {topCriticalPatient.latestAssessment?.riskScore || 90}/100 • {topCriticalPatient.status}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="card-main-val text-[#087FC1]">AI Risk Engine</div>
                            <div className="card-sub-info">Clinical Analysis</div>
                          </>
                        )}
                      </div>

                      {/* Node 3: Live Monitoring Panel (Bottom Right) */}
                      <div className="float-depth-card card-bottom-right shadow-2xl">
                        <div className="card-tag border-b border-sky-100 pb-1 mb-1.5 flex items-center justify-between">
                          <span className="text-emerald-600 font-bold">LIVE MONITORING</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        </div>
                        <div className="monitoring-mini-list">
                          <div className="mon-row">
                            <span className="mon-lbl">AI Triage</span>
                            <span className="mon-val text-emerald-600">● Active</span>
                          </div>
                          <div className="mon-row">
                            <span className="mon-lbl">Critical Cases</span>
                            <span className="mon-val text-red-600 font-bold">{criticalCount}</span>
                          </div>
                          <div className="mon-row">
                            <span className="mon-lbl">High Risk</span>
                            <span className="mon-val text-orange-600 font-bold">{highCount}</span>
                          </div>
                          <div className="mon-row">
                            <span className="mon-lbl">System Status</span>
                            <span className="mon-val text-[#087FC1]">Operational</span>
                          </div>
                        </div>
                      </div>

                      {/* Node 4: Doctor & Treatment Workflow (Bottom Left) */}
                      <div className="float-depth-card card-bottom-left">
                        <div className="card-tag">
                          <Stethoscope size={12} className="text-teal-600" />
                          <span>Treatment Care</span>
                        </div>
                        <div className="card-main-val text-amber-600">{observationCount} In Progress</div>
                        <div className="card-sub-info">Doctor Assigned</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REAL-TIME HOSPITAL STATUS COUNTERS (Integrated Dashboard Strip) */}
          <div className="live-hospital-status-strip">
            <div className="strip-header">
              <span className="strip-title">LIVE HOSPITAL STATUS</span>
              <span className="strip-time font-mono">Real-Time Backend Synchronized</span>
            </div>

            <div className="strip-metrics-grid">
              {/* Metric 1 */}
              <div className="strip-metric-card">
                <div className="metric-icon-box bg-sky-500/10 border-sky-200">
                  <Users size={18} className="text-[#087FC1]" />
                </div>
                <div>
                  <div className="metric-big-num">{totalPatients}</div>
                  <div className="metric-lbl-text">Total Patients</div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="strip-metric-card">
                <div className="metric-icon-box bg-red-500/10 border-red-200">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                  <div className="metric-big-num text-red-600">{criticalCount}</div>
                  <div className="metric-lbl-text">Critical Cases</div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="strip-metric-card">
                <div className="metric-icon-box bg-orange-500/10 border-orange-200">
                  <Activity size={18} className="text-orange-500" />
                </div>
                <div>
                  <div className="metric-big-num text-orange-600">{highCount}</div>
                  <div className="metric-lbl-text">High Risk</div>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="strip-metric-card">
                <div className="metric-icon-box bg-amber-500/10 border-amber-200">
                  <Zap size={18} className="text-amber-500" />
                </div>
                <div>
                  <div className="metric-big-num text-amber-600">{observationCount}</div>
                  <div className="metric-lbl-text">Under Observation</div>
                </div>
              </div>

              {/* Metric 5 */}
              <div className="strip-metric-card">
                <div className="metric-icon-box bg-emerald-500/10 border-emerald-200">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </div>
                <div>
                  <div className="metric-big-num text-emerald-600">{completedCount}</div>
                  <div className="metric-lbl-text">Completed Treatments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          SECTION 1 — VISUAL PATIENT WORKFLOW PIPELINE
         =================================================== */}
      <section className="landing-section bg-[#E8F5FF] text-[#102A43] border-t border-[#D7E8F5]">
        <div className="landing-container max-w-7xl">
          <div className="section-header text-center">
            <span className="section-eyebrow text-[#087FC1]">END-TO-END CLINICAL PIPELINE</span>
            <h2 className="section-title text-[#102A43]">Visual Patient Flow</h2>
            <p className="section-subtitle text-[#52677D]">
              From initial hospital intake to finalized patient results, MediQueueAI coordinates every stage of patient care in real time.
            </p>
          </div>

          <div className="workflow-pipeline-container">
            <div className="workflow-7nodes-flex">
              {/* Stage 1 */}
              <div className="pipeline-node-card group">
                <div className="node-num-tag font-mono">01</div>
                <div className="node-icon-wrapper bg-sky-500/10 text-[#087FC1] border-sky-300 group-hover:border-[#087FC1]">
                  <Users size={22} />
                </div>
                <h4 className="node-title">Patient</h4>
                <p className="node-desc">Initial hospital intake &amp; record creation.</p>
              </div>

              <div className="node-connector-line">
                <div className="data-beam-particle"></div>
              </div>

              {/* Stage 2 */}
              <div className="pipeline-node-card group">
                <div className="node-num-tag font-mono">02</div>
                <div className="node-icon-wrapper bg-cyan-500/10 text-[#12BDEB] border-cyan-300 group-hover:border-[#12BDEB]">
                  <ClipboardList size={22} />
                </div>
                <h4 className="node-title">Triage</h4>
                <p className="node-desc">Vital signs recording &amp; chief complaint.</p>
              </div>

              <div className="node-connector-line">
                <div className="data-beam-particle"></div>
              </div>

              {/* Stage 3 */}
              <div className="pipeline-node-card node-highlight-purple group">
                <div className="node-num-tag font-mono text-purple-700">03</div>
                <div className="node-icon-wrapper bg-purple-500/10 text-purple-700 border-purple-300 group-hover:border-purple-500 shadow-sm">
                  <Brain size={22} />
                </div>
                <h4 className="node-title text-purple-900">AI Assessment</h4>
                <p className="node-desc text-purple-700">AI risk score (0–100) &amp; priority classification.</p>
              </div>

              <div className="node-connector-line">
                <div className="data-beam-particle"></div>
              </div>

              {/* Stage 4 */}
              <div className="pipeline-node-card group">
                <div className="node-num-tag font-mono">04</div>
                <div className="node-icon-wrapper bg-indigo-500/10 text-indigo-600 border-indigo-300 group-hover:border-indigo-500">
                  <Stethoscope size={22} />
                </div>
                <h4 className="node-title">Doctor Review</h4>
                <p className="node-desc">Physician assignment &amp; clinical review.</p>
              </div>

              <div className="node-connector-line">
                <div className="data-beam-particle"></div>
              </div>

              {/* Stage 5 */}
              <div className="pipeline-node-card group">
                <div className="node-num-tag font-mono">05</div>
                <div className="node-icon-wrapper bg-amber-500/10 text-amber-600 border-amber-300 group-hover:border-amber-500">
                  <Zap size={22} />
                </div>
                <h4 className="node-title">Treatment</h4>
                <p className="node-desc">Active intervention &amp; treatment tracking.</p>
              </div>

              <div className="node-connector-line">
                <div className="data-beam-particle"></div>
              </div>

              {/* Stage 6 */}
              <div className="pipeline-node-card group">
                <div className="node-num-tag font-mono">06</div>
                <div className="node-icon-wrapper bg-teal-500/10 text-teal-600 border-teal-300 group-hover:border-teal-500">
                  <Pill size={22} />
                </div>
                <h4 className="node-title">Prescription</h4>
                <p className="node-desc">Medication orders &amp; care plan setup.</p>
              </div>

              <div className="node-connector-line">
                <div className="data-beam-particle"></div>
              </div>

              {/* Stage 7 */}
              <div className="pipeline-node-card node-highlight-green group">
                <div className="node-num-tag font-mono text-emerald-700">07</div>
                <div className="node-icon-wrapper bg-emerald-500/10 text-emerald-700 border-emerald-300 group-hover:border-emerald-500 shadow-sm">
                  <CheckCircle size={22} />
                </div>
                <h4 className="node-title text-emerald-900">Patient Results</h4>
                <p className="node-desc text-emerald-700">Treatment complete &amp; record archived.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          SECTION 2 — MEDIQUEUEAI ECOSYSTEM & MODULE SUITE
         =================================================== */}
      <section className="landing-section bg-[#F4F9FF] text-[#102A43] border-t border-[#D7E8F5]">
        <div className="landing-container max-w-7xl">
          <div className="section-header text-center">
            <span className="section-eyebrow text-[#087FC1]">COMPREHENSIVE HOSPITAL SUITE</span>
            <h2 className="section-title text-[#102A43]">MediQueueAI Platform Ecosystem</h2>
            <p className="section-subtitle text-[#52677D]">
              Connected healthcare modules designed for hospital workflows and clinical teams.
            </p>
          </div>

          <div className="ecosystem-bento-grid">
            {/* Module 1: Patient Directory */}
            <div className="bento-double-bezel group">
              <div className="bento-inner-core">
                <div className="bento-header">
                  <div className="bento-icon-box bg-sky-500/10 border-sky-200 text-[#087FC1]">
                    <Users size={20} />
                  </div>
                  <span className="font-mono text-xs text-[#52677D]">MODULE 01</span>
                </div>
                <h3 className="bento-title">Patient Management</h3>
                <p className="bento-desc">
                  Centralized patient directory with medical history, emergency contacts, symptoms, and clinical records.
                </p>
                <div className="bento-footer">
                  <Link to="/patients" className="bento-link group-hover:text-[#12BDEB]">
                    <span>Open Patients</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Module 2: AI Risk Intelligence */}
            <div className="bento-double-bezel group">
              <div className="bento-inner-core border-purple-200">
                <div className="bento-header">
                  <div className="bento-icon-box bg-purple-500/10 border-purple-200 text-purple-600">
                    <Brain size={20} />
                  </div>
                  <span className="font-mono text-xs text-purple-700 font-semibold">AI POWERED</span>
                </div>
                <h3 className="bento-title">AI Risk Intelligence</h3>
                <p className="bento-desc">
                  Objective 0–100 AI risk scores, priority categorization, and clinical decision support recommendations.
                </p>
                <div className="bento-footer">
                  <Link to="/ai-assessment" className="bento-link text-purple-700 group-hover:text-purple-900">
                    <span>Explore AI Assessment</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Module 3: Emergency Priority Queue */}
            <div className="bento-double-bezel group">
              <div className="bento-inner-core">
                <div className="bento-header">
                  <div className="bento-icon-box bg-amber-500/10 border-amber-200 text-amber-600">
                    <AlertTriangle size={20} />
                  </div>
                  <span className="font-mono text-xs text-amber-700 font-semibold">LIVE TRIAGE</span>
                </div>
                <h3 className="bento-title">Emergency Priority Queue</h3>
                <p className="bento-desc">
                  Automatically prioritizes emergency queue lists so critical cases are immediately brought to physician attention.
                </p>
                <div className="bento-footer">
                  <Link to="/priority-queue" className="bento-link group-hover:text-[#12BDEB]">
                    <span>View Priority Queue</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Module 4: Treatment Management */}
            <div className="bento-double-bezel group">
              <div className="bento-inner-core">
                <div className="bento-header">
                  <div className="bento-icon-box bg-teal-500/10 border-teal-200 text-teal-600">
                    <Zap size={20} />
                  </div>
                  <span className="font-mono text-xs text-[#52677D]">MODULE 04</span>
                </div>
                <h3 className="bento-title">Treatment Workflow</h3>
                <p className="bento-desc">
                  Real-time care tracking from doctor assignment to active treatment, observation, and discharge.
                </p>
                <div className="bento-footer">
                  <Link to="/treatment" className="bento-link group-hover:text-[#12BDEB]">
                    <span>Open Treatment</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Module 5: Clinical Analytics */}
            <div className="bento-double-bezel group">
              <div className="bento-inner-core">
                <div className="bento-header">
                  <div className="bento-icon-box bg-cyan-500/10 border-cyan-200 text-[#12BDEB]">
                    <BarChart3 size={20} />
                  </div>
                  <span className="font-mono text-xs text-[#52677D]">MODULE 05</span>
                </div>
                <h3 className="bento-title">Reports &amp; Analytics</h3>
                <p className="bento-desc">
                  Comprehensive hospital diagnostic reports, vital sign trends over time, and risk distribution metrics.
                </p>
                <div className="bento-footer">
                  <Link to="/reports" className="bento-link group-hover:text-[#12BDEB]">
                    <span>View Analytics</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Module 6: System Operations */}
            <div className="bento-double-bezel group">
              <div className="bento-inner-core">
                <div className="bento-header">
                  <div className="bento-icon-box bg-emerald-500/10 border-emerald-200 text-emerald-600">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="font-mono text-xs text-emerald-700 font-semibold">100% HEALTH</span>
                </div>
                <h3 className="bento-title">System Status</h3>
                <p className="bento-desc">
                  Monitor backend API connection, PostgreSQL database status, and operational health of all services.
                </p>
                <div className="bento-footer">
                  <Link to="/system-status" className="bento-link group-hover:text-[#12BDEB]">
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
      <section className="final-cta-section bg-gradient-to-b from-[#E8F5FF] to-[#F4F9FF] text-[#102A43] border-t border-[#D7E8F5]">
        <div className="landing-container text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#D7E8F5] text-[#087FC1] text-xs font-mono mb-6 shadow-sm">
            <Sparkles size={14} />
            <span>EXCELLENCE IN EMERGENCY CLINICAL TRIAGE</span>
          </div>

          <h2 className="cta-headline text-[#102A43]">Every Second Counts in Healthcare.</h2>
          <p className="cta-subtitle text-[#52677D]">
            MediQueueAI connects patient records, clinical risk triage, emergency queues, and treatment tracking in one unified hospital platform.
          </p>
          
          <div className="hero-btn-row mb-0">
            <Link to="/priority-queue" className="btn-hero-primary group">
              <span>Open Priority Queue</span>
              <div className="btn-icon-wrapper">
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link to="/patients" className="btn-hero-secondary">
              <Users size={16} />
              <span>Enter Patients Directory</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Site Footer */}
      <Footer />

      {/* Embedded High-End Agency Styles & Animations */}
      <style>{`
        .home-landing-page {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          background-color: #F4F9FF;
          color: #102A43;
          overflow-x: hidden;
        }

        /* ----------------------------------
           HERO SECTION & MESH BACKGROUND
           ---------------------------------- */
        .bright-hero-section {
          background: linear-gradient(180deg, #F4F9FF 0%, #E8F5FF 100%);
          color: #102A43;
          padding: 4.5rem 1.5rem 3.5rem;
          position: relative;
          overflow: hidden;
        }

        .hero-mesh-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.6;
        }

        .orb-cyan {
          top: -80px;
          right: -50px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(18, 189, 235, 0.22) 0%, rgba(8, 127, 193, 0.05) 100%);
        }

        .orb-navy {
          bottom: -120px;
          left: -80px;
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, rgba(8, 127, 193, 0.15) 0%, rgba(232, 245, 255, 0) 100%);
        }

        .hero-grid-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(8, 127, 193, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          opacity: 0.7;
        }

        .dark-hero-container {
          position: relative;
          z-index: 2;
          margin: 0 auto;
        }

        .hero-split-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 3.5rem;
          align-items: center;
          margin-bottom: 3.5rem;
        }

        @media (max-width: 1024px) {
          .hero-split-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }
        }

        .hero-left-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        @media (max-width: 1024px) {
          .hero-left-col {
            align-items: center;
          }
        }

        .hero-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFFFFF;
          border: 1px solid #D7E8F5;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          margin-bottom: 1.25rem;
          box-shadow: 0 4px 15px rgba(8, 127, 193, 0.08);
        }

        .cyan-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #12BDEB;
          box-shadow: 0 0 8px #12BDEB;
          animation: pulseGlow 2s infinite ease-in-out;
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }

        .hero-brand-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }

        .hero-main-headline {
          font-size: 3.25rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.035em;
          color: #102A43;
          margin-bottom: 1.25rem;
          text-align: left;
        }

        @media (max-width: 1024px) {
          .hero-main-headline { text-align: center; font-size: 2.5rem; }
        }

        .headline-accent-line {
          background: linear-gradient(135deg, #087FC1 0%, #12BDEB 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
          margin-top: 0.25rem;
        }

        .hero-supporting-desc {
          font-size: 1.0625rem;
          line-height: 1.6;
          color: #52677D;
          margin-bottom: 2rem;
          text-align: left;
          max-width: 540px;
        }

        @media (max-width: 1024px) {
          .hero-supporting-desc { text-align: center; }
        }

        .hero-btn-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }

        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #087FC1 0%, #12BDEB 100%);
          color: #ffffff;
          padding: 0.8125rem 1.5rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.9375rem;
          box-shadow: 0 4px 18px rgba(18, 189, 235, 0.35);
          transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }

        .btn-hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(18, 189, 235, 0.5);
        }

        .btn-icon-wrapper {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-hero-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          background: #FFFFFF;
          border: 1px solid #D7E8F5;
          color: #102A43;
          padding: 0.8125rem 1.5rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.9375rem;
          box-shadow: 0 2px 8px rgba(16, 42, 67, 0.04);
          transition: all 0.3s ease;
        }

        .btn-hero-secondary:hover {
          background: #E8F5FF;
          border-color: #087FC1;
          color: #087FC1;
          transform: translateY(-2px);
        }

        .hero-mini-status-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
          font-size: 0.78125rem;
          color: #52677D;
          border-top: 1px solid #D7E8F5;
          padding-top: 1.25rem;
          width: 100%;
        }

        .mini-status-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        /* ----------------------------------
           RIGHT COLUMN: 3D STAGE & AI CORE
           ---------------------------------- */
        .hero-right-col {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .hero-3d-stage {
          width: 100%;
          max-width: 580px;
          transition: transform 0.2s ease-out;
          transform-style: preserve-3d;
        }

        .scene-outer-shell {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid #D7E8F5;
          border-radius: 28px;
          padding: 8px;
          box-shadow: 0 20px 45px rgba(16, 42, 67, 0.08), inset 0 1px 1px #FFFFFF;
          backdrop-filter: blur(16px);
        }

        .scene-inner-core {
          background: linear-gradient(145deg, #FFFFFF 0%, #F4F9FF 100%);
          border: 1px solid #D7E8F5;
          border-radius: 22px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .scene-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #D7E8F5;
        }

        .scene-live-pill {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.6875rem;
          font-weight: 800;
          color: #059669;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          letter-spacing: 0.04em;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #059669;
          box-shadow: 0 0 6px #059669;
        }

        /* AI CORE STAGE */
        .ai-core-visual-stage {
          height: 340px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* FLOATING 3D DEPTH CARDS */
        .float-depth-card {
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #D7E8F5;
          border-radius: 12px;
          padding: 0.625rem 0.875rem;
          box-shadow: 0 12px 28px rgba(16, 42, 67, 0.09);
          backdrop-filter: blur(12px);
          z-index: 10;
          transition: transform 0.3s ease;
        }

        .card-top-left { top: 10px; left: 10px; transform: translateZ(25px); }
        .card-top-right { top: 10px; right: 10px; transform: translateZ(35px); }
        .card-bottom-left { bottom: 10px; left: 10px; transform: translateZ(25px); }
        .card-bottom-right { bottom: 10px; right: 10px; transform: translateZ(45px); min-width: 170px; }

        .card-tag {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: #52677D;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .card-main-val {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #102A43;
          margin-top: 0.15rem;
        }

        .card-sub-info {
          font-size: 0.65rem;
          color: #52677D;
        }

        .monitoring-mini-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.72rem;
        }

        .mon-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }

        .mon-lbl { color: #52677D; font-size: 0.6875rem; }

        /* ----------------------------------
           LIVE HOSPITAL STATUS STRIP
           ---------------------------------- */
        .live-hospital-status-strip {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #D7E8F5;
          border-radius: 20px;
          padding: 1.5rem;
          backdrop-filter: blur(16px);
          box-shadow: 0 12px 30px rgba(16, 42, 67, 0.05);
        }

        .strip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #D7E8F5;
        }

        .strip-title {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #087FC1;
          text-transform: uppercase;
        }

        .strip-time {
          font-size: 0.7rem;
          color: #52677D;
        }

        .strip-metrics-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }

        @media (max-width: 900px) {
          .strip-metrics-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 540px) {
          .strip-metrics-grid { grid-template-columns: 1fr; }
        }

        .strip-metric-card {
          background: #F4F9FF;
          border: 1px solid #D7E8F5;
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .strip-metric-card:hover {
          transform: translateY(-2px);
          border-color: #087FC1;
          box-shadow: 0 6px 18px rgba(8, 127, 193, 0.1);
        }

        .metric-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .metric-big-num {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1;
          color: #102A43;
        }

        .metric-lbl-text {
          font-size: 0.75rem;
          color: #52677D;
          margin-top: 0.2rem;
        }

        /* ----------------------------------
           SECTIONS & 7-STEP PIPELINE
           ---------------------------------- */
        .landing-section {
          padding: 5rem 1.5rem;
        }

        .landing-container {
          margin: 0 auto;
        }

        .section-header {
          margin-bottom: 3.5rem;
        }

        .section-eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.5rem;
        }

        .section-title {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 0.75rem;
        }

        .section-subtitle {
          font-size: 1.0625rem;
          line-height: 1.6;
          max-width: 660px;
          margin: 0 auto;
        }

        /* 7-STEP PIPELINE */
        .workflow-pipeline-container {
          width: 100%;
          overflow-x: auto;
          padding: 1rem 0;
        }

        .workflow-7nodes-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          min-width: 960px;
        }

        .pipeline-node-card {
          flex: 1;
          background: #FFFFFF;
          border: 1px solid #D7E8F5;
          border-radius: 16px;
          padding: 1.25rem 1rem;
          text-align: center;
          position: relative;
          box-shadow: 0 4px 16px rgba(16, 42, 67, 0.04);
          transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }

        .pipeline-node-card:hover {
          transform: translateY(-5px);
          border-color: #087FC1;
          box-shadow: 0 10px 25px rgba(8, 127, 193, 0.15);
        }

        .node-highlight-purple {
          background: #F3E8FF;
          border-color: #C084FC;
        }

        .node-highlight-green {
          background: #ECFDF5;
          border-color: #6EE7B7;
        }

        .node-num-tag {
          font-size: 0.6875rem;
          font-weight: 800;
          color: #52677D;
          margin-bottom: 0.625rem;
        }

        .node-icon-wrapper {
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

        .node-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #102A43;
          margin-bottom: 0.35rem;
        }

        .node-desc {
          font-size: 0.75rem;
          color: #52677D;
          line-height: 1.4;
        }

        .node-connector-line {
          width: 24px;
          height: 2px;
          background: #D7E8F5;
          position: relative;
          flex-shrink: 0;
        }

        .data-beam-particle {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, #087FC1, transparent);
          animation: beamFlow 2s infinite linear;
        }

        @keyframes beamFlow {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        /* ----------------------------------
           ECOSYSTEM BENTO GRID
           ---------------------------------- */
        .ecosystem-bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 960px) {
          .ecosystem-bento-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .ecosystem-bento-grid { grid-template-columns: 1fr; }
        }

        .bento-double-bezel {
          background: rgba(8, 127, 193, 0.03);
          border: 1px solid #D7E8F5;
          border-radius: 20px;
          padding: 6px;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .bento-double-bezel:hover {
          transform: translateY(-4px);
          border-color: #12BDEB;
        }

        .bento-inner-core {
          background: #FFFFFF;
          border: 1px solid #D7E8F5;
          border-radius: 14px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-shadow: 0 4px 16px rgba(16, 42, 67, 0.03);
        }

        .bento-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .bento-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bento-title {
          font-size: 1.1875rem;
          font-weight: 700;
          color: #102A43;
          margin-bottom: 0.5rem;
        }

        .bento-desc {
          font-size: 0.875rem;
          color: #52677D;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .bento-footer {
          margin-top: auto;
        }

        .bento-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #087FC1;
          transition: color 0.2s ease;
        }

        .bento-link:hover {
          color: #12BDEB;
        }

        /* ----------------------------------
           FINAL CTA & FOOTER
           ---------------------------------- */
        .final-cta-section {
          padding: 5.5rem 1.5rem;
        }

        .cta-headline {
          font-size: 2.75rem;
          font-weight: 800;
          color: #102A43;
          margin-bottom: 1rem;
        }

        .cta-subtitle {
          font-size: 1.125rem;
          color: #52677D;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        /* REDUCED MOTION ACCESSIBILITY */
        @media (prefers-reduced-motion: reduce) {
          .data-beam-particle, .cyan-status-dot {
            animation: none !important;
          }
          .hero-3d-stage {
            transform: none !important;
          }
        }
      `}</style>
    </div>
    </PageTransition>
  );
};
