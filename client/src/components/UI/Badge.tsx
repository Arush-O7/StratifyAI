import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'positive' | 'negative' | 'neutral' | 'critical' | 'high' | 'medium' | 'low' | 'indigo';
  className?: string;
}

const colors = {
  positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.08)]',
  negative: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.08)]',
  neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-[0_0_15px_rgba(107,114,128,0.08)]',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.08)]',
  high: 'bg-orange-500/10 text-orange-450 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.08)]',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.08)]',
  low: 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_15px_rgba(59,130,246,0.08)]',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.08)]'
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider border ${colors[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
