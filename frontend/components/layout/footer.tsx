'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sprout, Facebook, Instagram, Mail } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/espace-producteur') || pathname?.startsWith('/admin');
  if (isDashboard) return null;

  return (
    <footer className="mt-24 border-t border-slate-100 bg-surface">
      <div className="container-app py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-forest">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest text-white">
                <Sprout size={18} />
              </span>
              AgriMarket
            </Link>
            <p className="mt-3 text-sm text-slate-500">
              Le lien direct entre les producteurs béninois et celles et ceux qui les soutiennent.
            </p>
            <div className="mt-4 flex gap-3 text-slate-400">
              <Facebook size={18} className="hover:text-forest cursor-pointer" />
              <Instagram size={18} className="hover:text-forest cursor-pointer" />
              <Mail size={18} className="hover:text-forest cursor-pointer" />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Acheter</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="/" className="hover:text-forest">Catalogue</Link></li>
              <li><Link href="/panier" className="hover:text-forest">Mes paniers</Link></li>
              <li><Link href="/inscription" className="hover:text-forest">Créer un compte</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Vendre</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="/inscription" className="hover:text-forest">Devenir producteur</Link></li>
              <li><Link href="/login" className="hover:text-forest">Mon espace</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">À propos</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><span className="cursor-default">Comment ça marche</span></li>
              <li><span className="cursor-default">Producteurs vérifiés</span></li>
              <li><span className="cursor-default">Contact</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} AgriMarket. Fait avec soin au Bénin.</p>
          <p>Paiement sécurisé par référence mobile money</p>
        </div>
      </div>
    </footer>
  );
}
