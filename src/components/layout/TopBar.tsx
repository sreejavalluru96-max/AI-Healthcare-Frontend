import { Menu, Search, Bell } from 'lucide-react';
import type { Page } from '@/types';

const pageTitles: Record<Page, string> = {
  landing: 'Home',
  dashboard: 'Dashboard',
  patients: 'Patient Management',
  'patient-detail': 'Patient Details',
  queue: 'Emergency Priority Queue',
  'ai-assessment': 'AI Risk Assessment',
  reports: 'Clinical Reports',
  'system-status': 'System Status',
};

interface TopBarProps {
  page: Page;
  onOpenSidebar: () => void;
}

export function TopBar({ page, onOpenSidebar }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 lg:px-6 gap-4">
      <button onClick={onOpenSidebar} className="lg:hidden text-slate-600">
        <Menu className="w-6 h-6" />
      </button>
      <h1 className="text-lg font-semibold text-slate-900 flex-1">
        {pageTitles[page]}
      </h1>
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg w-64">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search patients…"
          className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400"
        />
      </div>
      <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
      </button>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
        MD
      </div>
    </header>
  );
}
