'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, ShoppingBag, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/loader';

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.orders.forMyProducerAccount(), api.products.list()])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const pendingOrders = orders.filter((o) => o.status === 'EN_ATTENTE');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Tableau de bord</h1>
        <Link href="/espace-producteur/produits/nouveau">
          <Button size="sm">
            <Plus size={15} />
            Ajouter un produit
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Package} label="Produits publiés" value={products.length} accent="brand" />
        <StatCard icon={Clock} label="Commandes en attente" value={pendingOrders.length} accent="action" />
        <StatCard icon={ShoppingBag} label="Commandes au total" value={orders.length} accent="forest" />
      </div>
    </div>
  );
}
