import { Leaf, ShieldCheck, MapPin, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import { AddToCartButton } from '@/components/produit/add-to-cart-button';
import { Badge } from '@/components/ui/badge';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await api.products.get(params.id);

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-brand-light">
          {product.photoUrl ? (
            <img src={product.photoUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-forest/30">
              <Leaf size={64} />
            </div>
          )}
        </div>

        <div className="animate-fade-in">
          {product.producer?.status === 'VALIDE' && (
            <Badge variant="success">
              <ShieldCheck size={12} className="mr-1 inline" />
              Producteur vérifié
            </Badge>
          )}
          <h1 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Vendu par {product.producer?.farmName}</p>

          {product.description && <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description}</p>}

          <div className="mt-6 rounded-2xl border border-slate-100 bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-500">Prix particulier</span>
              <span className="text-xl font-semibold text-forest">{product.priceB2c} FCFA <span className="text-xs font-normal text-slate-400">/{product.unit}</span></span>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-slate-200 pt-2">
              <span className="text-sm text-slate-500">Prix professionnel</span>
              <span className="text-base font-semibold text-ink">{product.priceB2b} FCFA <span className="text-xs font-normal text-slate-400">/{product.unit}</span></span>
            </div>
          </div>

          {product.producer?.address && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin size={13} />
              {product.producer.address}
            </p>
          )}
          {product.producer?.deliveryZone && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Truck size={13} />
              Livraison : {product.producer.deliveryZone}
            </p>
          )}

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
