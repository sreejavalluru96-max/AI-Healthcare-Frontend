import { useEffect, useState, useCallback } from 'react';
import {
  Activity,
  Server,
  HeartPulse,
  Users,
  Brain,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Zap,
} from 'lucide-react';
import type { HealthStatus } from '@/types';
import { api } from '@/lib/api';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { LoadingOverlay } from '@/components/ui/Loading';

interface StatusLog {
  timestamp: Date;
  status: 'ok' | 'error';
  message: string;
  latency: number;
}

export function SystemStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [logs, setLogs] = useState<StatusLog[]>([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState(0);

  const checkHealth = useCallback(async () => {
    const start = performance.now();
    try {
      const result = await api.getHealth();
      const elapsed = Math.round(performance.now() - start);
      setHealth(result);
      setLatency(elapsed);
      setOnline(true);
      setLogs((prev) => [
        { timestamp: new Date(), status: 'ok' as const, message: `OK · ${elapsed}ms`, latency: elapsed },
        ...prev,
      ].slice(0, 20));
    } catch (err) {
      setOnline(false);
      setLogs((prev) => [
        { timestamp: new Date(), status: 'error' as const, message: err instanceof Error ? err.message : 'Connection failed', latency: 0 },
        ...prev,
      ].slice(0, 20));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const id = setInterval(checkHealth, 5000);
    return () => clearInterval(id);
  }, [checkHealth]);

  if (loading && !health) return <LoadingOverlay message="Checking system status…" />;

  const uptimePct = logs.length > 0
    ? Math.round((logs.filter((l) => l.status === 'ok').length / logs.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status banner */}
      <div className={`rounded-xl p-6 ${
        online
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
          : 'bg-gradient-to-r from-red-500 to-rose-500'
      } text-white shadow-lg`}>
        <div className="flex items-center gap-4">
          {online ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              {online ? 'All Systems Operational' : 'Backend Unreachable'}
            </h2>
            <p className="text-sm text-white/80">
              {online
                ? `FastAPI responding · ${latency}ms latency · polling every 5s`
                : 'Cannot reach http://127.0.0.1:8000 — check that your FastAPI server is running'}
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-3xl font-bold">{uptimePct}%</p>
            <p className="text-xs text-white/70">Uptime (recent)</p>
          </div>
        </div>
      </div>

      {/* Endpoint status grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Server, label: 'GET /', path: 'Root endpoint', status: online ? 'operational' : 'down' },
          { icon: HeartPulse, label: 'GET /health', path: 'Health check', status: online ? 'operational' : 'down' },
          { icon: Users, label: 'GET /patients', path: 'Patient list', status: online ? 'operational' : 'down' },
          { icon: Activity, label: 'GET /patients/{id}', path: 'Patient detail', status: online ? 'operational' : 'down' },
          { icon: Activity, label: 'GET /patients/{id}/clinical-data', path: 'Clinical records', status: online ? 'operational' : 'down' },
          { icon: Brain, label: 'GET /ai-assessment/{id}', path: 'AI assessment', status: online ? 'operational' : 'down' },
        ].map((ep) => {
          const Icon = ep.icon;
          return (
            <Card key={ep.label}>
              <CardBody className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  ep.status === 'operational' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{ep.label}</p>
                  <p className="text-xs text-slate-500">{ep.path}</p>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  ep.status === 'operational' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`} />
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Health response + Latency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Health Response"
            subtitle="Raw JSON from /health endpoint"
            icon={<Activity className="w-4 h-4" />}
            action={
              <button onClick={checkHealth} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            }
          />
          <CardBody>
            {health ? (
              <pre className="text-xs font-mono bg-slate-900 text-slate-300 rounded-lg p-4 overflow-x-auto scrollbar-thin">
                {JSON.stringify(health, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-slate-500">No health data received.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Live Polling Log" subtitle="Last 20 health checks" icon={<Clock className="w-4 h-4" />} />
          <CardBody className="p-0 max-h-80 overflow-y-auto scrollbar-thin">
            {logs.length === 0 ? (
              <p className="p-5 text-sm text-slate-500 text-center">No logs yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <span className={`w-2 h-2 rounded-full ${log.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-mono text-slate-400">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`text-xs font-medium ${log.status === 'ok' ? 'text-emerald-700' : 'text-red-700'}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Config info */}
      <Card>
        <CardHeader title="Connection Details" icon={<Zap className="w-4 h-4" />} />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-400 mb-1">API Base URL</p>
              <p className="text-sm font-mono text-slate-900">http://127.0.0.1:8000</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-400 mb-1">Swagger Docs</p>
              <p className="text-sm font-mono text-slate-900">http://127.0.0.1:8000/docs</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-400 mb-1">Polling Interval</p>
              <p className="text-sm font-medium text-slate-900">5 seconds</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-400 mb-1">Current Latency</p>
              <p className="text-sm font-medium text-slate-900">{latency}ms</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
