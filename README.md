# AgriMarket — Bénin

Marketplace multi-producteurs, B2C + B2B. Une commande = un seul producteur.

## Architecture

```
agri-marketplace/
├── backend/          API NestJS + Prisma + PostgreSQL
│   ├── prisma/
│   │   └── schema.prisma      ← modèle de données complet
│   └── src/
│       ├── modules/
│       │   ├── users/          inscription, profils
│       │   ├── producers/      profils producteurs + validation admin
│       │   ├── products/       catalogue, prix B2C/B2B
│       │   ├── categories/     arborescence catégories
│       │   ├── orders/         commandes, statut paiement/reversement
│       │   └── reviews/        avis producteurs (post-livraison)
│       └── prisma/             service de connexion DB partagé
│
└── frontend/         Next.js (App Router) + Tailwind
    ├── app/
    │   ├── page.tsx             accueil / catalogue
    │   └── produits/[id]/       fiche produit
    └── lib/api.ts               client API centralisé
```

## Choix techniques (rappel des décisions prises)

- **Une commande = un seul producteur** — pas de panier mixte multi-vendeurs.
- **Stock** : disponible / indisponible uniquement pour le MVP (pas de quantité précise).
- **Prix différenciés** B2C (`priceB2c`) et B2B (`priceB2b`) sur chaque produit.
- **Livraison** : retrait sur place ou livraison par le producteur (zone déclarée), pas de transporteur intégré.
- **Paiement** : encaissement via FedaPay (mobile money), **reversement manuel** aux producteurs pour le MVP — traçé via `paymentStatus` / `payoutStatus` / `payoutReference` sur `Order`.
- **Inscription producteur** : auto-inscription, statut `EN_ATTENTE` jusqu'à validation par un admin.
- **Avis** : possibles uniquement sur une commande au statut `LIVREE`.

## Démarrage

### Prérequis
- Node.js 20+
- Un compte [Neon](https://neon.tech) (base de données, gratuit)
- Un compte [Cloudflare](https://cloudflare.com) (stockage R2 + hébergement frontend, gratuit)

### Backend

```bash
cd backend
npm install
cp .env.example .env        # renseigner DATABASE_URL (Neon) et les clés R2 (Cloudflare)
npx prisma migrate dev      # crée les tables en base
npm run start:dev           # API sur http://localhost:3001/api
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # NEXT_PUBLIC_API_URL suffit — l'upload passe par le backend
npm run dev                 # site sur http://localhost:3000
```

## Authentification

Module `auth` en place : `POST /auth/login` renvoie un JWT. Les routes sensibles sont
protégées par `JwtAuthGuard` (connexion requise) et `RolesGuard` + `@Roles('ADMIN' | 'PRODUCER')`
(contrôle du rôle). Le producteur ou l'acheteur connecté est récupéré via `@CurrentUser()`.

Résumé des protections appliquées :
- `POST /producers` → connecté (n'importe quel rôle peut créer son profil producteur)
- `POST/PATCH/DELETE /products` → connecté + rôle `PRODUCER`, propriétaire du produit
- `POST /orders`, `GET /orders/mine` → connecté (acheteur)
- `GET /orders/producer/mine`, `PATCH /orders/:id/status` → connecté + rôle `PRODUCER`
- `PATCH /orders/:id/payout` → connecté + rôle `ADMIN` (reversement manuel)
- `GET /producers/pending`, `PATCH /producers/:id/validate|suspend` → connecté + rôle `ADMIN`
- `POST /reviews` → connecté (acheteur)
- `POST /uploads/presign` → connecté (génère une URL R2 signée, 5 min de validité)

## Stockage — Cloudflare R2 (upload via URL signée)

Contrairement à Supabase (clé publique + RLS), Cloudflare R2 n'a pas de mode d'upload
direct sécurisé depuis le navigateur avec une clé publique. Le flux retenu :

1. Le frontend appelle `POST /uploads/presign` (backend, authentifié) avec le type
   de fichier (`product-photos` ou `payment-proofs`) et son extension.
2. Le backend (`modules/uploads/`) génère une URL R2 signée, valable 5 minutes,
   via le SDK S3 standard (R2 est compatible S3) — les clés secrètes R2
   (`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`) ne quittent jamais le serveur.
3. Le frontend fait un `PUT` direct vers cette URL avec le fichier — l'upload ne
   transite jamais par le backend, seule l'autorisation le fait.
4. L'URL publique retournée (`R2_PUBLIC_URL/...`) est stockée comme n'importe quel
   `photoUrl`/`proofUrl`, exactement comme avant — aucun changement du modèle de
   données ni de la logique métier.

`lib/uploads.ts` (frontend) remplace l'ancien `lib/supabase.ts` avec la même
signature de fonctions (`uploadProductPhoto`, `uploadPaymentProof`) — les pages
qui les appellent n'ont pas eu à changer.

## Déploiement — Neon + Cloudflare + Render

- **Base de données** : Neon (remplace Supabase)
- **Stockage photos/preuves** : Cloudflare R2 (remplace Supabase Storage)
- **Frontend** : Cloudflare Pages, via l'adaptateur officiel `@opennextjs/cloudflare`
  — avantage sur Render : **pas de mise en veille après inactivité**
- **Backend** : reste sur **Render**. NestJS s'appuie sur un serveur Node.js
  classique (Express/Fastify) ; Cloudflare Workers tourne dans un environnement
  V8 allégé sans adaptateur officiel pour NestJS — migrer le backend serait une
  réécriture risquée, pas un simple changement d'hébergeur. Le compromis Render
  (mise en veille après 15 min d'inactivité) reste donc accepté côté API.

### 1. Créer le projet Neon
1. [neon.tech](https://neon.tech) → nouveau projet
2. Dashboard du projet → `Connection Details` → copier la chaîne "Pooled connection"
   → c'est ta `DATABASE_URL`

### 2. Créer le bucket Cloudflare R2
1. Dashboard Cloudflare → `R2` → créer un bucket, ex: `agri-marketplace-media`
2. Activer l'accès public (domaine `r2.dev` fourni par Cloudflare, ou domaine personnalisé)
   → c'est ta `R2_PUBLIC_URL`
3. `R2 > Manage API Tokens > Create API Token` → récupérer `R2_ACCESS_KEY_ID` et
   `R2_SECRET_ACCESS_KEY`
4. `R2_ACCOUNT_ID` se trouve dans l'URL du dashboard Cloudflare (ou `R2 > Overview`)

### 3. Déployer le backend sur Render
1. Pousser ce repo sur GitHub/GitLab
2. Sur [render.com](https://render.com) → "New +" → "Blueprint" → pointer vers le repo
   (`render.yaml` à la racine configure le service backend automatiquement)
3. Renseigner manuellement dans le dashboard Render les variables marquées
   `sync: false` : `DATABASE_URL` (Neon), les 3 clés R2, clés FedaPay, `FRONTEND_URL`

### 4. Déployer le frontend sur Cloudflare Pages
1. Dashboard Cloudflare → `Workers & Pages` → "Create" → connecter le repo Git,
   dossier `frontend/`
2. Build command : `npm run pages:build` — output : `.open-next/assets`
   (déjà configuré dans `wrangler.toml` et `open-next.config.ts`)
3. Renseigner `NEXT_PUBLIC_API_URL` avec l'URL Render de l'API dans les variables
   de build Cloudflare Pages
4. Une fois déployé, copier l'URL Cloudflare Pages dans `FRONTEND_URL` côté Render

### 5. Créer le premier compte admin
Le script `npm run seed` (voir plus bas) doit être lancé une fois, en local, avec la
`DATABASE_URL` de Neon dans `.env` — pas besoin d'accès shell sur Render.

## Paiement — bon de paiement par référence (mobile money manuel)

Plutôt qu'une intégration API automatisée (FedaPay, MoMo API...), le MVP utilise un
système de **paiement par référence avec confirmation manuelle**, choisi pour éviter
les frais de commission PSP et la validation d'un compte marchand :

1. À la validation du panier, une commande est créée avec une **référence unique**
   (`paymentReference`, ex: `PAY-M3X9K2`) et `paymentStatus: EN_ATTENTE`.
2. L'acheteur est redirigé vers `/commandes/:id/paiement` — le **bon de paiement** :
   montant à payer, référence à indiquer, et les numéros de dépôt actifs de la
   plateforme (MTN, Moov, Celtiis — gérés dans `/admin/comptes-paiement`).
3. L'acheteur fait le transfert lui-même depuis son téléphone, puis uploade une
   capture d'écran de confirmation (stockée sur Cloudflare R2, préfixe `payment-proofs/`).
4. Un admin vérifie la preuve contre le relevé mobile money réel de la plateforme
   dans `/admin/paiements`, puis clique "Confirmer le paiement"
   (`paymentStatus → PAYE`, horodaté dans `paymentConfirmedAt`).
5. **Règle de sécurité appliquée côté backend** : un producteur ne peut pas faire
   passer une commande à `CONFIRMEE` tant que `paymentStatus !== PAYE` — impossible
   de préparer une commande non payée.

**Compromis assumé** : pas de frais de commission, mais confirmation manuelle
(délai de quelques heures typiquement) au lieu d'une confirmation automatique en
temps réel. Adapté à un volume de commandes faible à modéré ; à réévaluer si le
volume rend la vérification manuelle trop lourde pour l'équipe.

**Note sécurité** : le bucket R2 a un accès public en **lecture** (nécessaire pour
que les photos/preuves s'affichent dans l'app), mais l'**écriture** est protégée —
seule une URL signée générée par le backend authentifié permet d'uploader (voir
section "Stockage — Cloudflare R2" ci-dessus). Les noms de fichiers étant des UUID
aléatoires, une preuve de paiement n'est pas devinable sans connaître son URL exacte,
mais un bucket entièrement privé avec URLs signées aussi en lecture serait plus
rigoureux avant une montée en charge importante.

## Ce qui reste à construire (prochaines étapes)

1. **Automatisation du paiement (optionnel, plus tard)** — si le volume de commandes
   rend la confirmation manuelle trop lourde, migrer vers FedaPay ou l'API MoMo directe
   pour une confirmation automatique par webhook. Le champ `paymentReference` et le
   statut `paymentStatus` sont déjà en place et compatibles avec cette évolution.
2. **Témoignages homepage** — actuellement des exemples statiques illustratifs dans
   `components/home/home-client.tsx` (`TESTIMONIALS`). À remplacer par de vrais avis
   avant mise en production — des témoignages fictifs présentés comme réels seraient
   trompeurs pour les visiteurs.

## Design system

Interface entièrement repensée en style premium (inspiration Apple / Airbnb / Stripe /
Linear / Vercel), **sans aucune modification de la logique métier, des appels API, ou
du backend** — uniquement la couche présentation.

- **`tailwind.config.js`** — tokens de marque : `forest` (#1B5E20), `brand` (#4CAF50),
  `action` (#F59E0B, réservé aux CTA), `surface` (#F8FAFC), `ink` (#334155) ; radius
  16-20px ; ombres discrètes (`shadow-subtle/card/elevated`) ; animations
  (`fade-in`, `slide-up`, `slide-in-right`).
- **Police** : Inter, chargée via `next/font/google` dans `app/layout.tsx`.
- **`components/ui/`** — librairie de composants réutilisables : `Button` (variants
  primary/secondary/outline/ghost/danger), `Card`, `Badge`, `Input`/`Textarea`/`Select`,
  `Modal`, `EmptyState`, `PageLoader`/`InlineLoader`/`SkeletonCard`, `StatCard`,
  `Pagination`, `Table`.
- **`lib/toast-context.tsx`** — notifications toast globales (succès/erreur/info),
  purement présentation, ne modifie aucun flux de données.
- **`components/layout/dashboard-shell.tsx`** — shell SaaS réutilisé par
  `/espace-producteur` et `/admin` : sidebar responsive, header avec recherche/
  notifications/profil, badges de compteur sur les liens de navigation.
- **`components/home/home-client.tsx`** — homepage premium complète : hero, recherche
  live (filtre côté client sur les données déjà publiques, aucun nouvel endpoint),
  chiffres clés, catégories, produits vedettes, producteurs vérifiés, récemment
  ajoutés, comment ça fonctionne, témoignages, CTA final.
- **Graphique** : `recharts` ajouté pour le dashboard admin (répartition des actions
  en attente) — lecture agrégée des données déjà chargées, aucune nouvelle requête.

**Toutes les pages existantes ont été réhabillées** avec ces composants : login,
inscription, catalogue, fiche produit, paniers, bon de paiement, avis, historique
commandes, et l'ensemble des pages producteur/admin — sans changement de comportement,
de route, ou de structure de données.

## Images du hero (carrousel homepage)

Le hero de la homepage peut afficher un carrousel de photos en fond (champs,
récoltes, tracteurs, produits...). Par défaut, aucune image n'est configurée —
le hero garde son dégradé de couleur actuel.

**Pour l'activer :**

1. Télécharge 5-6 photos libres de droits, usage commercial autorisé, sans
   attribution requise — [unsplash.com](https://unsplash.com) ou
   [pexels.com](https://pexels.com), recherche "agriculture", "farm field",
   "tractor", "harvest"
2. Uploade-les sur ton bucket R2 (`agri-marketplace-media`), par exemple dans
   un dossier `hero/` — glisser-déposer directement dans le dashboard Cloudflare,
   onglet "Objets" du bucket
3. Récupère l'URL publique de chaque image (`R2_PUBLIC_URL/hero/nom-fichier.jpg`)
4. Colle ces URLs dans le tableau `HERO_IMAGES` en haut de
   `frontend/components/home/hero-carousel.tsx`

Le carrousel change d'image toutes les 5 secondes, avec un fondu et des
indicateurs de position cliquables en bas du hero. Le texte reste lisible
grâce à un voile sombre semi-transparent appliqué automatiquement par-dessus
les photos.

**Pourquoi pas un service externe d'images aléatoires** : l'option la plus
simple (Unsplash Source) a été définitivement fermée en 2024. Héberger tes
propres photos sur R2 (déjà en place pour les photos produits) évite toute
dépendance à un service tiers qui pourrait changer ou disparaître, et clarifie
les droits d'usage.

## Créer le premier compte admin

Aucune interface ne permet de créer un compte `ADMIN` — c'est volontaire, pour qu'un
admin ne puisse jamais être créé depuis le formulaire d'inscription public.

```bash
cd backend
ADMIN_EMAIL="ton-email@example.com" ADMIN_PASSWORD="un-mot-de-passe-solide" npm run seed
```

Connecte-toi ensuite sur `/login` avec ces identifiants pour accéder à `/admin`.

## Frontend — ce qui est fait

- **`lib/auth-context.tsx`** — contexte React global : session persistée (token + user),
  `login()`, `logout()`. Le token est envoyé automatiquement par `lib/api.ts` sur chaque
  requête protégée.
- **`components/auth/protected-route.tsx`** — bloque l'accès à une page si non connecté
  ou si le rôle ne correspond pas (`requiredRole="PRODUCER"` par ex.).
- **`/login`** et **`/inscription`** — l'inscription crée le compte `User`, connecte
  automatiquement, puis crée le profil `Producer` si le rôle choisi est producteur
  (statut `EN_ATTENTE` jusqu'à validation admin, conforme à la règle définie).
- **`/espace-producteur`** — protégé, réservé au rôle `PRODUCER` :
  - Dashboard (compteurs produits/commandes)
  - `/produits` — liste des produits du producteur, avec archivage
  - `/produits/nouveau` — formulaire de création (prix B2C/B2B, unité)
  - `/commandes` — commandes reçues, avec changement de statut contraint
    (`EN_ATTENTE → CONFIRMEE → EXPEDIEE → LIVREE`, ou `ANNULEE`)
- **`/admin`** — protégé, réservé au rôle `ADMIN` :
  - Dashboard (compteurs producteurs en attente / reversements à faire)
  - `/producteurs` — valide ou suspend les profils producteurs (`EN_ATTENTE → VALIDE`)
  - `/reversements` — liste les commandes payées non reversées, avec saisie de la
    référence du virement manuel pour tracer chaque reversement

### Parcours acheteur

- **`lib/cart-context.tsx`** — système **multi-paniers** : un acheteur peut avoir
  plusieurs paniers actifs en parallèle, y compris plusieurs paniers chez le
  **même** producteur (utile pour préparer deux commandes séparées, ex: livraisons
  à des dates différentes). La règle "un producteur par commande" s'applique à
  l'intérieur de chaque panier individuellement, plus au niveau global. Chaque
  panier a un `label` renommable et se valide indépendamment des autres.
- **`AddToCartButton`** — résout le bon prix (B2C/B2B) selon le profil connecté, et
  propose un sélecteur pour choisir le panier cible s'il en existe déjà un ou
  plusieurs chez ce producteur ("+ Nouveau panier" sinon).
- **`/panier`** — liste tous les paniers de l'acheteur sous forme de cartes
  indépendantes ; chacune a son propre choix de livraison (limité aux options du
  producteur concerné) et son propre bouton de validation. Valider un panier ne
  supprime que celui-ci — les autres restent intacts.
- **Côté backend** : aucune contrainte d'unicité `(buyerId, producerId)` sur `Order`
  — rien n'empêche un acheteur d'avoir plusieurs commandes actives chez le même
  producteur, ce qui est cohérent avec le système multi-paniers frontend.
- **`/commandes`** — historique des commandes de l'acheteur, avec lien vers l'avis
  une fois la commande au statut `LIVREE`.
- **`/commandes/:id/avis`** — formulaire de notation du producteur (1-5 + commentaire).
- **`components/layout/nav.tsx`** — navigation globale : compteur de paniers et
  d'articles en temps réel, liens contextuels selon le rôle connecté.

## Sécurité — points corrigés pendant le développement

En connectant l'espace admin, plusieurs endpoints exposaient par erreur le mot de passe
hashé des utilisateurs dans leurs réponses (`include: { user: true }` / `buyer: true`
ramène TOUS les champs du modèle Prisma, y compris `password`). Corrigé partout via
`select` explicite ne renvoyant que `id`, `email`, `phone`. Point de vigilance à garder :
**ne jamais utiliser `include: { user: true }` telle quelle** — toujours `select` les
champs nécessaires.

## Notes

- Les DTOs utilisent `class-validator` : toute requête mal formée est rejetée automatiquement.
- Le schéma Prisma est la source de vérité du modèle de données — toute évolution
  du modèle métier doit d'abord être reflétée là.
