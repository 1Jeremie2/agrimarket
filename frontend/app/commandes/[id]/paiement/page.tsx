'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Smartphone, CheckCircle2, Upload, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { uploadPaymentProof } from '@/lib/uploads';
import { useAuth } from '@/lib/auth-context';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/loader';

const OPERATOR_LABELS: Record<string, string> = {
  MTN: 'MTN Mobile Money',
  MOOV: 'Moov Money',
  CELTIIS: 'Celtiis Cash',
};

export default function PaymentVoucherPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    Promise.all([api.orders.get(orderId), api.platformAccounts.listActive()])
      .then(([o, a]) => {
        setOrder(o);
        setAccounts(a);
        setUploaded(!!o.paymentProofUrl);
      })
      .catch((err) => setError(err.message ?? 'Impossible de charger cette commande'));
  }, [orderId, user, authLoading, router]);

  async function handleUploadProof() {
    if (!proofFile) return setError('Choisis une capture d\'écran de ta confirmation de transfert.');
    setError(null);
    setUploading(true);
    try {
      const proofUrl = await uploadPaymentProof(proofFile);
      await api.orders.attachPaymentProof(orderId, proofUrl);
      setUploaded(true);
    } catch (err: any) {
      setError(err.message ?? 'Échec de l\'envoi de la preuve');
    } finally {
      setUploading(false);
    }
  }

  if (authLoading || (!user && !error)) return <PageLoader />;
  if (error) {
    return (
      <div className="container-app max-w-2xl py-10 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }
  if (!order) return <PageLoader />;

  return (
    <div className="container-app max-w-2xl py-10">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-forest">
          <Smartphone size={22} />
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-ink">Bon de paiement</h1>
        <p className="mt-1 text-sm text-slate-500">
          Commande #{order.id.slice(0, 8)} · <span className="font-semibold text-forest">{order.totalAmount} FCFA</span>
        </p>
      </div>

      <Card className="mt-8">
        <CardBody>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Référence de paiement</p>
          <p className="mt-1 rounded-xl bg-surface px-4 py-3 text-center text-lg font-semibold tracking-wide text-forest">
            {order.paymentReference}
          </p>
          <p className="mt-2 text-xs text-slate-500">Indique impérativement cette référence dans le libellé de ton transfert.</p>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Numéros de dépôt</p>
          <ul className="mt-3 space-y-2">
            {accounts.map((account) => (
              <li key={account.id} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
                <span className="text-sm font-medium text-ink">{OPERATOR_LABELS[account.operator]}</span>
                <span className="text-sm text-slate-600">{account.phoneNumber} — {account.accountName}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Étapes à suivre</p>
          <ol className="mt-3 space-y-2.5 text-sm text-slate-600">
            {[
              `Effectue le transfert de ${order.totalAmount} FCFA vers l'un des numéros ci-dessus.`,
              `Indique la référence ${order.paymentReference} dans le libellé.`,
              'Prends une capture d\'écran de la confirmation du transfert.',
              'Envoie-la ci-dessous pour vérification.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-semibold text-forest">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody>
          {uploaded ? (
            <div className="flex items-center gap-3 text-forest">
              <CheckCircle2 size={20} />
              <p className="text-sm font-medium">
                Preuve envoyée — ta commande sera confirmée sous quelques heures après vérification.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-ink">Capture d'écran de la confirmation</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                className="mt-2 w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-light file:px-3 file:py-2 file:text-sm file:font-medium file:text-forest"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <Button onClick={handleUploadProof} loading={uploading} className="mt-4">
                <Upload size={15} />
                Envoyer la preuve de paiement
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <a href="/commandes" className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-forest hover:underline">
        Voir toutes mes commandes
        <ArrowRight size={14} />
      </a>
    </div>
  );
}
