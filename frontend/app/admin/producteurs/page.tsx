'use client';

import { useEffect, useState } from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { Card, CardBody } from '@/components/ui/card';
import { Table, Thead, Th, Tbody, Td } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PageLoader } from '@/components/ui/loader';

export default function AdminProducersPage() {
  const { toast } = useToast();
  const [pending, setPending] = useState<any[]>([]);
  const [all, setAll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  function loadData() {
    setLoading(true);
    Promise.all([api.producers.pending(), api.producers.list()])
      .then(([p, a]) => { setPending(p); setAll(a); })
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  async function handleValidate(id: string, name: string) {
    try {
      await api.producers.validate(id);
      toast(`${name} validé — ses produits sont maintenant visibles`, 'success');
      loadData();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  async function handleSuspend(id: string) {
    if (!confirm('Suspendre ce producteur ? Ses produits ne seront plus visibles publiquement.')) return;
    try {
      await api.producers.suspend(id);
      toast('Producteur suspendu', 'info');
      loadData();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Producteurs</h1>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-ink">En attente de validation ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="mt-3">
            <EmptyState icon={Users} title="Aucun producteur en attente" />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pending.map((producer) => (
              <Card key={producer.id}>
                <CardBody>
                  <p className="text-sm font-semibold text-ink">{producer.farmName}</p>
                  <p className="text-xs text-slate-500">{producer.address}</p>
                  <p className="mt-1 text-xs text-slate-500">{producer.user?.email}</p>
                  <p className="text-xs text-slate-400">SIRET : {producer.siret ?? 'non renseigné'}</p>
                  <Button size="sm" className="mt-3" onClick={() => handleValidate(producer.id, producer.farmName)}>
                    <CheckCircle2 size={14} />
                    Valider
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">Tous les producteurs validés ({all.length})</h2>
        <div className="mt-3">
          <Table>
            <Thead>
              <Th>Exploitation</Th>
              <Th>Email</Th>
              <Th>Statut</Th>
              <Th></Th>
            </Thead>
            <Tbody>
              {all.map((producer) => (
                <tr key={producer.id}>
                  <Td className="font-medium">{producer.farmName}</Td>
                  <Td>{producer.user?.email}</Td>
                  <Td><Badge variant="success">{producer.status}</Badge></Td>
                  <Td>
                    {producer.status === 'VALIDE' && (
                      <button onClick={() => handleSuspend(producer.id)} className="text-xs text-slate-400 hover:text-red-500">
                        Suspendre
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </section>
    </div>
  );
}
