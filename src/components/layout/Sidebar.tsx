import {
  LayoutDashboard,
  Users,
  FileText,
  Siren,
  Stethoscope,
  CheckCircle2,
  HeartPulse,
  X,
} from 'lucide-react';
import type { Page } from '@/types';

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeTreatmentCount: number;
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard; step: string }[] = [
  { id: 'dashboard', label: 'Welcome / Home', icon: LayoutDashboard, step: '1' },
  { id: 'patients', label: 'Patient Management', icon: Users, step: '2' },
  { id: 'reports', label: 'Patient Reports', icon: FileText, step: '3' },
  { id: 'queue', label: 'AI Priority & Emergency Queue', icon: Siren, step: '4' },
  { id: 'treatment', label: 'Treatment / Emergency Mgmt', icon: Stethoscope, step: '5' },
  { id: 'system-status', label: 'System Status', icon: CheckCircle2, step: '' },
];

export function Sidebar({ current, onNavigate, mobileOpen, onCloseMobile, activeTreatmentCount }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">MediQueue</p>
              <p className="text-xs text-slate-500 mt-0.5">Clinical Risk System</p>
            </div>
          </div>
          <button onClick={onCloseMobile} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.step && (
                  <span className={`text-[10px] font-mono w-4 text-center ${
                    active ? 'text-brand-200' : 'text-slate-600'
                  }`}>
                    {item.step}
                  </span>
                )}
                <Icon className="w-4.5 h-4.5" />
                {item.label}
                {item.id === 'treatment' && activeTreatmentCount > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                    {activeTreatmentCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
              MD
            </div>
            <div>
              <p className="text-xs font-medium text-white">Dr. Morgan</p>
              <p className="text-xs text-slate-500">Emergency Dept.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
