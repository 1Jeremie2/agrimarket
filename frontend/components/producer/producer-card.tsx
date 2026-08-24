import { MapPin, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ProducerCard({ producer }: { producer: any }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest text-lg font-semibold text-white">
          {producer.farmName?.slice(0, 1)?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-ink">{producer.farmName}</p>
            <ShieldCheck size={14} className="shrink-0 text-brand" />
          </div>
          {producer.address && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
              <MapPin size={11} />
              {producer.address}
            </p>
          )}
        </div>
      </div>
      {producer.description && (
        <p className="mt-3 line-clamp-2 text-xs text-slate-500">{producer.description}</p>
      )}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck size={13} className="text-brand" />
        Profil validé par la plateforme
      </div>
    </Card>
  );
}
