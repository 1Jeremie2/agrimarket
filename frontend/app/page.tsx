import { api } from '@/lib/api';
import { HomeClient } from '@/components/home/home-client';

// Empêche Next.js de figer cette page en HTML statique au moment du build.
// La homepage affiche des données live (catalogue, images hero gérées par
// l'admin) — elle doit toujours être régénérée à chaque visite, jamais mise
// en cache indéfiniment.
export const dynamic = 'force-dynamic';

// Page d'accueil : récupère catalogue, producteurs, catégories et images du
// hero (données publiques), puis délègue l'affichage + la recherche live
// au composant client.
export default async function HomePage() {
  const [products, producers, categories, heroImages] = await Promise.all([
    api.products.list().catch(() => []),
    api.producers.list().catch(() => []),
    api.categories.list().catch(() => []),
    api.heroImages.listActive().catch(() => []),
  ]);

  return (
    <HomeClient products={products} producers={producers} categories={categories} heroImages={heroImages} />
  );
}
