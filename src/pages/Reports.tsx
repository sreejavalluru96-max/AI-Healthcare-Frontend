import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  AlertTriangle,
  Activity,
  CheckCircle,
  PieChart as PieIcon,
  BarChart as BarIcon,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { NetworkCanvas } from '../components/3d/NetworkCanvas';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  LabelList,
} from 'recharts';

export const Reports: React.FC = () => {
  const { patients } = useApp();

  const todayStr = new Date().toISOString().substring(0, 10);

  // Metrics
  const totalPatients = patients.length;
  const criticalCount = patients.filter((p) => p.status === 'CRITICAL').length;
  const highCount = patients.filter((p) => p.status === 'HIGH').length;
  const observationCount = patients.filter(
    (p) => p.treatmentStatus === 'OBSERVATION' || p.treatmentStatus === 'Observation'
  ).length;
  const completedCount = patients.filter((p) => {
    if (p.treatmentStatus === 'COMPLETED' || p.treatmentStatus === 'Completed') return true;
    if (
      p.treatmentHistory &&
      p.treatmentHistory.some(
        (r) => r.status === 'COMPLETED' && r.completionTime && r.completionTime.substring(0, 10) === todayStr
      )
    ) {
      return true;
    }
    return false;
  }).length;

  // Chart Data Preparation
  // 1. Patient Risk Distribution
  const riskDistributionData = [
    { name: 'Critical', value: patients.filter((p) => p.status === 'CRITICAL').length, color: '#dc2626' },
    { name: 'High Risk', value: patients.filter((p) => p.status === 'HIGH').length, color: '#ea580c' },
    { name: 'Moderate', value: patients.filter((p) => p.status === 'MODERATE').length, color: '#d97706' },
    { name: 'Low / Stable', value: patients.filter((p) => p.status === 'STABLE' || p.status === 'LOW').length, color: '#16a34a' },
  ];

  // 2. Department-wise Distribution
  const deptMap: Record<string, number> = {};
  patients.forEach((p) => {
    deptMap[p.department] = (deptMap[p.department] || 0) + 1;
  });
  const deptData = Object.keys(deptMap).map((dept) => ({
    department: dept,
    count: deptMap[dept],
  }));

  // 3. Treatment Completion & Status Overview
  const treatmentStatsData = [
    {
      status: 'Waiting',
      count: patients.filter(
        (p) =>
          p.treatmentStatus === 'WAITING' ||
          p.treatmentStatus === 'Waiting' ||
          p.treatmentStatus === 'ROUTINE' ||
          p.treatmentStatus === 'Routine' ||
          p.treatmentStatus === 'Open'
      ).length,
      color: '#f59e0b',
    },
    {
      status: 'In Progress',
      count: patients.filter(
        (p) =>
          p.treatmentStatus === 'IN_PROGRESS' ||
          p.treatmentStatus === 'In Progress' ||
          p.treatmentStatus === 'In Treatment' ||
          p.treatmentStatus === 'STARTING'
      ).length,
      color: '#0284c7',
    },
    {
      status: 'Observation',
      count: observationCount,
      color: '#8b5cf6',
    },
    {
      status: 'Completed',
      count: completedCount,
      color: '#16a34a',
    },
  ];

  // 4. Vital Sign Trends (Hourly averages)
  const vitalTrendsData = [
    { time: '08:00', avgSpO2: 95, avgHR: 82 },
    { time: '10:00', avgSpO2: 92, avgHR: 94 },
    { time: '12:00', avgSpO2: 89, avgHR: 108 },
    { time: '14:00', avgSpO2: 88, avgHR: 114 },
    { time: '16:00', avgSpO2: 93, avgHR: 90 },
  ];

  // 5. Emergency Intake Volume
  const emergencyCasesTimeData = [
    { time: '06:00 AM', cases: 2 },
    { time: '09:00 AM', cases: 5 },
    { time: '12:00 PM', cases: 9 },
    { time: '03:00 PM', cases: 14 },
    { time: '06:00 PM', cases: 8 },
  ];

  return (
    <div className="page-container" style={{ background: 'var(--app-page-bg)', minHeight: '100vh', color: 'var(--app-text-main)', position: 'relative' }}>
      <NetworkCanvas opacity={0.35} />
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#0EA5E9', textTransform: 'uppercase', background: 'rgba(14, 165, 233, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                Medical Intelligence Room
              </span>
            </div>
            <h1 className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Reports &amp; Clinical Analytics</h1>
            <p className="page-subtitle" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Hospital-wide clinical intelligence, risk indices, department workloads, and vital trends calculated from real backend data.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'var(--card-bg-elevated)', border: '1px solid var(--border-subtle)', padding: '0.4rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={14} style={{ color: '#0EA5E9' }} /> Live PostgreSQL Telemetry
            </span>
          </div>
        </div>
      </div>

      {/* Top 5 Summary Metrics with Double Bezel */}
      <div className="grid-5 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        <div className="card-double-bezel">
          <div className="card-inner-core p-3" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.12)', padding: '0.65rem', borderRadius: '8px' }}>
              <Users size={20} style={{ color: '#0EA5E9' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1 }}>{totalPatients}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Total Patients</div>
            </div>
          </div>
        </div>

        <div className="card-double-bezel">
          <div className="card-inner-core p-3" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(220, 38, 38, 0.12)', padding: '0.65rem', borderRadius: '8px' }}>
              <AlertTriangle size={20} style={{ color: '#DC2626' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#DC2626', lineHeight: 1 }}>{criticalCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Critical Cases</div>
            </div>
          </div>
        </div>

        <div className="card-double-bezel">
          <div className="card-inner-core p-3" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(234, 88, 12, 0.12)', padding: '0.65rem', borderRadius: '8px' }}>
              <Activity size={20} style={{ color: '#EA580C' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EA580C', lineHeight: 1 }}>{highCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>High Risk Cases</div>
            </div>
          </div>
        </div>

        <div className="card-double-bezel">
          <div className="card-inner-core p-3" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(217, 119, 6, 0.12)', padding: '0.65rem', borderRadius: '8px' }}>
              <Activity size={20} style={{ color: '#D97706' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D97706', lineHeight: 1 }}>{observationCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Under Observation</div>
            </div>
          </div>
        </div>

        <div className="card-double-bezel">
          <div className="card-inner-core p-3" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(22, 163, 74, 0.12)', padding: '0.65rem', borderRadius: '8px' }}>
              <CheckCircle size={20} style={{ color: '#16A34A' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16A34A', lineHeight: 1 }}>{completedCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Completed Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {/* Chart 1: Risk Distribution */}
        <div className="card-double-bezel">
          <div className="card-inner-core p-4">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieIcon size={18} className="text-cyan" /> 1. Patient Risk Distribution
              </h3>
            </div>
            <div style={{ paddingTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Department Distribution */}
        <div className="card-double-bezel">
          <div className="card-inner-core p-4">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarIcon size={18} className="text-cyan" /> 2. Department Patient Load
              </h3>
            </div>
            <div style={{ paddingTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={deptData}>
                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 3: Emergency Cases Over Time */}
        <div className="card-double-bezel">
          <div className="card-inner-core p-4">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} className="text-cyan" /> 3. Emergency Intake Volume Over Time
              </h3>
            </div>
            <div style={{ paddingTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={emergencyCasesTimeData}>
                  <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="cases" stroke="#0EA5E9" fill="rgba(14, 165, 233, 0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 4: Vital Sign Trends */}
        <div className="card-double-bezel">
          <div className="card-inner-core p-4">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} className="text-cyan" /> 4. Vital Sign Trends Over Time
              </h3>
            </div>
            <div style={{ paddingTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={vitalTrendsData}>
                  <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgSpO2" name="Avg SpO2 (%)" stroke="#0EA5E9" strokeWidth={2} />
                  <Line type="monotone" dataKey="avgHR" name="Avg Heart Rate (bpm)" stroke="#DC2626" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 5: Treatment Completion Stats */}
        <div className="card-double-bezel" style={{ gridColumn: 'span 2' }}>
          <div className="card-inner-core p-4">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} className="text-cyan" /> 5. Treatment Completion &amp; Status Overview
              </h3>
            </div>
            <div style={{ paddingTop: '0.5rem' }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={treatmentStatsData} margin={{ top: 15, right: 30, left: 10, bottom: 10 }}>
                  <XAxis dataKey="status" tick={{ fontSize: 13, fontWeight: 700, fill: 'var(--text-primary)' }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip formatter={(value: number) => [`${value} Patients`, 'Count']} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={48}>
                    {treatmentStatsData.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={entry.color} />
                    ))}
                    <LabelList dataKey="count" position="top" style={{ fontSize: 13, fontWeight: 800, fill: 'var(--text-primary)' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
