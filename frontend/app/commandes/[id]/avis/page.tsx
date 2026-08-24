'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/loader';

export default function LeaveReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const orderId = params.id as string;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.push('/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return <PageLoader />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.reviews.create({ orderId, rating, comment });
      router.push('/commandes');
    } catch (err: any) {
      setError(err.message ?? 'Impossible d\'enregistrer cet avis');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-app max-w-md py-14">
      <h1 className="text-center text-xl font-semibold text-ink">Comment s'est passée ta commande ?</h1>
      <p className="mt-1 text-center text-sm text-slate-500">Ton avis aide les autres acheteurs à faire confiance.</p>

      <Card className="mt-8">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                >
                  <Star
                    size={30}
                    className={(hoverRating || rating) >= n ? 'text-action' : 'text-slate-200'}
                    fill="currentColor"
                  />
                </button>
              ))}
            </div>

            <Textarea
              label="Commentaire (optionnel)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partage ton expérience avec ce producteur…"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={submitting} className="w-full">
              Envoyer l'avis
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
