import { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Users,
  Brain,
  Siren,
  HeartPulse,
  Droplet,
  Wind,
  Thermometer,
  Activity,
  Download,
  TrendingUp,
} from 'lucide-react';
import type { Page, Patient, ClinicalData, RiskAssessment } from '@/types';
import { api } from '@/lib/api';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { RiskBadge } from '@/components/ui/Badge';
import { LoadingOverlay } from '@/components/ui/Loading';
import { ErrorState } from '@/components/ui/ErrorState';

interface ReportsProps {
  onNavigate: (page: Page, params?: Record<string, unknown>) => void;
}

interface ReportData {
  patients: Patient[];
  totalEncounters: number;
  assessments: RiskAssessment[];
  avgHeartRate: number;
  avgSystolic: number;
  avgDiastolic: number;
  avgOxygen: number;
  avgRespRate: number;
  avgTemp: number;
  riskDistribution: { level: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
  ageGroups: { range: string; count: number }[];
}

export function Reports({ onNavigate }: ReportsProps) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const patients = await api.getPatients();
      const clinicalResults = await Promise.all(
        patients.map((p) => api.getClinicalData(p.patient_id).catch(() => [])),
      );

      const allEncounters: ClinicalData[] = [];
      clinicalResults.forEach((enc) => allEncounters.push(...enc));

      const encounterPairs: { encounterId: number }[] = [];
      clinicalResults.forEach((enc) => {
        if (enc.length > 0) encounterPairs.push({ encounterId: enc[0].encounter_id });
      });

      const assessments: RiskAssessment[] = [];
      for (const pair of encounterPairs) {
        try {
          const a = await api.getAssessment(pair.encounterId);
          assessments.push(a);
        } catch { /* skip */ }
      }

      const validVitals = allEncounters.filter((e) => e.heart_rate !== undefined);
      const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;

      const riskDist: Record<string, number> = {};
      assessments.forEach((a) => {
        riskDist[a.risk_level] = (riskDist[a.risk_level] || 0) + 1;
      });

      const genderDist: Record<string, number> = {};
      patients.forEach((p) => {
        genderDist[p.gender] = (genderDist[p.gender] || 0) + 1;
      });

      const ageGroups = [
        { range: '0-18', count: 0 },
        { range: '19-35', count: 0 },
        { range: '36-55', count: 0 },
        { range: '56-75', count: 0 },
        { range: '75+', count: 0 },
      ];
      patients.forEach((p) => {
        const age = p.age || 0;
        if (age <= 18) ageGroups[0].count++;
        else if (age <= 35) ageGroups[1].count++;
        else if (age <= 55) ageGroups[2].count++;
        else if (age <= 75) ageGroups[3].count++;
        else ageGroups[4].count++;
      });

      setData({
        patients,
        totalEncounters: allEncounters.length,
        assessments,
        avgHeartRate: avg(validVitals.map((e) => e.heart_rate!).filter(Boolean)),
        avgSystolic: avg(validVitals.map((e) => e.systolic_bp!).filter(Boolean)),
        avgDiastolic: avg(validVitals.map((e) => e.diastolic_bp!).filter(Boolean)),
        avgOxygen: avg(validVitals.map((e) => e.oxygen_saturation!).filter(Boolean)),
        avgRespRate: avg(validVitals.map((e) => e.respiratory_rate!).filter(Boolean)),
        avgTemp: avg(validVitals.map((e) => e.temperature!).filter(Boolean)),
        riskDistribution: Object.entries(riskDist).map(([level, count]) => ({ level, count })),
        genderDistribution: Object.entries(genderDist).map(([gender, count]) => ({ gender, count })),
        ageGroups,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) return <LoadingOverlay message="Generating clinical reports…" />;
  if (error && !data) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const maxRiskCount = Math.max(...data.riskDistribution.map((r) => r.count), 1);
  const maxAgeCount = Math.max(...data.ageGroups.map((a) => a.count), 1);
  const maxGenderCount = Math.max(...data.genderDistribution.map((g) => g.count), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Clinical Reports</h2>
          <p className="text-sm text-slate-500">Aggregated analytics from live FastAPI data</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Patients', value: data.patients.length, color: 'text-brand-600', bg: 'bg-brand-50' },
          { icon: Activity, label: 'Total Encounters', value: data.totalEncounters, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: Brain, label: 'AI Assessments', value: data.assessments.length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: Siren, label: 'Critical Cases', value: data.riskDistribution.filter((r) => r.level === 'High' || r.level === 'Critical').reduce((s, r) => s + r.count, 0), color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardBody>
                <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Vital averages */}
      <Card>
        <CardHeader title="Average Vital Signs" subtitle="Across all encounters" icon={<HeartPulse className="w-4 h-4" />} />
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: HeartPulse, label: 'Heart Rate', value: data.avgHeartRate, unit: 'bpm', color: 'text-rose-500' },
              { icon: Droplet, label: 'Systolic', value: data.avgSystolic, unit: 'mmHg', color: 'text-blue-500' },
              { icon: Droplet, label: 'Diastolic', value: data.avgDiastolic, unit: 'mmHg', color: 'text-blue-400' },
              { icon: Wind, label: 'Oxygen', value: data.avgOxygen, unit: '%', color: 'text-cyan-500' },
              { icon: Activity, label: 'Resp. Rate', value: data.avgRespRate, unit: '/min', color: 'text-teal-500' },
              { icon: Thermometer, label: 'Temp', value: data.avgTemp, unit: '°C', color: 'text-orange-500' },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.label} className="text-center p-3 rounded-lg bg-slate-50">
                  <Icon className={`w-5 h-5 ${v.color} mx-auto mb-2`} />
                  <p className="text-xl font-bold text-slate-900">
                    {v.value || '—'}
                    <span className="text-xs font-normal text-slate-400 ml-0.5">{v.unit}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{v.label}</p>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk distribution */}
        <Card>
          <CardHeader title="Risk Level Distribution" icon={<TrendingUp className="w-4 h-4" />} />
          <CardBody className="space-y-3">
            {data.riskDistribution.length > 0 ? (
              data.riskDistribution.map((r) => (
                <div key={r.level}>
                  <div className="flex items-center justify-between mb-1">
                    <RiskBadge level={r.level} size="sm" />
                    <span className="text-xs text-slate-500">{r.count} patients</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        r.level === 'Critical' ? 'bg-red-500' :
                        r.level === 'High' ? 'bg-orange-500' :
                        r.level === 'Medium' ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${(r.count / maxRiskCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No assessment data available.</p>
            )}
          </CardBody>
        </Card>

        {/* Age distribution */}
        <Card>
          <CardHeader title="Age Distribution" icon={<Users className="w-4 h-4" />} />
          <CardBody className="space-y-3">
            {data.ageGroups.map((a) => (
              <div key={a.range}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">{a.range}</span>
                  <span className="text-xs text-slate-500">{a.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-700"
                    style={{ width: `${(a.count / maxAgeCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Gender distribution */}
        <Card>
          <CardHeader title="Gender Distribution" icon={<Users className="w-4 h-4" />} />
          <CardBody className="space-y-3">
            {data.genderDistribution.map((g) => (
              <div key={g.gender}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">{g.gender}</span>
                  <span className="text-xs text-slate-500">{g.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${(g.count / maxGenderCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Assessment log */}
      {data.assessments.length > 0 && (
        <Card>
          <CardHeader
            title="Assessment Log"
            subtitle={`${data.assessments.length} AI assessments`}
            icon={<FileText className="w-4 h-4" />}
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500">
                    <th className="text-left p-3 font-medium">Assessment ID</th>
                    <th className="text-left p-3 font-medium">Encounter</th>
                    <th className="text-left p-3 font-medium">Patient</th>
                    <th className="text-left p-3 font-medium">Risk</th>
                    <th className="text-left p-3 font-medium">Priority</th>
                    <th className="text-left p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.assessments.map((a) => {
                    const patient = data.patients.find((p) => p.patient_id === a.patient_id);
                    return (
                      <tr key={a.assessment_id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-slate-600 font-mono text-xs">#{a.assessment_id}</td>
                        <td className="p-3 text-slate-600 font-mono text-xs">#{a.encounter_id}</td>
                        <td className="p-3 text-slate-900">{patient?.name || `Patient ${a.patient_id}`}</td>
                        <td className="p-3"><RiskBadge level={a.risk_level} score={a.risk_score} size="sm" /></td>
                        <td className="p-3"><RiskBadge level={a.priority_level} size="sm" /></td>
                        <td className="p-3">
                          <button
                            onClick={() => onNavigate('ai-assessment', { encounterId: a.encounter_id })}
                            className="text-xs font-medium text-brand-600 hover:text-brand-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
