'use client';

import { LayoutDashboard, Package, ShoppingBag } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { useAuth } from '@/lib/auth-context';
import { AlertTriangle } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/espace-producteur', icon: LayoutDashboard },
  { label: 'Mes produits', href: '/espace-producteur/produits', icon: Package },
  { label: 'Commandes reçues', href: '/espace-producteur/commandes', icon: ShoppingBag },
];

export default function EspaceProducteurLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRole="PRODUCER">
      <DashboardShell navItems={NAV_ITEMS} brandLabel={user?.producer?.farmName ?? 'Mon espace'}>
        {user?.producer?.status === 'EN_ATTENTE' && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">Profil en attente de validation</p>
              <p className="text-sm text-amber-700">
                Un administrateur doit valider ton profil avant que tes produits soient visibles publiquement.
              </p>
            </div>
          </div>
        )}
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
