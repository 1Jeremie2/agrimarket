'use client';

import { useEffect, useState } from 'react';
import { PackageSearch } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/loader';

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmée', EXPEDIEE: 'Expédiée', LIVREE: 'Livrée', ANNULEE: 'Annulée',
};
const STATUS_VARIANT: Record<string, any> = {
  EN_ATTENTE: 'neutral', CONFIRMEE: 'info', EXPEDIEE: 'warning', LIVREE: 'success', ANNULEE: 'danger',
};
const NEXT_STATUS: Record<string, string[]> = {
  EN_ATTENTE: ['CONFIRMEE', 'ANNULEE'],
  CONFIRMEE: ['EXPEDIEE', 'ANNULEE'],
  EXPEDIEE: ['LIVREE'],
  LIVREE: [],
  ANNULEE: [],
};

export default function ProducerOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.orders.forMyProducerAccount().then(setOrders).finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      const updated = await api.orders.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
      toast(`Commande passée à « ${STATUS_LABELS[updated.status]} »`, 'success');
    } catch (err: any) {
      toast(err.message ?? 'Impossible de changer le statut', 'error');
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Commandes reçues</h1>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={PackageSearch} title="Aucune commande" description="Les commandes de tes acheteurs apparaîtront ici." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">Commande #{order.id.slice(0, 8)}</p>
                  <Badge variant={STATUS_VARIANT[order.status]}>{STATUS_LABELS[order.status]}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">Total : {order.totalAmount} FCFA · Livraison : {order.deliveryModeChosen}</p>

                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {order.items?.map((item: any) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.quantity} × {item.product?.name}</span>
                      <span>{item.subtotal} FCFA</span>
                    </li>
                  ))}
                </ul>

                {NEXT_STATUS[order.status]?.length > 0 && (
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                    {NEXT_STATUS[order.status].map((next) => (
                      <Button key={next} size="sm" variant={next === 'ANNULEE' ? 'outline' : 'secondary'} onClick={() => handleStatusChange(order.id, next)}>
                        {STATUS_LABELS[next]}
                      </Button>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
