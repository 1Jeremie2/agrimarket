'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'PRODUCER' | 'ADMIN' | 'BUYER';
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // on attend la lecture de la session avant de décider

    if (!user) {
      router.push('/login');
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.push('/'); // connecté, mais pas le bon rôle → retour accueil
    }
  }, [user, loading, requiredRole, router]);

  if (loading) return <p>Chargement…</p>;
  if (!user) return null;
  if (requiredRole && user.role !== requiredRole) return null;

  return <>{children}</>;
}
