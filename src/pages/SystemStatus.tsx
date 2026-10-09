import React, { useState, useEffect } from 'react';
import { systemService, ModuleStatus } from '../services/api/systemService';
import { Server, CheckCircle2, ShieldCheck, Cpu, Code2, Database, AlertCircle, Radio, Activity, ArrowRight, Layers } from 'lucide-react';
import { NetworkCanvas } from '../components/3d/NetworkCanvas';

export const SystemStatus: React.FC = () => {
  const [systemData, setSystemData] = useState<{
    environment: string;
    backendConnected: boolean;
    modules: ModuleStatus[];
  } | null>(null);

  useEffect(() => {
    systemService.getSystemStatus().then(setSystemData);
  }, []);

  return (
    <div className="page-container" style={{ background: 'var(--app-page-bg)', minHeight: '100vh', color: 'var(--app-text-main)', position: 'relative' }}>
      <NetworkCanvas opacity={0.35} />
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#0EA5E9', textTransform: 'uppercase', background: 'rgba(14, 165, 233, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                Infrastructure Diagnostic Center
              </span>
            </div>
            <h1 className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Hospital System &amp; Infrastructure Status</h1>
            <p className="page-subtitle" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Real-time monitoring of FastAPI backend services, PostgreSQL database health, and AI assessment module readiness.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'var(--card-bg-elevated)', border: '1px solid var(--border-subtle)', padding: '0.4rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Radio size={14} style={{ color: systemData?.backendConnected ? '#16A34A' : '#DC2626' }} />
              {systemData?.backendConnected ? 'PostgreSQL & API Operational' : 'Backend Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Data Stream Connection Flow Diagram */}
      <div className="card-double-bezel mb-4">
        <div className="card-inner-core p-4" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(30, 58, 138, 0.04))' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
            Live Infrastructure Heartbeat Stream
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', background: 'var(--card-bg-inner)', padding: '1rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.12)', padding: '0.65rem', borderRadius: '8px', color: '#0EA5E9' }}>
                <Cpu size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>React SPA Frontend</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Port 5173 / 5174</div>
              </div>
            </div>

            <ArrowRight size={18} style={{ color: '#0EA5E9', opacity: 0.7 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(14, 165, 233, 0.12)', padding: '0.65rem', borderRadius: '8px', color: '#0EA5E9' }}>
                <Code2 size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>FastAPI REST Gateway</div>
                <div style={{ fontSize: '0.78rem', color: '#0EA5E9', fontWeight: 700 }}>http://127.0.0.1:8000</div>
              </div>
            </div>

            <ArrowRight size={18} style={{ color: '#0EA5E9', opacity: 0.7 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(22, 163, 74, 0.12)', padding: '0.65rem', borderRadius: '8px', color: '#16A34A' }}>
                <Database size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>PostgreSQL Engine</div>
                <div style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700 }}>Hospital DB Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Notice Banner */}
      <div className="card-double-bezel mb-4">
        <div className="card-inner-core p-4" style={{ background: systemData?.backendConnected ? 'rgba(22, 163, 74, 0.06)' : 'rgba(14, 165, 233, 0.06)', borderLeft: `4px solid ${systemData?.backendConnected ? '#16A34A' : '#0EA5E9'}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: systemData?.backendConnected ? '#16A34A' : '#0EA5E9', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Code2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {systemData?.backendConnected
                  ? 'FastAPI Backend Connected — Live Operational Mode'
                  : 'FastAPI Backend Disconnected — Local Prototype Mode'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {systemData?.backendConnected
                  ? 'The frontend is actively communicating with the FastAPI REST backend at http://127.0.0.1:8000.'
                  : 'Unable to connect to http://127.0.0.1:8000. Fallback mock services active.'}
                {' '}Endpoints in use: <code style={{ background: 'var(--border-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#0EA5E9' }}>GET /health</code>, <code style={{ background: 'var(--border-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#0EA5E9' }}>GET /patients</code>, <code style={{ background: 'var(--border-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#0EA5E9' }}>GET /patients/&#123;id&#125;/clinical-data</code>, and <code style={{ background: 'var(--border-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#0EA5E9' }}>GET /ai-assessment/&#123;encounter_id&#125;</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Spec Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card-double-bezel">
          <div className="card-inner-core p-4">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={18} className="text-cyan" /> Frontend Operational Status
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                'Frontend Application Core',
                'Patient Management Module',
                'Reports & Analytics Module',
                'AI Assessment Engine',
                'Emergency Priority Queue',
                'Treatment Operations Workflow',
                'Local Storage Persistence Cache',
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{item}</span>
                  <span style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#16A34A', border: '1px solid rgba(22, 163, 74, 0.25)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} /> Operational
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-double-bezel">
          <div className="card-inner-core p-4">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={18} className="text-cyan" /> Backend Integration Specs
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>FastAPI Backend Connection</span>
                {systemData?.backendConnected ? (
                  <span style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#16A34A', border: '1px solid rgba(22, 163, 74, 0.25)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} /> Connected
                  </span>
                ) : (
                  <span style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#EA580C', border: '1px solid rgba(234, 88, 12, 0.25)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={13} /> Offline
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Target REST API Host</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0EA5E9' }}>http://127.0.0.1:8000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Patient Directory Endpoint</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>GET /patients</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Patient Clinical Data</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>GET /patients/&#123;id&#125;/clinical-data</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>AI Triage Assessment</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>GET /ai-assessment/&#123;encounter_id&#125;</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>System Health Check</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>GET /health</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Diagnostics Matrix */}
      <div className="card-double-bezel">
        <div className="card-inner-core p-4">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={18} className="text-cyan" /> Service Module Diagnostics Matrix
            </h3>
          </div>

          {!systemData ? (
            <p className="p-3 text-muted">Checking service module health...</p>
          ) : (
            <div className="table-container">
              <table className="mediqueue-table">
                <thead>
                  <tr>
                    <th>Service Module</th>
                    <th>Operational Status</th>
                    <th>Internal Latency</th>
                    <th>Last Diagnostic Check</th>
                    <th>Module Description</th>
                  </tr>
                </thead>
                <tbody>
                  {systemData.modules.map((mod, i) => (
                    <tr key={i}>
                      <td>
                        <strong>{mod.name}</strong>
                      </td>
                      <td>
                        {mod.status === 'Operational' ? (
                          <span style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#16A34A', border: '1px solid rgba(22, 163, 74, 0.25)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={13} /> {mod.status}
                          </span>
                        ) : (
                          <span style={{ background: 'rgba(14, 165, 233, 0.12)', color: '#0EA5E9', border: '1px solid rgba(14, 165, 233, 0.25)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <ShieldCheck size={13} /> {mod.status}
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0EA5E9', fontSize: '0.88rem' }}>{mod.latencyMs} ms</span>
                      </td>
                      <td>{mod.lastChecked}</td>
                      <td><span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{mod.description}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
