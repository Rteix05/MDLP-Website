'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, ArrowRight, Home, Download } from 'lucide-react';
import { useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';

function MerciContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(false);

    const handleDownloadReceipt = async () => {
        if (!sessionId) return;
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

            const pdfRes = await fetch(`${apiUrl}/api/invoice/by-session?session_id=${sessionId}`);

            if (!pdfRes.ok) throw new Error('Erreur lors du téléchargement');
            const blob = await pdfRes.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recu_don.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Le reçu n'est pas encore disponible. Réessayez dans quelques secondes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-center px-4 pt-20">
            <div className="bg-white p-12 rounded-[30px] shadow-2xl max-w-md w-full text-center border border-gray-100 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                
                {/* Bandeau vert décoratif */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

                {/* Icône Succès */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 animate-pulse">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                            <Check size={40} strokeWidth={4} />
                        </div>
                    </div>
                </div>

                <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">Merci !</h1>
                <p className="text-gray-500 mb-8 text-sm font-medium tracking-wide leading-relaxed">
                    Votre don a été reçu avec succès.<br/>
                    Merci de soutenir la vision de l'église.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 text-xs text-green-700 font-medium flex items-center gap-2 justify-center">
                    <Check size={14} /> Un récapitulatif et votre reçu ont été envoyés par email.
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    {sessionId ? (
                        <button
                            onClick={handleDownloadReceipt}
                            disabled={loading}
                            className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-black shadow-xl shadow-gray-400/20 transition flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-xs transform active:scale-[0.98] disabled:bg-gray-400"
                        >
                            {loading ? 'Téléchargement...' : 'Télécharger mon reçu'} <Download size={16} />
                        </button>
                    ) : (
                        <Link href="/dashboard">
                            <button className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-black shadow-xl shadow-gray-400/20 transition flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-xs transform active:scale-[0.98]">
                                Voir mes dons <ArrowRight size={16} />
                            </button>
                        </Link>
                    )}

                    <Link href="/">
                        <button className="w-full bg-white hover:bg-gray-50 text-gray-400 hover:text-black py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 uppercase tracking-[0.15em] text-xs">
                            <Home size={16} /> Retour à l'accueil
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function MerciPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 font-sans text-gray-900 flex flex-col">
            <Navbar theme="dark" />
            <Suspense fallback={null}>
                <MerciContent />
            </Suspense>
        </div>
    );
}