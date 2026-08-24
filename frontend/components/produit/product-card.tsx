import Link from 'next/link';
import { Leaf, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from './add-to-cart-button';

export function ProductCard({ product }: { product: any }) {
  return (
    <Card className="group overflow-hidden">
      <Link href={`/produits/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-light">
          {product.photoUrl ? (
            <img
              src={product.photoUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-forest/30">
              <Leaf size={40} />
            </div>
          )}
          {product.producer?.status === 'VALIDE' && (
            <span className="absolute left-3 top-3">
              <Badge variant="success">
                <ShieldCheck size={12} className="mr-1 inline" />
                Vérifié
              </Badge>
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/produits/${product.id}`}>
          <h3 className="truncate text-sm font-semibold text-ink hover:text-forest">{product.name}</h3>
        </Link>
        <p className="mt-0.5 truncate text-xs text-slate-500">{product.producer?.farmName}</p>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-base font-semibold text-forest">
            {product.priceB2c} <span className="text-xs font-normal text-slate-400">FCFA/{product.unit}</span>
          </p>
        </div>

        <AddToCartButton product={product} className="mt-3" />
      </div>
    </Card>
  );
}
