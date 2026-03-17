'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, User as UserIcon, Search, CalendarDays, TrendingUp } from 'lucide-react';
import Loader from '@/components/Loader';

interface PaymentUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface Payment {
  id: number;
  amount: number;
  date: string;
  transactionId: string | null;
  user: PaymentUser | null;
}

interface PeriodStats {
  total: number;
  count: number;
  avg: number;
}

const months = [
  { value: '', label: 'Tous les mois' },
  { value: '1', label: 'Janvier' }, { value: '2', label: 'Février' }, { value: '3', label: 'Mars' },
  { value: '4', label: 'Avril' }, { value: '5', label: 'Mai' }, { value: '6', label: 'Juin' },
  { value: '7', label: 'Juillet' }, { value: '8', label: 'Août' }, { value: '9', label: 'Septembre' },
  { value: '10', label: 'Octobre' }, { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' },
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [filteredRevenue, setFilteredRevenue] = useState(0);
  const [stats, setStats] = useState<{ week: PeriodStats; month: PeriodStats; year: PeriodStats }>({
    week: { total: 0, count: 0, avg: 0 },
    month: { total: 0, count: 0, avg: 0 },
    year: { total: 0, count: 0, avg: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const limit = 50;
  const router = useRouter();
  const token = Cookies.get('token');
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Générer les années disponibles (2024 → année courante)
  const currentYear = new Date().getFullYear();
  const years = [{ value: '', label: 'Toutes les années' }];
  for (let y = currentYear; y >= 2024; y--) {
    years.push({ value: String(y), label: String(y) });
  }

  useEffect(() => {
    if (!token) { router.push('/login'); return; }

    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filterMonth) params.set('month', filterMonth);
    if (filterYear) params.set('year', filterYear);

    setLoading(true);
    fetch(`${API}/api/payment/admin/all?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Accès interdit');
      return res.json();
    })
    .then(data => {
      setPayments(data.payments);
      setTotal(data.total);
      setFilteredRevenue(data.filteredRevenue);
      setStats(data.stats);
    })
    .catch(() => router.push('/dashboard'))
    .finally(() => setLoading(false));
  }, [page, filterMonth, filterYear]);

  // Reset page quand filtre change
  const handleMonthChange = (v: string) => { setFilterMonth(v); setPage(1); };
  const handleYearChange = (v: string) => { setFilterYear(v); setPage(1); };

  const totalPages = Math.ceil(total / limit);

  const filtered = payments.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = p.user ? `${p.user.firstname} ${p.user.lastname}`.toLowerCase() : '';
    const email = p.user?.email?.toLowerCase() || '';
    const txId = p.transactionId?.toLowerCase() || '';
    return name.includes(q) || email.includes(q) || txId.includes(q) || String(p.amount).includes(q);
  });

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans text-gray-900">
      {loading && <Loader />}
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">💳 Gestion des Paiements</h1>
            <p className="text-gray-500 text-sm mt-1">Liste complète des dons reçus</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
            <ArrowLeft size={16} /> Mon tableau de bord
          </button>
        </div>

        {/* STATS MOYENNES PAR PÉRIODE */}
        <div className="mb-8">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <TrendingUp size={14} /> Statistiques par période
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cette semaine</p>
              <p className="text-2xl font-black text-gray-900">{stats.week.total.toFixed(2)} €</p>
              <p className="text-xs text-gray-400 mt-1">{stats.week.count} don{stats.week.count > 1 ? 's' : ''} · moy. {stats.week.avg.toFixed(2)} €</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ce mois</p>
              <p className="text-2xl font-black text-gray-900">{stats.month.total.toFixed(2)} €</p>
              <p className="text-xs text-gray-400 mt-1">{stats.month.count} don{stats.month.count > 1 ? 's' : ''} · moy. {stats.month.avg.toFixed(2)} €</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cette année</p>
              <p className="text-2xl font-black text-gray-900">{stats.year.total.toFixed(2)} €</p>
              <p className="text-xs text-gray-400 mt-1">{stats.year.count} don{stats.year.count > 1 ? 's' : ''} · moy. {stats.year.avg.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* RÉSUMÉ FILTRÉ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dons (filtre actif)</p>
            <p className="text-3xl font-black text-gray-900">{total}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Revenus (filtre actif)</p>
            <p className="text-3xl font-black text-gray-900">{filteredRevenue.toFixed(2)} €</p>
          </div>
        </div>

        {/* FILTRES + SEARCH */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 flex-1 focus-within:border-gray-900 transition">
            <Search size={16} className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, transaction..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterMonth}
              onChange={e => handleMonthChange(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:border-gray-900 outline-none transition cursor-pointer"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select
              value={filterYear}
              onChange={e => handleYearChange(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:border-gray-900 outline-none transition cursor-pointer"
            >
              {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Donateur</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Montant</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length > 0 ? filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserIcon size={14} className="text-gray-400" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {p.user ? `${p.user.firstname} ${p.user.lastname}` : 'Anonyme'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.user?.email || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-gray-900">{p.amount.toFixed(2)} €</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {p.transactionId ? p.transactionId.substring(0, 20) + '...' : '—'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm font-bold uppercase tracking-widest">
                      Aucun paiement trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:border-black transition"
            >
              Précédent
            </button>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:border-black transition"
            >
              Suivant
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
