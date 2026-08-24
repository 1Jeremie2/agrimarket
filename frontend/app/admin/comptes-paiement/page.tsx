'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Landmark, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { Card, CardBody } from '@/components/ui/card';
import { Table, Thead, Th, Tbody, Td } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/loader';

const OPERATORS = ['MTN', 'MOOV', 'CELTIIS'];

export default function PlatformAccountsPage() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [operator, setOperator] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadAccounts(); }, []);

  function loadAccounts() {
    setLoading(true);
    api.platformAccounts.listAll().then(setAccounts).finally(() => setLoading(false));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.platformAccounts.create({ operator, phoneNumber, accountName });
      setPhoneNumber('');
      setAccountName('');
      toast('Numéro ajouté', 'success');
      loadAccounts();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleToggle(account: any) {
    if (account.active) await api.platformAccounts.deactivate(account.id);
    else await api.platformAccounts.activate(account.id);
    loadAccounts();
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Numéros de dépôt</h1>
      <p className="mt-1 text-sm text-slate-500">Ces numéros s'affichent aux acheteurs sur le bon de paiement.</p>

      <Card className="mt-6">
        <CardBody>
          <p className="text-sm font-semibold text-ink">Ajouter un numéro</p>
          <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select label="Opérateur" value={operator} onChange={(e) => setOperator(e.target.value)}>
              {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
            </Select>
            <Input label="Numéro" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            <Input label="Titulaire du compte" value={accountName} onChange={(e) => setAccountName(e.target.value)} required />
            <div className="sm:col-span-3">
              {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
              <Button type="submit" size="sm">
                <Plus size={15} />
                Ajouter
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="mt-6">
        <Table>
          <Thead>
            <Th>Opérateur</Th>
            <Th>Numéro</Th>
            <Th>Titulaire</Th>
            <Th>Statut</Th>
            <Th></Th>
          </Thead>
          <Tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <Td className="font-medium">{account.operator}</Td>
                <Td>{account.phoneNumber}</Td>
                <Td>{account.accountName}</Td>
                <Td><Badge variant={account.active ? 'success' : 'neutral'}>{account.active ? 'Actif' : 'Désactivé'}</Badge></Td>
                <Td>
                  <button onClick={() => handleToggle(account)} className="text-xs font-medium text-forest hover:underline">
                    {account.active ? 'Désactiver' : 'Réactiver'}
                  </button>
                </Td>
              </tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
