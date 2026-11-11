'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Euro, Eye, HandHeart, Monitor, Smartphone, Tablet, UserPlus, Users } from 'lucide-react';
import { adminFetch, ApiError } from '@/lib/adminApi';
import { EmptyState, PageHeader, SkeletonRows, useToast } from '@/components/admin/ui';

interface Kpi { value: number; previous: number }
interface Stats {
  days: number;
  periods: number[];
  from: string;
  to: string;
  kpis: Record<'visitors' | 'views' | 'signups' | 'donations' | 'revenue' | 'appointments', Kpi>;
  chart: { label: string; views: number; visitors: number; signups: number }[];
  chartMax: number;
  pages: { path: string; title: string; views: number; visitors: number }[];
  sources: { source: string | null; visits: number }[];
  devices: Record<string, number>;
}

const SITE_URL = 'https://www.samuelpanzutv.com';
const nf = (n: number) => n.toLocaleString('fr-FR');
const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const frDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const periodLabel = (d: number) => (d === 365 ? '1 an' : `${d} jours`);

/** Évolution par rapport à la période précédente de même durée */
function Evolution({ kpi }: { kpi: Kpi }) {
  if (kpi.previous === 0) {
    return <span className="text-xs text-gray-400">{kpi.value > 0 ? 'nouveau sur la période' : 'aucune donnée avant'}</span>;
  }
  const diff = Math.round(((kpi.value - kpi.previous) / kpi.previous) * 100);
  const tone = diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-600' : 'text-gray-500';
  return (
    <span className={`text-xs font-bold ${tone}`}>
      {diff > 0 ? '+' : ''}{diff} % <span className="font-medium text-gray-400">vs période précédente</span>
    </span>
  );
}

function KpiCard({ label, value, kpi, icon }: { label: string; value: string; kpi: Kpi; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        <span className="w-8 h-8 rounded-lg bg-gray-100 text-black flex items-center justify-center">{icon}</span>
        <p className="text-[11px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-3xl font-black text-gray-900 tabular-nums">{value}</p>
      <Evolution kpi={kpi} />
    </div>
  );
}

function Share({ label, value, total, icon }: { label: string; value: number; total: number; icon?: React.ReactNode }) {
  const share = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <li>
      <div className="flex items-center justify-between gap-3 text-sm mb-1">
        <span className="flex items-center gap-2 min-w-0 font-semibold text-gray-800 truncate">{icon}{label}</span>
        <span className="text-gray-500 tabular-nums shrink-0">{nf(value)} · {share} %</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden" aria-hidden="true">
        <div className="h-full rounded-full bg-black" style={{ width: `${share}%` }} />
      </div>
    </li>
  );
}

const deviceIcons: Record<string, React.ReactNode> = {
  ordinateur: <Monitor size={15} />,
  mobile: <Smartphone size={15} />,
  tablette: <Tablet size={15} />,
};

export default function AdminStatisticsPage() {
  const router = useRouter();
  const toast = useToast();
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminFetch<Stats>(`/api/admin/stats/site?periode=${days}`)
      .then(data => { if (!cancelled) setStats(data); })
      .catch(e => {
        if (e instanceof ApiError && e.status === 403) router.push('/dashboard');
        else toast('error', 'Impossible de charger les statistiques.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days, router, toast]);

  const changePeriod = (d: number) => { setLoading(true); setDays(d); };

  const deviceTotal = stats ? Object.values(stats.devices).reduce((a, b) => a + b, 0) : 0;
  const sourceTotal = stats ? stats.sources.reduce((a, s) => a + s.visits, 0) : 0;
  const labelEvery = stats ? Math.max(1, Math.ceil(stats.chart.length / 8)) : 1;

  return (
    <>
      <PageHeader
        title="Statistiques"
        subtitle={stats ? `Du ${frDate(stats.from)} au ${frDate(stats.to)}` : 'Fréquentation du site, inscriptions, dons et rendez-vous.'}
        actions={
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1" role="tablist" aria-label="Période">
            {[7, 30, 90, 365].map(p => (
              <button key={p} role="tab" aria-selected={days === p} onClick={() => changePeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${days === p ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                {periodLabel(p)}
              </button>
            ))}
          </div>
        }
      />

      {!stats ? <SkeletonRows rows={4} /> : (
        <div className={`space-y-8 transition-opacity ${loading ? 'opacity-50' : ''}`}>
          {/* CHIFFRES CLÉS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" aria-label="Chiffres clés">
            <KpiCard label="Visiteurs" value={nf(stats.kpis.visitors.value)} kpi={stats.kpis.visitors} icon={<Users size={16} />} />
            <KpiCard label="Pages vues" value={nf(stats.kpis.views.value)} kpi={stats.kpis.views} icon={<Eye size={16} />} />
            <KpiCard label="Inscriptions" value={nf(stats.kpis.signups.value)} kpi={stats.kpis.signups} icon={<UserPlus size={16} />} />
            <KpiCard label="Dons" value={nf(stats.kpis.donations.value)} kpi={stats.kpis.donations} icon={<HandHeart size={16} />} />
            <KpiCard label="Montant des dons" value={euros(stats.kpis.revenue.value)} kpi={stats.kpis.revenue} icon={<Euro size={16} />} />
            <KpiCard label="Rendez-vous" value={nf(stats.kpis.appointments.value)} kpi={stats.kpis.appointments} icon={<CalendarCheck size={16} />} />
          </section>

          {/* GRAPHIQUE */}
          <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6" aria-labelledby="chart-title">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 id="chart-title" className="font-black text-gray-900">Fréquentation sur {periodLabel(stats.days)}</h2>
              <div className="flex gap-4 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-black/25" /> Pages vues</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-black" /> Visiteurs</span>
              </div>
            </div>
            {stats.kpis.views.value === 0 ? (
              <p className="text-sm text-gray-500 py-10 text-center">Aucune visite enregistrée sur cette période. La mesure démarre avec la version 1.1 du site.</p>
            ) : (
              <>
                <div className="flex items-end gap-[2px] sm:gap-1 h-48" role="img"
                  aria-label={`Graphique : ${nf(stats.kpis.visitors.value)} visiteurs et ${nf(stats.kpis.views.value)} pages vues sur la période`}>
                  {stats.chart.map(bar => (
                    <div key={bar.label} className="group relative flex-1 h-full flex items-end">
                      <div className="relative w-full bg-black/25 rounded-t-sm" style={{ height: `${(bar.views / stats.chartMax) * 100}%` }}>
                        <div className="absolute bottom-0 inset-x-0 bg-black rounded-t-sm" style={{ height: bar.views > 0 ? `${(bar.visitors / bar.views) * 100}%` : 0 }} />
                      </div>
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap rounded-lg bg-gray-900 text-white text-xs px-3 py-2 z-10 shadow-lg">
                        <p className="font-bold">{bar.label}</p>
                        <p>{nf(bar.visitors)} visiteur{bar.visitors > 1 ? 's' : ''} · {nf(bar.views)} page{bar.views > 1 ? 's' : ''} vue{bar.views > 1 ? 's' : ''}</p>
                        {bar.signups > 0 && <p>{nf(bar.signups)} inscription{bar.signups > 1 ? 's' : ''}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-[2px] sm:gap-1 mt-2" aria-hidden="true">
                  {stats.chart.map((bar, i) => (
                    <span key={bar.label} className="flex-1 text-[10px] text-gray-400 text-center truncate">{i % labelEvery === 0 ? bar.label : ''}</span>
                  ))}
                </div>
              </>
            )}
          </section>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
            {/* PAGES LES PLUS VUES */}
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6" aria-labelledby="pages-title">
              <h2 id="pages-title" className="font-black text-gray-900 mb-4">Pages les plus consultées</h2>
              {stats.pages.length === 0 ? <EmptyState title="Aucune page vue sur la période" /> : (
                <table className="w-full text-sm">
                  <thead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    <tr>
                      <th scope="col" className="text-left py-2">Page</th>
                      <th scope="col" className="text-right py-2">Visiteurs</th>
                      <th scope="col" className="text-right py-2">Vues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.pages.map(page => (
                      <tr key={page.path}>
                        <td className="py-2.5 pr-3">
                          <a href={`${SITE_URL}${page.path}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 hover:underline">{page.title}</a>
                          {page.title !== page.path && <p className="text-xs text-gray-400">{page.path}</p>}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-gray-600">{nf(page.visitors)}</td>
                        <td className="py-2.5 text-right tabular-nums font-bold text-gray-900">{nf(page.views)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <div className="space-y-6">
              {/* PROVENANCE */}
              <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6" aria-labelledby="sources-title">
                <h2 id="sources-title" className="font-black text-gray-900 mb-4">Provenance des visites</h2>
                {stats.sources.length === 0 ? <p className="text-sm text-gray-500">Aucune visite sur la période.</p> : (
                  <ul className="space-y-3">
                    {stats.sources.map(s => (
                      <Share key={s.source ?? 'direct'} label={s.source ?? 'Accès direct ou favori'} value={s.visits} total={sourceTotal} />
                    ))}
                  </ul>
                )}
              </section>

              {/* APPAREILS */}
              <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6" aria-labelledby="devices-title">
                <h2 id="devices-title" className="font-black text-gray-900 mb-4">Appareils</h2>
                {deviceTotal === 0 ? <p className="text-sm text-gray-500">Aucune visite sur la période.</p> : (
                  <ul className="space-y-3">
                    {Object.entries(stats.devices).map(([device, n]) => (
                      <Share key={device} label={device.charAt(0).toUpperCase() + device.slice(1)} value={n} total={deviceTotal} icon={deviceIcons[device]} />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Mesure d&apos;audience interne, sans cookie : un visiteur est compté une fois par jour, son adresse IP n&apos;est jamais
            enregistrée et les données sont supprimées au bout de 13 mois. Les pages du back-office ne sont pas comptées.
            Les inscriptions ne sont comptées que pour les comptes créés depuis la version 1.1.
          </p>
        </div>
      )}
    </>
  );
}
