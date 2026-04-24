import React from 'react';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AccentColor = 'primary' | 'green' | 'amber' | 'red';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  isLoading?: boolean;
  accentColor?: AccentColor;
}

const accentMap: Record<AccentColor, { icon: string; pill: string; value: string }> = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    pill: 'ring-primary/10',
    value: 'text-primary',
  },
  green: {
    icon: 'bg-green-100 text-green-600',
    pill: 'ring-green-100',
    value: 'text-green-600',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600',
    pill: 'ring-amber-100',
    value: 'text-amber-600',
  },
  red: {
    icon: 'bg-red-100 text-red-600',
    pill: 'ring-red-100',
    value: 'text-red-600',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, isLoading, accentColor = 'primary' }) => {
  const accent = accentMap[accentColor];

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 animate-pulse">
        <div className="flex items-center justify-between mb-5">
          <div className="w-11 h-11 bg-slate-200 rounded-2xl" />
          <div className="w-16 h-5 bg-slate-200 rounded-full" />
        </div>
        <div className="h-9 bg-slate-200 rounded-xl w-28 mb-2" />
        <div className="h-4 bg-slate-200 rounded w-36" />
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-6 overflow-hidden relative">
      {/* Subtle gradient shimmer on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white via-transparent to-slate-50/40" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          {/* Icon bubble */}
          <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ring-4', accent.icon, accent.pill)}>
            <Icon className="w-5 h-5" />
          </div>
          {/* Trend badge */}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-full border',
              trend.isUp
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-600 border-red-200'
            )}>
              {trend.isUp
                ? <TrendingUp className="w-3 h-3" />
                : <TrendingDown className="w-3 h-3" />}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>

        <p className="text-3xl font-black text-slate-900 tracking-tight mb-1">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
};
