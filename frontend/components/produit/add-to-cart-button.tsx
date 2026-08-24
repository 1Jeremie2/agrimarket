'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Button } from '@/components/ui/button';

export function AddToCartButton({ product, className = '' }: { product: any; className?: string }) {
  const { getCartsForProducer, addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  const producerId = product.producerId ?? product.producer?.id;
  const producerName = product.producer?.farmName ?? '';
  const unitPrice = user?.buyerType === 'PRO' ? product.priceB2b : product.priceB2c;

  const existingCarts = getCartsForProducer(producerId);
  const [selectedCartId, setSelectedCartId] = useState<string>('new');

  function handleAdd() {
    const targetCartId = selectedCartId === 'new' ? null : selectedCartId;
    addItem(targetCartId, producerId, producerName, {
      productId: product.id,
      name: product.name,
      unitPrice: Number(unitPrice),
      unit: product.unit,
    });
    setAdded(true);
    toast(`${product.name} ajouté au panier`, 'success');
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} onClick={(e) => e.preventDefault()}>
      {existingCarts.length > 0 && (
        <select
          value={selectedCartId}
          onChange={(e) => setSelectedCartId(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="new">+ Nouveau panier</option>
          {existingCarts.map((cart) => (
            <option key={cart.id} value={cart.id}>
              {cart.label}
            </option>
          ))}
        </select>
      )}
      <Button size="sm" onClick={handleAdd} className="whitespace-nowrap">
        {added ? <Check size={15} /> : <ShoppingCart size={15} />}
        {added ? 'Ajouté' : 'Ajouter'}
      </Button>
    </div>
  );
}
