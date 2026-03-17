'use client';

import Link from 'next/link';
import { X, RefreshCcw, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ErreurPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 font-sans text-gray-900 flex flex-col">
            
            {/* ================= NAVBAR ================= */}
            <Navbar theme="dark" />

            {/* ================= CONTENU ================= */}
            <div className="flex-grow flex flex-col items-center justify-center px-4 pt-20">
                <div className="bg-white p-12 rounded-[30px] shadow-2xl max-w-md w-full text-center border border-gray-100 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                    
                    {/* Bandeau rouge décoratif */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700"></div>

                    {/* Icône Erreur */}
                    <div className="relative mb-8">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-inner">
                                <X size={40} strokeWidth={4} />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">Paiement Annulé</h1>
                    <p className="text-gray-500 mb-8 text-sm font-medium tracking-wide leading-relaxed">
                        Aucun montant n'a été débité.<br/>
                        Vous pouvez réessayer quand vous le souhaitez.
                    </p>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link href="/don">
                            <button className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-black shadow-xl shadow-gray-400/20 transition flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-xs transform active:scale-[0.98]">
                                <RefreshCcw size={16} /> Réessayer
                            </button>
                        </Link>

                        <Link href="/">
                            <button className="w-full bg-white hover:bg-gray-50 text-gray-400 hover:text-black py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 uppercase tracking-[0.15em] text-xs">
                                <Home size={16} /> Retour à l'accueil
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}