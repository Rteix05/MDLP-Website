'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// Créneaux disponibles : 14h00 → 17h30, toutes les 30 min
const TIME_SLOTS = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

function isWeekday(dateStr: string): boolean {
  const day = new Date(dateStr + 'T12:00:00').getDay(); // midi pour éviter timezone
  return day >= 1 && day <= 5;
}

function toLocalDatetimeString(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}`;
}

function getMinDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export default function AppointmentPage() {
  const [subject, setSubject] = useState('Entretien pastoral');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) router.push('/');
  }, [router]);

  // Charger les créneaux déjà pris
  useEffect(() => {
    fetch(`${API}/api/appointments/blocked-slots`)
      .then(r => r.json())
      .then(data => setBlockedSlots(data))
      .catch(() => {});
  }, [API]);

  const isSlotBlocked = (time: string): boolean => {
    if (!selectedDate) return false;
    const dt = `${selectedDate} ${time}`;
    return blockedSlots.includes(dt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      alert('Veuillez choisir une date et un créneau horaire.');
      return;
    }
    if (!isWeekday(selectedDate)) {
      alert('Les rendez-vous sont uniquement disponibles du Lundi au Vendredi.');
      return;
    }

    setLoading(true);
    const token = Cookies.get('token');
    const fullDate = toLocalDatetimeString(selectedDate, selectedTime);

    try {
      const res = await fetch(`${API}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, date: fullDate, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la demande');

      alert('✅ Votre demande de RDV a été envoyée !');
      router.push('/dashboard');
    } catch (err: any) {
      alert('❌ Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-black flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg border-t-4 border-blue-600">
        <h1 className="text-2xl font-bold mb-2 text-center text-blue-900">Prendre Rendez-vous</h1>
        <p className="text-center text-sm text-gray-400 mb-6">Lundi – Vendredi · 14h00 – 18h00 · Créneaux de 30 min</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Motif */}
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

          {/* Sélection du jour */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Jour (Lun – Ven)</label>
            <input
              type="date"
              required
              min={getMinDate()}
              className="w-full border p-2 rounded text-black"
              value={selectedDate}
              onChange={(e) => {
                const val = e.target.value;
                if (val && !isWeekday(val)) {
                  alert('Veuillez choisir un jour en semaine (Lundi – Vendredi).');
                  setSelectedDate('');
                } else {
                  setSelectedDate(val);
                  setSelectedTime('');
                }
              }}
            />
          </div>

          {/* Créneaux horaires */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Créneau horaire</label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(time => {
                  const blocked = isSlotBlocked(time);
                  const selected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={blocked}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded text-sm font-bold border transition ${
                        blocked
                          ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                          : selected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Message (Optionnel)</label>
            <textarea
              rows={3}
              placeholder="Détails supplémentaires..."
              className="w-full border p-2 rounded text-black"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedTime}
            className={`mt-2 w-full text-white p-3 rounded font-bold transition ${
              loading || !selectedTime ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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