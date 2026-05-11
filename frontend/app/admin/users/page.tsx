'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Shield, User as UserIcon, ArrowDown, ArrowUp, Users } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();
  const token = Cookies.get('token');
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Décoder le JWT pour récupérer l'email de l'admin connecté
  const getCurrentUserEmail = (): string | null => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || payload.email || null;
    } catch { return null; }
  };
  const currentUserEmail = getCurrentUserEmail();

  // Charger les utilisateurs
  useEffect(() => {
    fetch(`${API}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Accès interdit');
        return res.json();
    })
    .then(data => setUsers(data))
    .catch(() => router.push('/dashboard')); // Si erreur, retour dashboard
  }, [API, router, token]);

  // Fonction Bannir
  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    await fetch(`${API}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    setUsers(users.filter(u => u.id !== id));
  };

  // Fonction Promouvoir / Rétrograder
  const handleToggleRole = async (id: number) => {
    const target = users.find(u => u.id === id);
    if (!target) return;

    const targetIsAdmin = target.roles?.includes('ROLE_ADMIN');

    // Bloquer toute rétrogradation d'admin (soi-même ou un autre)
    if (targetIsAdmin) {
      alert('Il est impossible de rétrograder un compte administrateur.');
      return;
    }

    // Double confirmation pour la promotion
    if (!targetIsAdmin) {
      const first = confirm(`Promouvoir ${target.firstname} ${target.lastname} en Admin ?`);
      if (!first) return;
      const second = confirm(`⚠️ Confirmation finale : ${target.firstname} ${target.lastname} aura accès à TOUTES les données du site. Continuer ?`);
      if (!second) return;
    }

    const res = await fetch(`${API}/api/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setUsers(users.map(u => u.id === id ? { ...u, roles: data.roles } : u));
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 lg:p-12 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        {/* ================= EN-TÊTE ================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition mb-6 md:mb-8">
                <ArrowLeft size={14} /> Retour au Dashboard
            </Link>
            <div className="flex items-center gap-3 md:gap-4 mb-2">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center text-white shadow-lg">
                    <Users size={20} />
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-none">
                    La Communauté.
                </h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mt-3">Gérez les accès, les rôles et les membres de l'église.</p>
          </div>
        </div>

        {/* ================= TABLEAU DES UTILISATEURS ================= */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 md:px-8 md:py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px] md:text-sm">Base de données ({users.length})</h3>
            </div>

            {/* Wrapper pour le scroll horizontal sur mobile */}
            <div className="overflow-x-auto w-full custom-scrollbar">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-white text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                            <th className="px-6 md:px-8 py-5 whitespace-nowrap">Utilisateur</th>
                            <th className="px-6 md:px-8 py-5 whitespace-nowrap">Email</th>
                            <th className="px-6 md:px-8 py-5 whitespace-nowrap">Niveau d'accès</th>
                            <th className="px-6 md:px-8 py-5 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs md:text-sm font-medium text-gray-600 divide-y divide-gray-50">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 md:px-8 py-16 text-center text-gray-400 text-[10px] uppercase tracking-widest">
                                    Aucun utilisateur trouvé.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => {
                                const isAdmin = user.roles?.includes('ROLE_ADMIN');
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition group">
                                        
                                        {/* NOM */}
                                        <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isAdmin ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                    {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-900 uppercase tracking-wide text-xs">
                                                    {user.firstname} {user.lastname}
                                                </span>
                                            </div>
                                        </td>

                                        {/* EMAIL */}
                                        <td className="px-6 md:px-8 py-4 text-gray-500 whitespace-nowrap">
                                            {user.email}
                                        </td>

                                        {/* RÔLE (BADGE) */}
                                        <td className="px-6 md:px-8 py-4 whitespace-nowrap">
                                            {isAdmin ? (
                                                <span className="px-3 py-1.5 bg-black text-white border border-black text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit rounded-md shadow-sm">
                                                    <Shield size={12} /> Pasteur / Admin
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit rounded-md shadow-sm">
                                                    <UserIcon size={12} /> Fidèle
                                                </span>
                                            )}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-6 md:px-8 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                
                                                {/* Bouton Rôle */}
                                                <button 
                                                    onClick={() => handleToggleRole(user.id)}
                                                    disabled={isAdmin}
                                                    title={isAdmin ? 'Impossible de rétrograder un administrateur' : ''}
                                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition border ${
                                                      isAdmin
                                                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-200 hover:text-black border-gray-100'
                                                    }`}
                                                >
                                                    {isAdmin ? (
                                                        <><ArrowDown size={14} /> Rétrograder</>
                                                    ) : (
                                                        <><ArrowUp size={14} /> Promouvoir</>
                                                    )}
                                                </button>

                                                {/* Bouton Supprimer */}
                                                <button 
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100"
                                                    title="Supprimer l'utilisateur"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </main>
  );
}