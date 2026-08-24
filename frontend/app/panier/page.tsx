'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Pencil, Check, MapPin } from 'lucide-react';
import { useCart, cartTotal, type Cart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

const DELIVERY_LABELS: Record<string, string> = {
  RETRAIT_SUR_PLACE: 'Retrait sur place',
  LIVRAISON_PRODUCTEUR: 'Livraison par le producteur',
};

function CartCard({ cart }: { cart: Cart }) {
  const { updateQuantity, removeItem, removeCart, renameCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [producer, setProducer] = useState<any>(null);
  const [deliveryMode, setDeliveryMode] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(cart.label);

  useEffect(() => {
    api.producers.get(cart.producerId).then(setProducer);
  }, [cart.producerId]);

  const availableModes =
    producer?.deliveryMode === 'LES_DEUX'
      ? ['RETRAIT_SUR_PLACE', 'LIVRAISON_PRODUCTEUR']
      : producer?.deliveryMode
        ? [producer.deliveryMode]
        : [];

  async function handleSubmit() {
    setError(null);
    if (!user) return router.push('/login');
    if (!deliveryMode) return setError('Choisis un mode de livraison.');
    if (deliveryMode === 'LIVRAISON_PRODUCTEUR' && !deliveryAddress.trim()) {
      return setError('Indique une adresse de livraison.');
    }

    setSubmitting(true);
    try {
      const order = await api.orders.create({
        producerId: cart.producerId,
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryModeChosen: deliveryMode,
        deliveryAddress: deliveryMode === 'LIVRAISON_PRODUCTEUR' ? deliveryAddress : undefined,
      });
      removeCart(cart.id);
      toast('Commande validée — direction le bon de paiement', 'success');
      router.push(`/commandes/${order.id}/paiement`);
    } catch (err: any) {
      setError(err.message ?? 'Impossible de valider la commande');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="overflow-visible">
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          {editingLabel ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                autoFocus
              />
              <button
                onClick={() => { renameCart(cart.id, labelDraft); setEditingLabel(false); }}
                className="text-forest"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditingLabel(true)} className="flex items-center gap-1.5 text-left">
              <h2 className="text-base font-semibold text-ink">{cart.label}</h2>
              <Pencil size={13} className="text-slate-400" />
            </button>
          )}
          <button onClick={() => removeCart(cart.id)} className="shrink-0 text-slate-400 hover:text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">Chez {cart.producerName}</p>

        <ul className="mt-4 divide-y divide-slate-100">
          {cart.items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-slate-500">{item.unitPrice} FCFA / {item.unit}</p>
              </div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(cart.id, item.productId, Number(e.target.value))}
                className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <p className="w-20 shrink-0 text-right text-sm font-medium text-ink">
                {item.unitPrice * item.quantity} F
              </p>
              <button onClick={() => removeItem(cart.id, item.productId)} className="text-slate-300 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-500">Total</span>
          <span className="text-lg font-semibold text-forest">{cartTotal(cart)} FCFA</span>
        </div>

        {producer && (
          <div className="mt-4 rounded-xl bg-surface p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Livraison</p>
            <div className="mt-2 space-y-1.5">
              {availableModes.map((mode) => (
                <label key={mode} className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name={`deliveryMode-${cart.id}`}
                    checked={deliveryMode === mode}
                    onChange={() => setDeliveryMode(mode)}
                    className="accent-forest"
                  />
                  {DELIVERY_LABELS[mode]}
                </label>
              ))}
            </div>

            {deliveryMode === 'LIVRAISON_PRODUCTEUR' && (
              <div className="mt-3 space-y-2">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={12} />
                  Zone : {producer.deliveryZone ?? 'non précisée'}
                </p>
                <textarea
                  placeholder="Ton adresse de livraison"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            )}
          </div>
        )}

        {!user && <p className="mt-3 text-xs text-amber-600">Connecte-toi pour valider cette commande.</p>}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <Button onClick={handleSubmit} loading={submitting} className="mt-4 w-full">
          {user ? 'Valider ce panier' : 'Se connecter pour commander'}
        </Button>
      </CardBody>
    </Card>
  );
}

export default function CartsPage() {
  const { carts } = useCart();

  return (
    <div className="container-app py-10">
      <h1 className="text-2xl font-semibold text-ink">Mes paniers</h1>
      <p className="mt-1 text-sm text-slate-500">
        {carts.length > 0
          ? `${carts.length} panier${carts.length > 1 ? 's' : ''} en cours — chacun se valide indépendamment.`
          : 'Aucun panier pour l\'instant.'}
      </p>

      {carts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Tes paniers sont vides"
            description="Parcours le catalogue et ajoute des produits pour commencer."
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {carts.map((cart) => (
            <CartCard key={cart.id} cart={cart} />
          ))}
        </div>
      )}
    </div>
  );
}
