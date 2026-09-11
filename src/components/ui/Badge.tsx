interface BadgeProps {
  level: string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

const levelConfig: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  Critical: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200', dot: 'bg-red-500' },
  High: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200', dot: 'bg-orange-500' },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  Low: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
  Normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
};

function getConfig(level: string) {
  return levelConfig[level] || { bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-200', dot: 'bg-slate-400' };
}

export function RiskBadge({ level, score, size = 'md' }: BadgeProps) {
  const cfg = getConfig(level);
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };
  const dotSize = { sm: 'w-1.5 h-1.5', md: 'w-2 h-2', lg: 'w-2.5 h-2.5' };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring} ${sizeClasses[size]}`}>
      <span className={`rounded-full ${cfg.dot} ${dotSize[size]} animate-pulse`} />
      {level}
      {score !== undefined && <span className="opacity-60">· {score}</span>}
    </span>
  );
}
