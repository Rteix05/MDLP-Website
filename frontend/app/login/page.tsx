'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/login_check`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
        },
        body: JSON.stringify({ 
            username: email, 
            password: password 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Identifiants incorrects');
      }

      Cookies.set('token', data.token, { expires: 1 });
      router.push('/dashboard');

    } catch (err: any) {
      console.error("Erreur Login:", err);
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Background sombre
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 font-sans text-gray-900 flex flex-col">
      
      {/* ================= NAVBAR (Statique / Transparente) ================= */}
      <Navbar theme="dark" />

      {/* ================= CONTENU PRINCIPAL ================= */}
      <div className="flex-grow flex items-center justify-center p-4 pt-32 pb-12">
        <div className="bg-white rounded-[30px] shadow-2xl overflow-hidden flex w-full max-w-5xl min-h-[600px] border border-gray-100">
            
            {/* === PARTIE GAUCHE (Formulaire) === */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight uppercase">Bonjour, <br/>Bon Retour</h1>
                <p className="text-gray-500 text-sm font-medium tracking-wide">Accédez à votre espace membre.</p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wide">
                ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Input Email */}
                <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400 group-focus-within:text-black transition"/>
                </div>
                <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400 font-bold text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                />
                </div>

                {/* Input Password */}
                <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400 group-focus-within:text-black transition"/>
                </div>
                <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-gray-900 bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-gray-400 font-bold text-lg tracking-widest"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black transition select-none">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black" />
                    Se souvenir
                </label>
                
                <Link href="/forgot-password">
                    <span className="text-gray-400 hover:text-black transition cursor-pointer">
                        Mot de passe oublié ?
                    </span>
                </Link>
                </div>

                {/* Submit Button */}
                <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-black text-white text-xs uppercase tracking-[0.2em] shadow-lg shadow-gray-900/20 transition-all transform hover:scale-[1.02] active:scale-95 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                }`}
                >
                {loading ? 'Connexion...' : 'Se Connecter'}
                </button>
            </form>

            <div className="mt-8 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">
                Pas de Compte ?{' '}
                <Link href="/register" className="text-gray-900 font-black hover:underline">
                S'inscrire
                </Link>
            </div>
            </div>

            {/* === PARTIE DROITE (Illustration Monochrome) === */}
            <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-black to-gray-900 items-center justify-center p-12 overflow-hidden">
                
                {/* Décoration en fond */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-gray-800/30 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 left-10 w-64 h-64 bg-gray-800/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 text-center text-white p-8">
                    <h2 className="text-3xl font-black mb-4 tracking-tight uppercase">BIENVENUE</h2>
                    <p className="text-white/80 text-sm font-medium leading-relaxed tracking-wide">
                        "Connectez-vous pour accéder à votre espace personnel, vos dons et vos rendez-vous."
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}