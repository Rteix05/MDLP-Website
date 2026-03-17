'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            // On utilise l'URL dynamique pour le réseau local / prod
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            
            const res = await fetch(`${apiUrl}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setMessage("Si un compte existe, un lien vient de vous être envoyé.");
                setEmail(''); // On vide le champ après succès
            } else {
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await res.json();
                    throw new Error(data.message || "Impossible d'envoyer la demande.");
                } else {
                    throw new Error("Erreur serveur. Réessayez plus tard.");
                }
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue. Réessayez plus tard.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#111] via-[#0a0a0a] to-black font-sans text-gray-900 flex flex-col">
            
            {/* Si ça charge, on affiche le loader global avec l'écran flou */}
            {loading && <Loader />}

            {/* NAVBAR */}
            <Navbar theme="dark" />

            {/* CONTENU PRINCIPAL */}
            <div className="flex-grow flex items-center justify-center p-4 pt-28 pb-12">
                
                <div className="bg-white rounded-[20px] md:rounded-[30px] shadow-2xl border border-gray-100 w-full max-w-lg p-8 md:p-12 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                    
                    {/* Effet déco minimaliste en fond de carte */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-0"></div>

                    <div className="relative z-10">
                        {/* Bouton Retour */}
                        <Link href="/login" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition mb-8">
                            <ArrowLeft size={14} /> Retour à la connexion
                        </Link>

                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight leading-none">
                            Mot de passe<br/>Oublié ?
                        </h1>
                        <p className="text-gray-500 mb-8 text-xs md:text-sm font-medium tracking-wide leading-relaxed">
                            Entrez l'adresse email associée à votre compte. Nous vous enverrons un lien pour le réinitialiser en toute sécurité.
                        </p>

                        {/* MESSAGES DE SUCCÈS OU D'ERREUR */}
                        {message && (
                            <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-[10px] md:text-xs font-bold uppercase tracking-wide">
                                ✅ {message}
                            </div>
                        )}
                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] md:text-xs font-bold uppercase tracking-wide">
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
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-black focus:bg-white transition outline-none placeholder-gray-400 text-sm md:text-base"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="VOTRE ADRESSE EMAIL"
                                />
                            </div>

                            {/* Bouton Submit */}
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-black hover:bg-gray-800 text-white py-4 md:py-5 rounded-xl font-black shadow-xl shadow-black/10 transition flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px] md:text-xs transform active:scale-95 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none"
                            >
                                Envoyer le lien <ArrowRight size={16} className="hidden md:block"/>
                            </button>
                            
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}