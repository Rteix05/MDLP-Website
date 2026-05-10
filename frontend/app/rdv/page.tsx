'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function AppointmentPage() {
  const [subject, setSubject] = useState('Entretien pastoral');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Vérification de sécurité : si pas connecté, on vire
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation date future
    const now = new Date();
    const selectedDate = new Date(date);
    if (!date || selectedDate <= now) {
      alert('Veuillez choisir une date future pour le rendez-vous.');
      setLoading(false);
      return;
    }

    const token = Cookies.get('token');

    try {
      const res = await fetch(`${API}/api/appointments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // On montre patte blanche
        },
        body: JSON.stringify({ 
          subject, 
          date, 
          message 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la demande');
      }

      alert('✅ Votre demande de RDV a été envoyée au pasteur !');
      router.push('/dashboard'); // Retour au tableau de bord

    } catch (err: any) {
      alert('❌ Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-black flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg border-t-4 border-blue-600">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-900">Prendre Rendez-vous</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Sélection du Sujet */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Motif du RDV</label>
            <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border p-2 rounded bg-white text-black"
            >
              <option value="Entretien pastoral">Entretien pastoral</option>
              <option value="Mariage">Mariage</option>
              <option value="Baptême">Baptême</option>
              <option value="Visite malade">Visite malade</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Date et Heure */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Date et Heure souhaitées</label>
            <input 
              type="datetime-local" 
              required
              className="w-full border p-2 rounded text-black"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Message optionnel */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Message (Optionnel)</label>
            <textarea 
              rows={4}
              placeholder="Détails supplémentaires..."
              className="w-full border p-2 rounded text-black"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`mt-4 w-full text-white p-3 rounded font-bold transition ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
          </button>
          
          <button 
            type="button"
            onClick={() => router.back()}
            className="text-center text-sm text-gray-500 hover:underline"
          >
            Annuler et retour
          </button>
        </form>
      </div>
    </main>
  );
}