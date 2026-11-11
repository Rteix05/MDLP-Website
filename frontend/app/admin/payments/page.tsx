'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight, CreditCard, Download, Filter, Search, TrendingUp } from 'lucide-react';
import { adminFetch, API, ApiError } from '@/lib/adminApi';
import Cookies from 'js-cookie';
import { Button, EmptyState, PageHeader, SkeletonRows, StatCard, useToast } from '@/components/admin/ui';

interface Payment {
  id: number;
  amount: number;
  date: string;
  transactionId: string | null;
  user: { id: number; firstname: string; lastname: string; email: string } | null;
}
interface PeriodStats { total: number; count: number; avg: number }
interface PaymentsResponse {
  payments: Payment[];
  total: number;
  filteredRevenue: number;
  stats: { week: PeriodStats; month: PeriodStats; year: PeriodStats };
}

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const LIMIT = 50;
const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const countLabel = (s: PeriodStats) => `${s.count} don${s.count > 1 ? 's' : ''} · moyenne ${euros(s.avg)}`;

export default function AdminPaymentsPage() {
  const router = useRouter();
  const toast = useToast();

  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => String(currentYear - i));

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (month) params.set('month', month);
    if (year) params.set('year', year);
    setLoading(true);
    adminFetch<PaymentsResponse>(`/api/payment/admin/all?${params}`)
      .then(setData)
      .catch(e => {
        if (e instanceof ApiError && e.status === 403) router.push('/dashboard');
        else toast('error', 'Impossible de charger les dons.');
      })
      .finally(() => setLoading(false));
  }, [page, month, year, router, toast]);

  const payments = useMemo(() => data?.payments ?? [], [data]);
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / LIMIT));
  const filterActive = Boolean(month || year);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter(p => {
      const name = p.user ? `${p.user.firstname} ${p.user.lastname} ${p.user.email}` : 'anonyme';
      return `${name} ${p.transactionId ?? ''} ${p.amount}`.toLowerCase().includes(q);
    });
  }, [payments, search]);

  const downloadReceipt = async (p: Payment) => {
    try {
      const res = await fetch(`${API}/api/invoice/${p.id}`, { headers: { Authorization: `Bearer ${Cookies.get('token')}` } });
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `recu-don-${p.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast('error', 'Impossible de télécharger le reçu.');
    }
  };

  const selectClass = 'bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 focus:border-gray-900 outline-none cursor-pointer';

  return (
    <>
      <PageHeader title="Dons" subtitle="Tous les dons reçus par carte et PayPal." />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" aria-label="Dons par période">
        <StatCard label="Cette semaine" value={euros(data?.stats.week.total ?? 0)} hint={data ? countLabel(data.stats.week) : undefined} icon={<CalendarDays size={20} />} tone="green" loading={!data} />
        <StatCard label="Ce mois-ci" value={euros(data?.stats.month.total ?? 0)} hint={data ? countLabel(data.stats.month) : undefined} icon={<CalendarRange size={20} />} tone="blue" loading={!data} />
        <StatCard label="Cette année" value={euros(data?.stats.year.total ?? 0)} hint={data ? countLabel(data.stats.year) : undefined} icon={<TrendingUp size={20} />} loading={!data} />
      </section>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <label className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 focus-within:border-gray-900 transition">
          <Search size={16} className="text-gray-400 mr-3" />
          <span className="sr-only">Rechercher un don</span>
          <input type="search" placeholder="Rechercher par nom, email, transaction…" value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent outline-none text-sm w-full" />
        </label>
        <div className="flex gap-2">
          <select aria-label="Mois" value={month} onChange={e => { setMonth(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">Tous les mois</option>
            {MONTHS.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}
          </select>
          <select aria-label="Année" value={year} onChange={e => { setYear(e.target.value); setPage(1); }} className={selectClass}>
            <option value="">Toutes les années</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {data && (
        <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
          {filterActive && <Filter size={14} />}
          <span><strong className="text-gray-900">{data.total}</strong> don{data.total > 1 ? 's' : ''} {filterActive ? 'sur la période' : 'au total'} · <strong className="text-gray-900">{euros(data.filteredRevenue)}</strong></span>
          {filterActive && <button onClick={() => { setMonth(''); setYear(''); setPage(1); }} className="text-gray-900 font-semibold underline underline-offset-2">Effacer les filtres</button>}
        </p>
      )}

      {loading && !data ? <SkeletonRows rows={5} /> : visible.length === 0 ? (
        <EmptyState icon={<CreditCard size={20} />} title="Aucun don trouvé" text={search || filterActive ? 'Modifiez la recherche ou les filtres.' : undefined} />
      ) : (
        <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden transition-opacity ${loading ? 'opacity-50' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3">Donateur</th>
                  <th scope="col" className="px-5 py-3 text-right">Montant</th>
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3">Transaction</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Reçu</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/80">
                    <td className="px-5 py-3.5">
                      {p.user ? (
                        <>
                          <p className="font-bold text-gray-900">{p.user.firstname} {p.user.lastname}</p>
                          <p className="text-xs text-gray-500">{p.user.email}</p>
                        </>
                      ) : <p className="font-semibold text-gray-500">Don anonyme</p>}
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-gray-900 tabular-nums whitespace-nowrap">{euros(p.amount)}</td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md" title={p.transactionId ?? undefined}>
                        {p.transactionId ? `${p.transactionId.slice(0, 18)}…` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="ghost" size="sm" onClick={() => downloadReceipt(p)} title="Télécharger le reçu fiscal">
                        <Download size={14} /> Reçu
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex justify-center items-center gap-3 mt-6" aria-label="Pagination">
          <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1 || loading}><ChevronLeft size={14} /> Précédent</Button>
          <span className="text-sm font-semibold text-gray-500">Page {page} / {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages || loading}>Suivant <ChevronRight size={14} /></Button>
        </nav>
      )}
    </>
  );
}
