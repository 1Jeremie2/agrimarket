'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, Bell, Menu, X, LogOut, ChevronDown, ExternalLink, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};

type DashboardShellProps = {
  navItems: DashboardNavItem[];
  brandLabel: string;
  children: ReactNode;
};

export function DashboardShell({ navItems, brandLabel, children }: DashboardShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-100 bg-white lg:flex">
        <Link href="/" className="flex h-16 items-center gap-2 border-b border-slate-100 px-6 hover:bg-surface">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest text-white">
            <Sprout size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink leading-none">{brandLabel}</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-forest text-white' : 'text-ink hover:bg-surface'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} className={active ? 'text-white' : 'text-slate-400'} />
                  {item.label}
                </span>
                {!!item.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? 'bg-white/20 text-white' : 'bg-action/10 text-action'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-surface hover:text-ink"
          >
            <LogOut size={17} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-white animate-slide-in-right">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
              <span className="text-sm font-semibold text-ink">{brandLabel}</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      pathname === item.href ? 'bg-forest text-white' : 'text-ink hover:bg-surface'
                    }`}
                  >
                    <Icon size={17} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Contenu principal */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="hidden flex-1 max-w-md lg:block" />

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-surface hover:text-ink sm:flex"
            >
              <ExternalLink size={15} />
              Voir le site
            </Link>

            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-surface">
              <Bell size={18} />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-surface"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="hidden text-sm font-medium text-ink sm:inline">{user?.email}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-elevated animate-fade-in">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-ink truncate">{user?.email}</p>
                    <p className="text-xs text-slate-400">{user?.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-surface"
                  >
                    <LogOut size={15} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
