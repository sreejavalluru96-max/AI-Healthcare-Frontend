import { useMemo } from 'react';
import {
  Users,
  Siren,
  Brain,
  Activity,
  HeartPulse,
  Droplet,
  Thermometer,
  Wind,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import type { Page, Patient, ClinicalData, RiskAssessment } from '@/types';
import { api } from '@/lib/api';
import { usePolling } from '@/hooks/usePolling';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { RiskBadge } from '@/components/ui/Badge';
import { LoadingOverlay } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';

interface DashboardProps {
  onNavigate: (page: Page, params?: Record<string, unknown>) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { data: patients, loading: pLoading, error: pError, refresh: refreshPatients } = usePolling<Patient[]>(
    () => api.getPatients(),
    10000,
  );
  const { data: health, loading: hLoading, error: hError } = usePolling(
    () => api.getHealth(),
    5000,
  );

  const stats = useMemo(() => {
    if (!patients) return { total: 0, critical: 0, high: 0, avgAge: 0 };
    const total = patients.length;
    const critical = 0;
    const high = 0;
    const avgAge = total > 0
      ? Math.round(patients.reduce((s, p) => s + (p.age || 0), 0) / total)
      : 0;
    return { total, critical, high, avgAge };
  }, [patients]);

  const apiOnline = health?.status === 'ok' || health?.status === 'healthy' || !hError;

  if (pLoading && !patients) return <LoadingOverlay message="Loading dashboard…" />;
  if (pError && !patients) return <ErrorState message={pError} onRetry={refreshPatients} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
        apiOnline
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-red-50 text-red-700 ring-1 ring-red-200'
      }`}>
        <span className={`w-2.5 h-2.5 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
        {apiOnline ? 'FastAPI backend connected · Live polling active' : 'FastAPI backend unreachable'}
        <span className="ml-auto text-xs opacity-60">Auto-refresh: 10s</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Patients"
          value={stats.total}
          icon={<Users className="w-5 h-5" />}
          accent="brand"
          loading={pLoading && !patients}
        />
        <StatCard
          label="Critical Cases"
          value={stats.critical}
          icon={<Siren className="w-5 h-5" />}
          accent="red"
        />
        <StatCard
          label="High Risk"
          value={stats.high}
          icon={<AlertCircle className="w-5 h-5" />}
          accent="amber"
        />
        <StatCard
          label="Avg. Patient Age"
          value={stats.avgAge}
          icon={<Activity className="w-5 h-5" />}
          accent="emerald"
        />
      </div>

      {/* Recent patients + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent patients */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent Patients"
              subtitle="Live from FastAPI · auto-refreshing"
              icon={<Users className="w-4 h-4" />}
              action={
                <button
                  onClick={() => onNavigate('patients')}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              }
            />
            <CardBody className="p-0">
              {patients && patients.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {patients.slice(0, 6).map((p) => (
                    <button
                      key={p.patient_id}
                      onClick={() => onNavigate('patient-detail', { patientId: p.patient_id })}
                      className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                        {p.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">
                          ID: {p.patient_id} · {p.age}y · {p.gender}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-6 text-sm text-slate-500 text-center">No patients found.</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Quick Actions" icon={<Brain className="w-4 h-4" />} />
            <CardBody className="space-y-2">
              {[
                { label: 'Emergency Queue', icon: Siren, page: 'queue' as Page, color: 'text-red-500' },
                { label: 'AI Assessment', icon: Brain, page: 'ai-assessment' as Page, color: 'text-brand-500' },
                { label: 'Reports', icon: Activity, page: 'reports' as Page, color: 'text-emerald-500' },
                { label: 'System Status', icon: HeartPulse, page: 'system-status' as Page, color: 'text-amber-500' },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.label}
                    onClick={() => onNavigate(a.page)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <Icon className={`w-4 h-4 ${a.color}`} />
                    <span className="text-sm font-medium text-slate-700">{a.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                  </button>
                );
              })}
            </CardBody>
          </Card>

          {/* Vital signs legend */}
          <Card>
            <CardHeader title="Vital Signs Tracked" icon={<Activity className="w-4 h-4" />} />
            <CardBody className="grid grid-cols-2 gap-3">
              {[
                { icon: HeartPulse, label: 'Heart Rate', color: 'text-rose-500' },
                { icon: Droplet, label: 'Blood Pressure', color: 'text-blue-500' },
                { icon: Wind, label: 'Oxygen / Resp.', color: 'text-cyan-500' },
                { icon: Thermometer, label: 'Temperature', color: 'text-orange-500' },
              ].map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.label} className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${v.color}`} />
                    <span className="text-xs text-slate-600">{v.label}</span>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
