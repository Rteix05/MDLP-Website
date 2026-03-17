'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          firstname, 
          lastname, 
          phone 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Succès
      router.push('/login'); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 font-sans text-gray-900 flex flex-col">
      
      {/* ================= NAVBAR (Identique aux autres pages) ================= */}
      <Navbar theme="dark" />

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-grow flex items-center justify-center p-4 pt-24">
        
        <div className="bg-white rounded-[30px] shadow-2xl overflow-hidden flex w-full max-w-5xl min-h-[600px] border border-gray-800 animate-in fade-in zoom-in duration-500">
        
          {/* === PARTIE GAUCHE (Formulaire) === */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            
            <div className="mb-8">
                <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition mb-6">
                    <ArrowLeft size={14} /> Retour Accueil
                </Link>
                <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Créer un compte</h1>
                <p className="text-gray-500 text-sm font-medium tracking-wide">Rejoignez la communauté.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border-l-4 border-red-500 text-red-600 text-xs font-bold uppercase tracking-wide">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Ligne Prénom / Nom */}
              <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative group w-full">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400 group-focus-within:text-black transition"/>
                      </div>
                      <input
                          type="text"
                          required
                          className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-black focus:bg-white transition outline-none placeholder-gray-400 text-sm"
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                          placeholder="PRÉNOM"
                      />
                  </div>
                  <div className="relative group w-full">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400 group-focus-within:text-black transition"/>
                      </div>
                      <input
                          type="text"
                          required
                          className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-black focus:bg-white transition outline-none placeholder-gray-400 text-sm"
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          placeholder="NOM"
                      />
                  </div>
              </div>

              {/* Téléphone */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={16} className="text-gray-400 group-focus-within:text-black transition"/>
                </div>
                <input
                  type="tel"
                  className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-black focus:bg-white transition outline-none placeholder-gray-400 text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="TÉLÉPHONE (OPTIONNEL)"
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400 group-focus-within:text-black transition"/>
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-black focus:bg-white transition outline-none placeholder-gray-400 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ADRESSE EMAIL"
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400 group-focus-within:text-black transition"/>
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-black focus:bg-white transition outline-none placeholder-gray-400 text-sm tracking-widest"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="MOT DE PASSE"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-black shadow-xl shadow-gray-400/20 transition flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-xs mt-4"
              >
                {loading ? 'Création en cours...' : <>S'inscrire <ArrowRight size={16}/></>}
              </button>
            </form>

            <div className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-black border-b-2 border-black pb-0.5 hover:opacity-70 transition">
                Se connecter
              </Link>
            </div>
          </div>

          {/* === PARTIE DROITE (Esthétique Noir & Blanc) === */}
          <div className="hidden md:flex w-1/2 relative bg-black items-center justify-center p-12 overflow-hidden text-center">
             
             {/* Effet subtil de texture/lumière */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-gray-800 rounded-full blur-[100px] opacity-50"></div>
             
             <div className="relative z-10 max-w-sm">
                 <div className="w-16 h-1 bg-white mb-8 mx-auto"></div>
                 <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-6">
                     Bienvenue à la maison
                 </h2>
                 <p className="text-gray-400 text-sm font-medium leading-loose">
                     "Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux."
                 </p>
                 <div className="mt-4 text-xs font-bold text-gray-600 uppercase tracking-widest">Matthieu 18:20</div>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
}