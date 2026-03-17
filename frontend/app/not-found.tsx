'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar'; // Assure-tu d'avoir ton composant Navbar

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans text-gray-900 overflow-hidden relative">
      
      {/* ================= BACKGROUND IMAGE (Dark & Blurred Sanctuary) ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* L'image de fond texturée de ton Hero (image_0.png) */}
        <img 
          src="/church7.jpg"
          alt="Sanctuaire MDLP dans la pénombre"
          className="w-full h-full object-cover scale-105 filter blur-lg brightness-50 contrast-125" // Assombrissement et flou pour le mystère
        />
        {/* Overlay sombre supplémentaire pour garantir le contraste du texte */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
      </div>

      {/* ================= NAVBAR (Dark Theme) ================= */}
      {/* Positionnée en absolute top-0 z-50 pour être au-dessus de l'image de fond */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar theme="home" />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <section className="flex-grow flex flex-col items-center justify-center relative px-6 pt-24 z-20">
        
        {/* Effet déco minimaliste en fond de carte, comme sur image_0.png */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gray-50/10 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-gray-50/10 rounded-full blur-[100px] -z-10"></div>

        {/* Structure interne centrée */}
        <div className="text-center z-10 max-w-4xl mx-auto flex flex-col items-center">
            
            {/* Sur-titre style "NOTRE HISTOIRE" */}
            <h2 className="text-white/70 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-4">
                ERREUR 404
            </h2>

            {/* Massif "404" style titre MDLP, comme "NOUS SOMMES..." */}
            <h1 className="text-[120px] md:text-[200px] font-black leading-none tracking-tighter text-white mb-8">
                404
            </h1>

            {/* Texte explicatif */}
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-white/50 mb-12">
                PAGE INTROUVABLE
            </p>

            {/* Bouton CTA style "REJOINDRE" */}
            <Link
                href="/"
                className="inline-block bg-white text-black px-8 py-5 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition transform active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-black/10"
            >
                Retour à l&apos;accueil
            </Link>
            
        </div>
        
      </section>
      
    </div>
  );
}