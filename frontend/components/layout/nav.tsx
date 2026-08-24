'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, Sprout, User, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';

export function Nav() {
  const { user, logout } = useAuth();
  const { totalItemsAcrossCarts, carts } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Le dashboard (producteur/admin) a sa propre navigation latérale — on masque la nav publique
  const isDashboard = pathname?.startsWith('/espace-producteur') || pathname?.startsWith('/admin');
  if (isDashboard) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-forest">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest text-white">
            <Sprout size={18} />
          </span>
          <span className="hidden sm:inline">AgriMarket</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-surface">
            Catalogue
          </Link>
          <Link href="/panier" className="relative rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-surface">
            <span className="inline-flex items-center gap-1.5">
              <ShoppingCart size={16} />
              Paniers
            </span>
            {carts.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-action px-1 text-[11px] font-semibold text-white">
                {totalItemsAcrossCarts}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {user.role === 'BUYER' && (
                <Link href="/commandes" className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-surface">
                  Mes commandes
                </Link>
              )}
              {user.role === 'PRODUCER' && (
                <Link href="/espace-producteur" className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-surface">
                  Mon espace
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-surface">
                  Administration
                </Link>
              )}
              <button
                onClick={logout}
                className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-surface hover:text-ink"
              >
                <LogOut size={15} />
                Déconnexion
              </button>
            </>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-surface">
                Connexion
              </Link>
              <Link href="/inscription">
                <Button size="sm">Créer un compte</Button>
              </Link>
            </div>
          )}
        </nav>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            <Link href="/" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface">
              Catalogue
            </Link>
            <Link href="/panier" className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface">
              Mes paniers {carts.length > 0 && `(${totalItemsAcrossCarts})`}
            </Link>
            {user ? (
              <>
                {user.role === 'BUYER' && <Link href="/commandes" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface">Mes commandes</Link>}
                {user.role === 'PRODUCER' && <Link href="/espace-producteur" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface">Mon espace</Link>}
                {user.role === 'ADMIN' && <Link href="/admin" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface">Administration</Link>}
                <button onClick={logout} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-500 hover:bg-surface">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface">Connexion</Link>
                <Link href="/inscription" className="rounded-lg px-3 py-2.5 text-sm font-medium text-forest">Créer un compte</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
