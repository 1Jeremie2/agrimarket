'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sprout, User, Tractor } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardBody } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<'BUYER' | 'PRODUCER'>('BUYER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [farmName, setFarmName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.users.register({ email, password, phone, role });
      await login(email, password);
      if (role === 'PRODUCER') {
        await api.producers.create({ farmName });
        router.push('/espace-producteur');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message ?? 'Inscription impossible');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-white">
            <Sprout size={22} />
          </span>
          <h1 className="mt-4 text-xl font-semibold text-ink">Créer un compte</h1>
          <p className="mt-1 text-sm text-slate-500">Rejoins la marketplace en quelques secondes</p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('BUYER')}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition-colors ${
                    role === 'BUYER' ? 'border-forest bg-brand-light text-forest' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <User size={18} />
                  Acheteur
                </button>
                <button
                  type="button"
                  onClick={() => setRole('PRODUCER')}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition-colors ${
                    role === 'PRODUCER' ? 'border-forest bg-brand-light text-forest' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <Tractor size={18} />
                  Producteur
                </button>
              </div>

              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Mot de passe" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Input label="Téléphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

              {role === 'PRODUCER' && (
                <Input
                  label="Nom de l'exploitation"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  required
                />
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={submitting} className="w-full">
                Créer mon compte
              </Button>
            </form>
          </CardBody>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-medium text-forest hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
