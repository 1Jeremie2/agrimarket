'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, CreditCard, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardBody } from '@/components/ui/card';
import { PageLoader } from '@/components/ui/loader';

export default function AdminDashboard() {
  const [pendingProducers, setPendingProducers] = useState<any[]>([]);
  const [awaitingPayment, setAwaitingPayment] = useState<any[]>([]);
  const [awaitingPayout, setAwaitingPayout] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.producers.pending(),
      api.orders.awaitingPaymentConfirmation(),
      api.orders.awaitingPayout(),
    ])
      .then(([pending, payments, payouts]) => {
        setPendingProducers(pending);
        setAwaitingPayment(payments);
        setAwaitingPayout(payouts);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  // Vue synthétique — aucune donnée métier ajoutée, juste une lecture agrégée
  // des files d'attente déjà chargées.
  const chartData = [
    { name: 'Producteurs', valeur: pendingProducers.length },
    { name: 'Paiements', valeur: awaitingPayment.length },
    { name: 'Reversements', valeur: awaitingPayout.length },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Tableau de bord admin</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/producteurs">
          <StatCard icon={Users} label="Producteurs en attente" value={pendingProducers.length} accent="brand" />
        </Link>
        <Link href="/admin/paiements">
          <StatCard icon={CreditCard} label="Paiements à confirmer" value={awaitingPayment.length} accent="action" />
        </Link>
        <Link href="/admin/reversements">
          <StatCard icon={Wallet} label="Commandes à reverser" value={awaitingPayout.length} accent="forest" />
        </Link>
      </div>

      <Card className="mt-6">
        <CardBody>
          <p className="text-sm font-semibold text-ink">Actions en attente</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                <Bar dataKey="valeur" fill="#4CAF50" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
