import { LucideIcon } from 'lucide-react';
import { Card } from './card';

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  accent?: 'brand' | 'action' | 'forest';
};

const ACCENTS = {
  brand: 'bg-brand-light text-forest',
  action: 'bg-amber-50 text-amber-700',
  forest: 'bg-forest/10 text-forest',
};

export function StatCard({ icon: Icon, label, value, trend, accent = 'brand' }: StatCardProps) {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${ACCENTS[accent]}`}>
            <Icon size={18} />
          </div>
          {trend && (
            <span className={`text-xs font-medium ${trend.positive ? 'text-forest' : 'text-red-500'}`}>
              {trend.value}
            </span>
          )}
        </div>
        <p className="mt-4 text-2xl font-semibold text-ink">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  );
}
