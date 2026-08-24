'use client';

import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/loader';

export default function PayoutsPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [referenceInputs, setReferenceInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    api.orders.awaitingPayout().then(setOrders).finally(() => setLoading(false));
  }, []);

  async function handleMarkAsPaid(orderId: string) {
    const reference = referenceInputs[orderId];
    if (!reference) return toast('Indique une référence de virement avant de valider.', 'error');
    try {
      await api.orders.markPayoutDone(orderId, reference);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast('Reversement enregistré', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Reversements aux producteurs</h1>
      <p className="mt-1 text-sm text-slate-500">
        Après le virement mobile money manuel, enregistre la référence pour garder une trace.
      </p>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={Wallet} title="Aucun reversement en attente" />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">Commande #{order.id.slice(0, 8)}</p>
                  <p className="text-sm font-semibold text-forest">{order.totalAmount} FCFA</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">Producteur : {order.producer?.farmName}</p>
                <p className="text-xs text-slate-500">
                  Compte mobile money : {order.producer?.mobileMoneyAccount ?? 'non renseigné'}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <Input
                    placeholder="Référence du virement"
                    value={referenceInputs[order.id] ?? ''}
                    onChange={(e) => setReferenceInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                    className="max-w-xs"
                  />
                  <Button size="sm" onClick={() => handleMarkAsPaid(order.id)}>
                    Marquer comme reversé
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
