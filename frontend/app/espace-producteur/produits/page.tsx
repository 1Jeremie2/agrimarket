'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Archive } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Table, Thead, Th, Tbody, Td } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/loader';

const STATUS_VARIANT: Record<string, any> = { DISPONIBLE: 'success', RUPTURE: 'warning', ARCHIVE: 'neutral' };

export default function MyProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.producer?.id) return;
    api.products.list({ producerId: user.producer.id }).then(setProducts).finally(() => setLoading(false));
  }, [user]);

  async function handleDelete(id: string, name: string) {
    if (!confirm('Archiver ce produit ? Il ne sera plus visible du catalogue.')) return;
    await api.products.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast(`${name} archivé`, 'info');
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Mes produits</h1>
        <Link href="/espace-producteur/produits/nouveau">
          <Button size="sm">
            <Plus size={15} />
            Ajouter
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Package}
            title="Aucun produit publié"
            description="Ajoute ton premier produit pour commencer à vendre."
            action={<Link href="/espace-producteur/produits/nouveau"><Button size="sm"><Plus size={15} />Ajouter un produit</Button></Link>}
          />
        </div>
      ) : (
        <div className="mt-6">
          <Table>
            <Thead>
              <Th>Nom</Th>
              <Th>Prix particulier</Th>
              <Th>Prix professionnel</Th>
              <Th>Unité</Th>
              <Th>Statut</Th>
              <Th></Th>
            </Thead>
            <Tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <Td className="font-medium">{product.name}</Td>
                  <Td>{product.priceB2c} FCFA</Td>
                  <Td>{product.priceB2b} FCFA</Td>
                  <Td>{product.unit}</Td>
                  <Td><Badge variant={STATUS_VARIANT[product.status]}>{product.status}</Badge></Td>
                  <Td>
                    <button onClick={() => handleDelete(product.id, product.name)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500">
                      <Archive size={13} />
                      Archiver
                    </button>
                  </Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
