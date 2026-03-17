'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Youtube, Facebook, ArrowRight, Tv } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// --- DONNÉES DES PLATEFORMES ---
const platforms = [
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Rejoignez le chat en direct, abonnez-vous et activez la cloche pour ne rien manquer.',
    icon: Youtube,
    color: 'hover:border-red-500',
    btnColor: 'group-hover:bg-red-600',
    link: 'https://www.youtube.com/@SamuelPanzuTV',
    image: '/church3.jpg',
    tag: 'Haute Qualité'
  },
  {
    id: 'facebook',
    name: 'Facebook Live',
    description: 'Partagez le direct avec vos amis et interagissez avec la communauté en temps réel.',
    icon: Facebook,
    color: 'hover:border-blue-500',
    btnColor: 'group-hover:bg-blue-600',
    link: 'https://facebook.com',
    image: '/church4.jpg',
    tag: 'Communauté'
  }
];

export default function LivePage() {
  const [isLive, setIsLive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Permet d'éviter les erreurs d'hydratation Next.js

    const checkIsLive = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Condition : Si c'est Dimanche (0) ET (entre 10h00 et 13h30)
      const isSunday = day === 0;
      const isTimeValid = (hour >= 10 && hour < 13) || (hour === 13 && minute <= 30);

      setIsLive(isSunday && isTimeValid);
    };

    checkIsLive(); // Vérifier tout de suite
    const interval = setInterval(checkIsLive, 60000); // Revérifier chaque minute (si qqn laisse la page ouverte)
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white flex flex-col">
      
      {/* ================= NAVBAR ================= */}
      <Navbar theme="dark" />

      {/* ================= HEADER SECTION ================= */}
      <header className="pt-40 pb-20 px-6 text-center relative overflow-hidden">
        {/* Lueur d'arrière-plan subtile */}
        <div className="absolute top-[-10%] left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
      
          {/* ================= INDICATEUR DE STATUT ================= */}
          {mounted && isLive ? (
             <div className="flex justify-center items-center gap-3 mb-6 animate-in fade-in zoom-in duration-500">
               <span className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
               <h3 className="text-xs font-bold text-red-500 uppercase tracking-[0.4em]">En Direct</h3>
             </div>
          ) : mounted && !isLive ? (
             <div className="flex justify-center items-center gap-3 mb-6 animate-in fade-in zoom-in duration-500">
               <span className="relative flex h-3 w-3 rounded-full bg-gray-700"></span>
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Hors Ligne • Dimanche 10h</h3>
             </div>
          ) : (
             <div className="h-6 mb-6"></div> // Espace vide le temps que React vérifie l'heure
          )}

          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-tight">
            REJOIGNEZ-NOUS <br/> OÙ QUE VOUS SOYEZ.
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Chaque dimanche à 10h00. Choisissez votre plateforme préférée pour vivre le culte avec nous.
          </p>
        </div>
      </header>

      {/* ================= PLATFORMS WIDGETS ================= */}
      <section className="flex-grow pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {platforms.map((platform, index) => (
              <motion.a
                key={platform.id}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`group block bg-[#111] border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${platform.color}`}
              >
                {/* PREVIEW IMAGE */}
                <div className="relative h-72 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                    style={{ backgroundImage: `url('${platform.image}')` }}
                  ></div>
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/50 to-transparent"></div>
                  
                  {/* Tag */}
                  <div className="absolute top-6 left-6">
                    <span className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                      {platform.tag}
                    </span>
                  </div>
                </div>

                {/* CONTENU */}
                <div className="p-10 relative">
                  {/* Icon flottante */}
                  <div className="absolute -top-8 right-10 w-16 h-16 bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover:-translate-y-2">
                    <platform.icon size={28} />
                  </div>

                  <h2 className="text-3xl font-black uppercase tracking-tight mb-4 group-hover:text-white transition-colors">
                    {platform.name}
                  </h2>
                  <p className="text-gray-400 text-sm leading-loose mb-8 font-medium">
                    {platform.description}
                  </p>

                  <div className={`w-full py-5 rounded-xl text-center font-black uppercase tracking-widest text-xs border border-white/20 transition-all duration-300 flex items-center justify-center gap-3 ${platform.btnColor} group-hover:border-transparent group-hover:text-white`}>
                    Accéder au direct <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.a>
            ))}

            {/* WIDGET SUPPLÉMENTAIRE : REPLAY / PODCAST */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="md:col-span-2 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 mt-4 group hover:border-white/30 transition-colors"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-400 group-hover:text-white group-hover:scale-110 transition-all">
                  <Tv size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">Vous avez manqué le direct ?</h3>
                  <p className="text-gray-500 text-sm font-medium">Retrouvez tous nos anciens messages en replay.</p>
                </div>
              </div>
              <Link href="https://www.youtube.com/@SamuelPanzuTV" className="whitespace-nowrap bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition">
                Voir les replays
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}