'use client';

import { useState, Suspense, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';

function ResetForm() {
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (!token) {
            setError("Lien de réinitialisation invalide ou expiré.");
            return;
        }

        setLoading(true);

        try {
            // URL dynamique (Localhost ou IP Téléphone selon le .env)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            
            const res = await fetch(`${apiUrl}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            if (res.ok) {
                setMessage("Mot de passe modifié avec succès ! Redirection...");
                setTimeout(() => router.push('/login'), 3000); 
            } else {
                const data = await res.json();
                throw new Error(data.message || "Erreur lors de la réinitialisation.");
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    // Affichage alternatif si le token est manquant dans l'URL
    if (!token) {
        return (
            <div className="text-center relative z-10 w-full py-8">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={28} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 text-gray-900">
                    Lien invalide
                </h2>
                <p className="text-gray-500 text-xs md:text-sm font-medium mb-8">
                    Le jeton de réinitialisation est manquant, expiré ou a déjà été utilisé.
                </p>
                <Link href="/forgot-password" className="inline-block bg-black text-white px-8 py-4 md:py-5 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-gray-800 transition transform active:scale-95">
                    Demander un nouveau lien
                </Link>
            </div>
        );
    }

    return (
        <div className="relative z-10 w-full">
            {loading && <Loader />}
            
            <div className="w-14 h-14 md:w-16 md:h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                <ShieldCheck size={28} />
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight leading-none text-center">
                Nouveau <br/>Mot de passe
            </h2>
            <p className="text-gray-500 mb-8 text-xs md:text-sm font-medium tracking-wide leading-relaxed text-center">
                Veuillez saisir votre nouveau mot de passe ci-dessous pour sécuriser votre compte.
            </p>

            {/* MESSAGES */}
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
                
                {/* Input Password */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400 group-focus-within:text-black transition"/>
                    </div>
                    <input
                        type="password"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-black focus:bg-white transition outline-none placeholder-gray-400 text-sm md:text-base tracking-widest"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="NOUVEAU MOT DE PASSE"
                    />
                </div>

                {/* Input Confirm Password */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400 group-focus-within:text-black transition"/>
                    </div>
                    <input
                        type="password"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-black focus:bg-white transition outline-none placeholder-gray-400 text-sm md:text-base tracking-widest"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="CONFIRMER LE MOT DE PASSE"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !password || !confirmPassword}
                    className="w-full bg-black hover:bg-gray-800 text-white py-4 md:py-5 rounded-xl font-black shadow-xl shadow-black/10 transition flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px] md:text-xs transform active:scale-95 disabled:bg-gray-300 disabled:shadow-none disabled:transform-none"
                >
                    {loading ? 'Mise à jour...' : <>Changer le mot de passe <ArrowRight size={16} className="hidden md:block"/></>}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#111] via-[#0a0a0a] to-black font-sans text-gray-900 flex flex-col">
            
            <Navbar theme="dark" />

            <div className="flex-grow flex items-center justify-center p-4 pt-28 pb-12">
                <div className="bg-white rounded-[20px] md:rounded-[30px] shadow-2xl border border-gray-100 w-full max-w-lg p-8 md:p-12 relative overflow-hidden animate-in fade-in zoom-in duration-500 flex justify-center">
                    
                    {/* Déco */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-0"></div>
                    
                    {/* Suspense permet d'attendre proprement que Next.js lise l'URL (le token) */}
                    <Suspense fallback={<div className="py-20 flex justify-center"><Loader /></div>}>
                        <ResetForm />
                    </Suspense>

                </div>
            </div>
        </div>
    );
}