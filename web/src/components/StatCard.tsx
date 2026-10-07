import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'default';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const variantStyles = {
    cyan: 'border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-slate-900 text-cyan-400 group-hover:border-cyan-500/40',
    amber: 'border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-slate-900 text-amber-400 group-hover:border-amber-500/40',
    emerald: 'border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900 text-emerald-400 group-hover:border-emerald-500/40',
    rose: 'border-rose-500/20 bg-gradient-to-br from-rose-950/20 to-slate-900 text-rose-400 group-hover:border-rose-500/40',
    indigo: 'border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-slate-900 text-indigo-400 group-hover:border-indigo-500/40',
    default: 'border-slate-800 bg-slate-900/60 text-slate-400 group-hover:border-slate-700',
  };

  const iconBackgrounds = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    amber: 'bg-amber-500/10 text-amber-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    rose: 'bg-rose-500/10 text-rose-400',
    indigo: 'bg-indigo-500/10 text-indigo-400',
    default: 'bg-slate-800 text-slate-300',
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        variantStyles[variant]
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <div className={`rounded-xl p-2.5 ${iconBackgrounds[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-extrabold tracking-tight text-white">{value}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
};
