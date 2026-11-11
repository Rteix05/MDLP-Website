'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, CalendarClock, Check, Clock, Euro, Mail, MessageSquare, Phone, Users, X } from 'lucide-react';
import { adminFetch, ApiError } from '@/lib/adminApi';
import { usePending } from '@/components/admin/AdminShell';
import { Button, EmptyState, PageHeader, SkeletonRows, StatCard, useConfirm, useToast } from '@/components/admin/ui';

interface Appointment {
  id: number;
  subject: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  message: string;
  pastor: string;
  user: { firstname: string; lastname: string; email: string; phone: string } | null;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

function Person({ rdv }: { rdv: Appointment }) {
  if (!rdv.user) return <span className="text-gray-400">Compte supprimé</span>;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
      <span className="font-semibold text-gray-900">{rdv.user.firstname} {rdv.user.lastname}</span>
      <a href={`mailto:${rdv.user.email}`} className="inline-flex items-center gap-1 hover:text-gray-900"><Mail size={14} /> {rdv.user.email}</a>
      {rdv.user.phone && <a href={`tel:${rdv.user.phone}`} className="inline-flex items-center gap-1 hover:text-gray-900"><Phone size={14} /> {rdv.user.phone}</a>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { refreshPending } = usePending();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<{ userCount: number; totalRevenue: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, s] = await Promise.all([
        adminFetch<Appointment[]>('/api/admin/appointments'),
        adminFetch<{ userCount: number; totalRevenue: number }>('/api/admin/stats'),
      ]);
      setAppointments(Array.isArray(list) ? list : []);
      setStats(s);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) router.push('/dashboard');
      else toast('error', 'Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (rdv: Appointment, status: 'CONFIRMED' | 'CANCELLED') => {
    if (status === 'CANCELLED') {
      const ok = await confirm({
        title: 'Refuser ce rendez-vous ?',
        message: `${rdv.user?.firstname ?? 'La personne'} recevra un email l'informant que sa demande du ${formatDate(rdv.date)} est refusée.`,
        confirmLabel: 'Refuser',
        danger: true,
      });
      if (!ok) return;
    }
    setBusyId(rdv.id);
    try {
      await adminFetch(`/api/admin/appointments/${rdv.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setAppointments(list => list.map(a => (a.id === rdv.id ? { ...a, status } : a)));
      refreshPending();
      toast('success', status === 'CONFIRMED' ? 'Rendez-vous confirmé, un email a été envoyé.' : 'Rendez-vous refusé, un email a été envoyé.');
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Erreur lors de la mise à jour.');
    } finally {
      setBusyId(null);
    }
  };

  const now = Date.now();
  const pending = appointments.filter(a => a.status === 'PENDING').sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const upcoming = appointments.filter(a => a.status === 'CONFIRMED' && +new Date(a.date) >= now).sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const history = appointments.filter(a => a.status !== 'PENDING' && !(a.status === 'CONFIRMED' && +new Date(a.date) >= now));

  return (
    <>
      <PageHeader title="Vue d'ensemble" subtitle="Rendez-vous, membres et dons de l'église en un coup d'œil." />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10" aria-label="Chiffres clés">
        <StatCard label="En attente" value={pending.length} hint="demandes à traiter" icon={<Clock size={20} />} tone="amber" loading={loading} />
        <StatCard label="À venir" value={upcoming.length} hint="rendez-vous confirmés" icon={<CalendarCheck size={20} />} tone="green" loading={loading} />
        <StatCard label="Membres" value={stats?.userCount ?? 0} hint="comptes inscrits" icon={<Users size={20} />} tone="blue" loading={loading} />
        <StatCard label="Dons reçus" value={euros(stats?.totalRevenue ?? 0)} hint="depuis l'ouverture" icon={<Euro size={20} />} loading={loading} />
      </section>

      {/* DEMANDES EN ATTENTE */}
      <section className="mb-10" aria-labelledby="pending-title">
        <h2 id="pending-title" className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          Demandes à traiter
          {pending.length > 0 && <span className="text-xs font-black bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">{pending.length}</span>}
        </h2>

        {loading ? <SkeletonRows rows={2} /> : pending.length === 0 ? (
          <EmptyState icon={<Check size={20} />} title="Aucune demande en attente" text="Les nouvelles demandes de rendez-vous apparaîtront ici." />
        ) : (
          <ul className="space-y-3">
            {pending.map(rdv => (
              <li key={rdv.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-900">{rdv.subject}</h3>
                    {rdv.pastor && rdv.pastor !== 'Non spécifié' && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">avec {rdv.pastor}</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-amber-700 flex items-center gap-1.5 first-letter:uppercase">
                    <CalendarClock size={15} /> {formatDate(rdv.date)}
                  </p>
                  <Person rdv={rdv} />
                  {rdv.message && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 flex gap-2 whitespace-pre-line">
                      <MessageSquare size={15} className="shrink-0 mt-0.5 text-gray-400" /> {rdv.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="success" disabled={busyId === rdv.id} onClick={() => updateStatus(rdv, 'CONFIRMED')}>
                    <Check size={16} /> Confirmer
                  </Button>
                  <Button variant="danger-soft" disabled={busyId === rdv.id} onClick={() => updateStatus(rdv, 'CANCELLED')}>
                    <X size={16} /> Refuser
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* À VENIR */}
      <section className="mb-10" aria-labelledby="upcoming-title">
        <h2 id="upcoming-title" className="text-lg font-black text-gray-900 mb-4">Rendez-vous à venir</h2>
        {loading ? <SkeletonRows rows={2} /> : upcoming.length === 0 ? (
          <EmptyState icon={<CalendarCheck size={20} />} title="Aucun rendez-vous confirmé à venir" />
        ) : (
          <ul className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {upcoming.map(rdv => (
              <li key={rdv.id} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <p className="text-sm font-bold text-gray-900 sm:w-56 shrink-0 first-letter:uppercase">{formatDate(rdv.date)}</p>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 mb-1">{rdv.subject}</p>
                  <Person rdv={rdv} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* HISTORIQUE */}
      {!loading && history.length > 0 && (
        <section aria-labelledby="history-title">
          <h2 id="history-title" className="text-lg font-black text-gray-900 mb-4">Historique</h2>
          <ul className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {history.slice(0, 10).map(rdv => (
              <li key={rdv.id} className="px-5 py-3 flex items-center justify-between gap-4 text-sm">
                <div className="min-w-0 truncate">
                  <span className="font-semibold text-gray-800">{rdv.user ? `${rdv.user.firstname} ${rdv.user.lastname}` : 'Compte supprimé'}</span>
                  <span className="text-gray-400"> · {rdv.subject} · {new Date(rdv.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-bold ${
                  rdv.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                }`}>
                  {rdv.status === 'CONFIRMED' ? 'Effectué' : 'Refusé'}
                </span>
              </li>
            ))}
          </ul>
          {history.length > 10 && <p className="text-center text-xs text-gray-400 mt-3">+ {history.length - 10} autres rendez-vous plus anciens</p>}
        </section>
      )}
    </>
  );
}
