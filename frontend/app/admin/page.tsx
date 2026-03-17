'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Check, X, Clock, Users, BookOpen, CreditCard, ArrowLeft, ChevronRight } from 'lucide-react';

interface Appointment {
  id: number;
  subject: string;
  date: string;
  status: string;
  message: string;
  pastor: string;
  user: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  };
}

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const router = useRouter();
  const token = Cookies.get('token');
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const fetchAppointments = () => {
    fetch(`${API}/api/admin/appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 403) throw new Error("Accès refusé");
      return res.json();
    })
    .then(data => { if (Array.isArray(data)) setAppointments(data); })
    .catch(() => router.push('/dashboard'));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    await fetch(`${API}/api/admin/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ status: newStatus })
    });
    fetchAppointments();
  };

  const pending = appointments.filter(a => a.status === 'PENDING');
  const handled = appointments.filter(a => a.status !== 'PENDING');

  const navItems = [
    { label: 'Utilisateurs', icon: <Users size={18} />, path: '/admin/users', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Cours', icon: <BookOpen size={18} />, path: '/admin/courses', color: 'bg-amber-600 hover:bg-amber-700' },
    { label: 'Paiements', icon: <CreditCard size={18} />, path: '/admin/payments', color: 'bg-green-600 hover:bg-green-700' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">🛡️ Administration</h1>
            <p className="text-gray-500 text-sm mt-1">Espace Pasteur — Gestion de l'église</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
            <ArrowLeft size={16} /> Mon tableau de bord
          </button>
        </div>

        {/* NAVIGATION RAPIDE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`${item.color} text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* RDV EN ATTENTE */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Clock size={14} /> En attente
            </div>
            <span className="text-2xl font-black">{pending.length}</span>
            <span className="text-gray-400 text-sm font-medium">rendez-vous à traiter</span>
          </div>

          {pending.length > 0 ? (
            <div className="space-y-3">
              {pending.map(rdv => (
                <div key={rdv.id} className="bg-white rounded-xl border-l-4 border-yellow-400 shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4">
                  
                  {/* Infos */}
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg text-gray-900">{rdv.subject}</h3>
                      {rdv.pastor && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                          avec {rdv.pastor}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                      <span>👤 {rdv.user.firstname} {rdv.user.lastname}</span>
                      <span>📅 {new Date(rdv.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      {rdv.user.phone && <span>📞 {rdv.user.phone}</span>}
                    </div>
                    {rdv.message && (
                      <p className="text-sm text-gray-400 italic truncate">💬 &quot;{rdv.message}&quot;</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(rdv.id, 'CONFIRMED')}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition"
                    >
                      <Check size={14} /> Valider
                    </button>
                    <button
                      onClick={() => updateStatus(rdv.id, 'CANCELLED')}
                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition"
                    >
                      <X size={14} /> Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Aucun rendez-vous en attente 🎉</p>
            </div>
          )}
        </section>

        {/* RDV TRAITÉS (résumé) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">Rendez-vous traités</h2>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xs font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1 transition uppercase tracking-wider"
            >
              Voir tout <ChevronRight size={14} />
            </button>
          </div>

          {handled.length > 0 ? (
            <div className="space-y-2">
              {handled.slice(0, 5).map(rdv => (
                <div key={rdv.id} className="bg-white rounded-lg border border-gray-100 p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="font-semibold text-gray-800">{rdv.user.firstname} {rdv.user.lastname}</span>
                    <span className="text-gray-400 mx-2">—</span>
                    <span className="text-gray-500 text-sm">{rdv.subject}</span>
                  </div>
                  <span className={`shrink-0 text-xs px-3 py-1 rounded-full font-bold ${
                    rdv.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {rdv.status === 'CONFIRMED' ? '✅ Validé' : '❌ Refusé'}
                  </span>
                </div>
              ))}
              {handled.length > 5 && (
                <p className="text-center text-xs text-gray-400 pt-2">+ {handled.length - 5} autres rendez-vous</p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucun rendez-vous traité.</p>
          )}
        </section>

      </div>
    </main>
  );
}