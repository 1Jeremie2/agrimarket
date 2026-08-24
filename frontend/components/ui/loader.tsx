import { Loader2 } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 size={28} className="animate-spin text-brand" />
    </div>
  );
}

export function InlineLoader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

// Squelette pour cartes produit — donne une impression de rapidité pendant le chargement
export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-subtle">
      <div className="mb-3 h-40 rounded-xl bg-slate-100" />
      <div className="mb-2 h-4 w-3/4 rounded bg-slate-100" />
      <div className="h-3 w-1/2 rounded bg-slate-100" />
    </div>
  );
}
