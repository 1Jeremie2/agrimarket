'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PackageSearch, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/loader';

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  EXPEDIEE: 'Expédiée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
};
const STATUS_VARIANT: Record<string, any> = {
  EN_ATTENTE: 'neutral', CONFIRMEE: 'info', EXPEDIEE: 'warning', LIVREE: 'success', ANNULEE: 'danger',
};
const PAYMENT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'Paiement en attente de vérification',
  PAYE: 'Paiement confirmé',
  ECHOUE: 'Paiement échoué',
};

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // on attend la lecture de la session avant de décider

    if (!user) {
      router.push('/login');
      return;
    }

    api.orders
      .mine()
      .then(setOrders)
      .catch(() => setOrders([])) // en cas d'erreur réseau, on affiche l'état vide plutôt que de planter la page
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) return <PageLoader />;
  if (!user) return null; // le temps que la redirection s'effectue

  return (
    <div className="container-app py-10">
      <h1 className="text-2xl font-semibold text-ink">Mes commandes</h1>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={PackageSearch} title="Aucune commande" description="Tes commandes passées apparaîtront ici." />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">Commande #{order.id.slice(0, 8)}</p>
                  <Badge variant={STATUS_VARIANT[order.status]}>{STATUS_LABELS[order.status]}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">Chez {order.producer?.farmName}</p>
                <p className="mt-1 text-xs text-slate-400">{PAYMENT_LABELS[order.paymentStatus]}</p>

                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {order.items?.map((item: any) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.quantity} × {item.product?.name ?? 'Produit'}</span>
                      <span>{item.subtotal} FCFA</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm font-semibold text-forest">{order.totalAmount} FCFA</span>
                  <div className="flex gap-3 text-sm">
                    {order.paymentStatus === 'EN_ATTENTE' && !order.paymentProofUrl && (
                      <Link href={`/commandes/${order.id}/paiement`} className="font-medium text-action hover:underline">
                        Bon de paiement
                      </Link>
                    )}
                    {order.status === 'LIVREE' && (
                      <Link href={`/commandes/${order.id}/avis`} className="flex items-center gap-1 font-medium text-forest hover:underline">
                        <Star size={13} />
                        Laisser un avis
                      </Link>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
