'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BarChart3, CalendarClock, CreditCard, LayoutDashboard, Menu, Users, X } from 'lucide-react';
import { adminFetch } from '@/lib/adminApi';
import { AdminProviders } from './ui';
import DisplayPreferences from '../DisplayPreferences';

/* Nombre de rendez-vous en attente, partagé entre le menu et les pages */
const PendingContext = createContext<{ pending: number; refreshPending: () => void }>({ pending: 0, refreshPending: () => {} });
export const usePending = () => useContext(PendingContext);

const NAV = [
  { section: null, items: [
    { href: '/admin', label: "Vue d'ensemble", icon: LayoutDashboard, badge: true },
    { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
  ] },
  { section: 'Membres & dons', items: [
    { href: '/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/admin/payments', label: 'Dons', icon: CreditCard },
  ] },
];

function Sidebar({ pending, onNavigate }: { pending: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-white/10">
        <p className="text-2xl font-black tracking-tighter text-white">MDLP.</p>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold mt-0.5">Administration</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6" aria-label="Menu d'administration">
        {NAV.map((group, i) => (
          <div key={i}>
            {group.section && <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/50">{group.section}</p>}
            <ul className="space-y-1">
              {group.items.map(item => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                        active ? 'bg-white text-gray-900' : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="flex-1">{item.label}</span>
                      {'badge' in item && item.badge && pending > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-gold text-black text-[11px] font-black flex items-center justify-center" title={`${pending} rendez-vous en attente`}>
                          {pending}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white transition">
          <CalendarClock size={18} /> Mon espace
        </Link>
        <Link href="/" onClick={onNavigate} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white transition">
          <ArrowLeft size={18} /> Retour au site
        </Link>
        <div className="flex items-center gap-3 px-1.5 pt-1">
          <DisplayPreferences panel="above" buttonClassName="text-gold hover:bg-white/10" />
          <span className="text-sm font-semibold text-white/75">Affichage</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const refreshPending = useCallback(() => {
    adminFetch<{ status: string }[]>('/api/admin/appointments')
      .then(list => setPending(Array.isArray(list) ? list.filter(a => a.status === 'PENDING').length : 0))
      .catch(() => {});
  }, []);

  useEffect(() => { refreshPending(); }, [refreshPending]);

  return (
    <AdminProviders>
      <PendingContext.Provider value={{ pending, refreshPending }}>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          {/* Menu fixe sur grand écran */}
          <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-gray-950">
            <Sidebar pending={pending} />
          </aside>

          {/* Barre du haut + tiroir sur mobile */}
          <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-gray-950 px-4 h-14">
            <p className="text-lg font-black tracking-tighter text-white">MDLP. <span className="text-xs font-bold uppercase tracking-widest text-gold ml-1">Admin</span></p>
            <div className="flex items-center gap-1">
            <DisplayPreferences buttonClassName="text-gold hover:bg-white/10" />
            <button onClick={() => setMobileOpen(true)} className="relative p-2 text-white" aria-label="Ouvrir le menu">
              <Menu size={22} />
              {pending > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold" />}
            </button>
            </div>
          </div>
          {mobileOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
              <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-gray-950">
                <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-4 p-1 text-white/60 hover:text-white" aria-label="Fermer le menu">
                  <X size={20} />
                </button>
                <Sidebar pending={pending} onNavigate={() => setMobileOpen(false)} />
              </aside>
            </div>
          )}

          <main className="lg:pl-64">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">{children}</div>
          </main>
        </div>
      </PendingContext.Provider>
    </AdminProviders>
  );
}
