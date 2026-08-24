'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search, Truck, Wallet, ArrowRight, Sprout, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/produit/product-card';
import { ProducerCard } from '@/components/producer/producer-card';
import { EmptyState } from '@/components/ui/empty-state';
import { HeroCarousel } from './hero-carousel';

type HomeClientProps = {
  products: any[];
  producers: any[];
  categories: any[];
  heroImages: { id: string; imageUrl: string; altText?: string }[];
};

const HOW_IT_WORKS = [
  { icon: Search, title: 'Explorez le catalogue', desc: 'Parcourez les produits frais publiés par des producteurs vérifiés partout au Bénin.' },
  { icon: Wallet, title: 'Commandez en confiance', desc: 'Ajoutez au panier, choisissez la livraison, payez simplement par mobile money.' },
  { icon: Truck, title: 'Recevez ou retirez', desc: 'Le producteur confirme et vous livre, ou vous récupérez directement sur place.' },
];

const TESTIMONIALS = [
  { name: 'Fatima A.', role: 'Restauratrice à Cotonou', quote: 'Je commande mes légumes chaque semaine directement chez les producteurs. Fraîcheur garantie et je paie facilement en mobile money.' },
  { name: 'Serge K.', role: 'Producteur d\'ananas à Allada', quote: 'Depuis que je vends sur la plateforme, je touche des clients que je n\'aurais jamais atteints seul.' },
  { name: 'Grace M.', role: 'Particulière à Porto-Novo', quote: 'Les prix sont clairs, les producteurs sont vérifiés, je me sens en confiance à chaque commande.' },
];

export function HomeClient({ products, producers, categories, heroImages }: HomeClientProps) {
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.producer?.farmName?.toLowerCase().includes(q),
    );
  }, [products, query]);

  const featured = filteredProducts.slice(0, 4);
  const recent = [...filteredProducts].reverse().slice(0, 4);
  const verifiedProducers = producers.slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-light/60 to-white">
        <div className="container-app relative overflow-hidden rounded-2xl py-20 sm:py-28">
          <HeroCarousel images={heroImages} />
          <div className="mx-auto max-w-2xl text-center animate-slide-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-forest shadow-subtle">
              <Sprout size={13} />
              Producteurs vérifiés · Bénin
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              <span className="text-forest">Des produits agricoles frais,</span>{' '}
              directement du producteur
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Achetez en toute confiance auprès de producteurs vérifiés partout au Bénin —
              particuliers et professionnels bienvenus.
            </p>

            {/* Barre de recherche intelligente */}
            <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-elevated">
              <Search size={18} className="ml-2 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un produit, un producteur…"
                className="w-full border-none bg-transparent px-1 py-2 text-sm text-ink placeholder:text-slate-400 focus:outline-none"
              />
              <Button size="md" className="shrink-0">
                Rechercher
              </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <Link href="/inscription">
                <Button variant="secondary" size="md">
                  Devenir producteur
                  <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section className="border-y border-slate-100 bg-white">
        <div className="container-app grid grid-cols-3 divide-x divide-slate-100 py-8">
          <div className="text-center">
            <p className="text-2xl font-semibold text-forest sm:text-3xl">{producers.length}</p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Producteurs vérifiés</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-forest sm:text-3xl">{products.length}</p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Produits disponibles</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-forest sm:text-3xl">{categories.length || '—'}</p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Catégories</p>
          </div>
        </div>
      </section>

      {/* CATÉGORIES */}
      {categories.length > 0 && (
        <section className="container-app py-16">
          <h2 className="text-xl font-semibold text-ink">Catégories</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-forest hover:text-forest"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* PRODUITS VEDETTES */}
      <section className="container-app py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">Produits vedettes</h2>
        </div>
        {featured.length === 0 ? (
          <div className="mt-6">
            <EmptyState icon={Package} title="Aucun produit trouvé" description="Essayez une autre recherche, ou revenez bientôt." />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* PRODUCTEURS VÉRIFIÉS */}
      {verifiedProducers.length > 0 && (
        <section className="bg-surface py-16">
          <div className="container-app">
            <h2 className="text-xl font-semibold text-ink">Producteurs vérifiés</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {verifiedProducers.map((prod) => (
                <ProducerCard key={prod.id} producer={prod} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RÉCEMMENT AJOUTÉS */}
      {recent.length > 0 && (
        <section className="container-app py-16">
          <h2 className="text-xl font-semibold text-ink">Récemment ajoutés</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recent.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* COMMENT ÇA FONCTIONNE */}
      <section className="bg-forest py-20">
        <div className="container-app">
          <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">Comment ça fonctionne</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="text-center text-white">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <step.icon size={22} />
                </div>
                <p className="mt-4 font-semibold">{step.title}</p>
                <p className="mt-2 text-sm text-white/70">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="container-app py-20">
        <h2 className="text-center text-xl font-semibold text-ink sm:text-2xl">Ils nous font confiance</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <p className="text-sm text-slate-600">« {t.quote} »</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-forest">
                  {t.name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container-app pb-20">
        <div className="rounded-2xl bg-brand-light px-6 py-12 text-center sm:px-12">
          <h2 className="text-xl font-semibold text-forest sm:text-2xl">Vous êtes producteur ?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-forest/80">
            Rejoignez la plateforme et vendez vos produits directement à des particuliers et professionnels.
          </p>
          <Link href="/inscription" className="mt-6 inline-block">
            <Button size="lg">
              Créer mon compte producteur
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
