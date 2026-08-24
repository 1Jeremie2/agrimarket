import { ReactNode } from 'react';

type BadgeProps = {
  variant?: 'success' | 'warning' | 'neutral' | 'info' | 'danger';
  children: ReactNode;
};

const VARIANTS = {
  success: 'bg-brand-light text-forest',
  warning: 'bg-amber-50 text-amber-700',
  neutral: 'bg-slate-100 text-ink',
  info: 'bg-blue-50 text-blue-700',
  danger: 'bg-red-50 text-red-600',
};

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${VARIANTS[variant]}`}>
      {children}
    </span>
  );
}
