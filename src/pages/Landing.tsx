import {
  HeartPulse,
  Brain,
  Siren,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  Stethoscope,
  TrendingDown,
  Clock,
} from 'lucide-react';
import type { Page } from '@/types';

interface LandingProps {
  onEnter: (page: Page) => void;
}

export function Landing({ onEnter }: LandingProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative flex items-center justify-between px-6 lg:px-12 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">MediQueue</span>
        </div>
        <button
          onClick={() => onEnter('dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
        >
          Enter Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Hero */}
      <section className="relative px-6 lg:px-12 pt-16 pb-24 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 ring-1 ring-white/10 rounded-full text-xs text-slate-300 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            AI-Powered Triage System · Live
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance max-w-3xl leading-[1.1]">
            Smarter triage.
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-emerald-400 bg-clip-text text-transparent">
              Faster decisions.
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl text-balance leading-relaxed">
            A real-time clinical risk dashboard that assesses patient vitals, ranks
            emergency priority, and surfaces critical cases before they escalate.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onEnter('dashboard')}
              className="group flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-brand-600/30"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => onEnter('queue')}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 rounded-xl font-semibold text-sm transition-colors backdrop-blur-sm"
            >
              <Siren className="w-4 h-4 text-red-400" />
              View Priority Queue
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: 'Real-time polling', value: '5s', color: 'text-amber-400' },
            { icon: Brain, label: 'AI Risk Scoring', value: '0–100', color: 'text-brand-400' },
            { icon: ShieldCheck, label: 'Priority Levels', value: '4 tiers', color: 'text-emerald-400' },
            { icon: Activity, label: 'Vital Signs', value: '6 types', color: 'text-rose-400' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white/5 ring-1 ring-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative px-6 lg:px-12 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">Built for emergency care teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Siren,
              title: 'Emergency Priority Queue',
              desc: 'Patients auto-ranked by AI risk score so the most critical cases surface to the top — instantly.',
              color: 'from-red-500/20 to-orange-500/10',
              iconColor: 'text-red-400',
            },
            {
              icon: Brain,
              title: 'AI Risk Assessment',
              desc: 'Each encounter gets a risk score, priority level, and plain-English explanation of the findings.',
              color: 'from-brand-500/20 to-cyan-500/10',
              iconColor: 'text-brand-400',
            },
            {
              icon: Stethoscope,
              title: 'Clinical Records',
              desc: 'Full vital signs history per patient — heart rate, blood pressure, oxygen, temperature, and more.',
              color: 'from-emerald-500/20 to-teal-500/10',
              iconColor: 'text-emerald-400',
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group bg-gradient-to-br ${f.color} ring-1 ring-white/10 rounded-2xl p-6 hover:ring-white/20 transition-all cursor-pointer`}
                onClick={() => onEnter('dashboard')}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow */}
      <section className="relative px-6 lg:px-12 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Activity, step: '01', title: 'Capture Vitals', desc: 'Clinical data flows in from the FastAPI backend.' },
            { icon: Brain, step: '02', title: 'AI Scores Risk', desc: 'Each encounter is analyzed and assigned a 0–100 risk score.' },
            { icon: Siren, step: '03', title: 'Prioritize', desc: 'Critical patients bubble to the top of the queue automatically.' },
            { icon: TrendingDown, step: '04', title: 'Act', desc: 'Clinicians intervene before conditions worsen.' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative">
                <div className="bg-white/5 ring-1 ring-white/10 rounded-xl p-5 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono text-slate-600">{s.step}</span>
                    <Icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{s.title}</h4>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-slate-700" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 lg:px-12 py-20 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-brand-600/30 to-emerald-600/20 ring-1 ring-white/10 rounded-3xl p-10 backdrop-blur-sm">
          <Clock className="w-8 h-8 text-brand-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Every second counts</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Start monitoring your patients in real time with AI-assisted triage.
          </p>
          <button
            onClick={() => onEnter('dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-semibold text-sm transition-colors"
          >
            Launch Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 lg:px-12 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-brand-500" />
            <span>MediQueue — Clinical Risk Dashboard</span>
          </div>
          <p>Powered by FastAPI · React · AI Triage Engine</p>
        </div>
      </footer>
    </div>
  );
}
