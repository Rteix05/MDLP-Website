'use client';

import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { ArrowUp, Search, Shield, Trash2, User as UserIcon, Users } from 'lucide-react';
import { adminFetch, ApiError } from '@/lib/adminApi';
import { Button, EmptyState, PageHeader, SkeletonRows, useConfirm, useToast } from '@/components/admin/ui';

interface AdminUser {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  roles: string[];
}

type RoleFilter = 'all' | 'admin' | 'member';

/** Email de l'admin connecté, lu dans le jeton (sert à masquer les actions sur soi-même) */
function currentUserEmail(): string | null {
  const token = Cookies.get('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.username || payload.email || null;
  } catch { return null; }
}

export default function UserManagementPage() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    setMe(currentUserEmail());
    adminFetch<AdminUser[]>('/api/admin/users?limit=100')
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(e => {
        if (e instanceof ApiError && e.status === 403) router.push('/dashboard');
        else toast('error', 'Impossible de charger les utilisateurs.');
      })
      .finally(() => setLoading(false));
  }, [router, toast]);

  const isAdmin = (u: AdminUser) => u.roles?.includes('ROLE_ADMIN');
  const adminCount = users.filter(isAdmin).length;

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      if (roleFilter === 'admin' && !isAdmin(u)) return false;
      if (roleFilter === 'member' && isAdmin(u)) return false;
      if (!q) return true;
      return `${u.firstname} ${u.lastname} ${u.email}`.toLowerCase().includes(q);
    });
  }, [users, search, roleFilter]);

  const handlePromote = async (user: AdminUser) => {
    const name = `${user.firstname} ${user.lastname}`;
    if (!await confirm({ title: `Promouvoir ${name} administrateur ?`, message: 'Cette personne aura accès à tout le back-office : membres, dons, rendez-vous et contenus.', confirmLabel: 'Continuer' })) return;
    if (!await confirm({ title: 'Confirmation finale', message: `Un administrateur ne peut plus être rétrogradé ni supprimé depuis le back-office. Promouvoir ${name} ?`, confirmLabel: 'Promouvoir', danger: true })) return;

    setBusyId(user.id);
    try {
      const data = await adminFetch<{ roles: string[] }>(`/api/admin/users/${user.id}/role`, { method: 'PATCH' });
      setUsers(list => list.map(u => (u.id === user.id ? { ...u, roles: data.roles } : u)));
      toast('success', `${name} est maintenant administrateur.`);
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Erreur lors du changement de rôle.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    const name = `${user.firstname} ${user.lastname}`;
    if (!await confirm({ title: `Supprimer le compte de ${name} ?`, message: 'Cette personne ne pourra plus se connecter au site.', confirmLabel: 'Continuer', danger: true })) return;
    if (!await confirm({ title: 'Confirmation finale', message: `Cette action est irréversible. ${name} recevra un email l'informant de la suppression de son compte.`, confirmLabel: 'Supprimer définitivement', danger: true })) return;

    setBusyId(user.id);
    try {
      await adminFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      setUsers(list => list.filter(u => u.id !== user.id));
      toast('success', `Le compte de ${name} a été supprimé.`);
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Erreur lors de la suppression.');
    } finally {
      setBusyId(null);
    }
  };

  const filters: { key: RoleFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: users.length },
    { key: 'admin', label: 'Administrateurs', count: adminCount },
    { key: 'member', label: 'Fidèles', count: users.length - adminCount },
  ];

  return (
    <>
      <PageHeader title="Utilisateurs" subtitle="Les membres inscrits sur le site et leurs droits d'accès." />

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <label className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 focus-within:border-gray-900 transition">
          <Search size={16} className="text-gray-400 mr-3" />
          <span className="sr-only">Rechercher un utilisateur</span>
          <input
            type="search"
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full"
          />
        </label>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1" role="tablist" aria-label="Filtrer par rôle">
          {filters.map(f => (
            <button
              key={f.key}
              role="tab"
              aria-selected={roleFilter === f.key}
              onClick={() => setRoleFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${roleFilter === f.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {f.label} <span className="opacity-60">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <SkeletonRows rows={5} /> : visible.length === 0 ? (
        <EmptyState icon={<Users size={20} />} title="Aucun utilisateur trouvé" text={search ? 'Essayez un autre nom ou email.' : undefined} />
      ) : (
        <ul className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {visible.map(user => {
            const admin = isAdmin(user);
            const isMe = me !== null && user.email === me;
            return (
              <li key={user.id} className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${admin ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`} aria-hidden="true">
                    {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {user.firstname} {user.lastname}
                      {isMe && <span className="ml-2 text-xs font-semibold text-gray-400">(vous)</span>}
                    </p>
                    <a href={`mailto:${user.email}`} className="text-sm text-gray-500 hover:text-gray-900 truncate block">{user.email}</a>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:justify-end">
                  {admin ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-900 text-white text-xs font-bold"><Shield size={12} /> Administrateur</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold"><UserIcon size={12} /> Fidèle</span>
                  )}

                  {!admin && (
                    <>
                      <Button variant="secondary" size="sm" disabled={busyId === user.id} onClick={() => handlePromote(user)}>
                        <ArrowUp size={14} /> Promouvoir
                      </Button>
                      <Button variant="ghost" size="icon" disabled={busyId === user.id} onClick={() => handleDelete(user)}
                        className="hover:!text-red-600 hover:!bg-red-50" aria-label={`Supprimer ${user.firstname} ${user.lastname}`} title="Supprimer le compte">
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && users.length >= 100 && (
        <p className="text-center text-xs text-gray-400 mt-4">Seuls les 100 comptes les plus récents sont affichés.</p>
      )}
    </>
  );
}
