'use client';

import { useEffect, useState } from 'react';
import { CreditCard, ExternalLink, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/loader';

export default function PaymentConfirmationPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.orders.awaitingPaymentConfirmation().then(setOrders).finally(() => setLoading(false));
  }, []);

  async function handleConfirm(orderId: string) {
    if (!confirm('Confirmes-tu avoir vérifié ce paiement sur le relevé mobile money de la plateforme ?')) return;
    try {
      await api.orders.confirmPayment(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast('Paiement confirmé', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Confirmation des paiements</h1>
      <p className="mt-1 text-sm text-slate-500">
        Vérifie chaque preuve contre le relevé mobile money réel avant de confirmer.
      </p>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={CreditCard} title="Rien à confirmer" description="Toutes les commandes en attente ont été traitées." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">Commande #{order.id.slice(0, 8)}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Réf : <span className="font-semibold text-forest">{order.paymentReference}</span>
                    </p>
                  </div>
                  <Badge variant="warning">{order.totalAmount} FCFA attendu</Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <p>Acheteur : {order.buyer?.email} · {order.buyer?.phone}</p>
                  <p>Producteur : {order.producer?.farmName}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  {order.paymentProofUrl ? (
                    <a href={order.paymentProofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-forest hover:underline">
                      <ExternalLink size={14} />
                      Voir la preuve
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400">Aucune preuve envoyée pour l'instant.</p>
                  )}
                  <Button size="sm" onClick={() => handleConfirm(order.id)} className="ml-auto">
                    <CheckCircle2 size={14} />
                    Confirmer le paiement
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
