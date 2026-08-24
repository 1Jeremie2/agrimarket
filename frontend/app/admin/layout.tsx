'use client';

import { LayoutDashboard, Users, CreditCard, Wallet, Landmark, Image as ImageIcon } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { label: 'Producteurs', href: '/admin/producteurs', icon: Users },
  { label: 'Confirmation paiements', href: '/admin/paiements', icon: CreditCard },
  { label: 'Numéros de dépôt', href: '/admin/comptes-paiement', icon: Landmark },
  { label: 'Reversements', href: '/admin/reversements', icon: Wallet },
  { label: 'Images du hero', href: '/admin/hero-images', icon: ImageIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardShell navItems={NAV_ITEMS} brandLabel="Administration">
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
