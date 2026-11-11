'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  theme?: 'home' | 'dark' | 'light';
}

export default function Navbar({ theme = 'dark' }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (Cookies.get('token')) setIsLoggedIn(true);

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isLive, setIsLive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkIsLive = () => {
      const now = new Date();
      // Le dimanche de 10h00 à 13h30
      setIsLive(now.getDay() === 0 && ((now.getHours() >= 10 && now.getHours() < 13) || (now.getHours() === 13 && now.getMinutes() <= 30)));
    };
    checkIsLive();
    const interval = setInterval(checkIsLive, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- LOGIQUE D'ADAPTATION DU DESIGN (DESKTOP) ---
  let navBg = '';
  let textColor = '';
  let btnStyle = '';

  if (theme === 'home') {
    navBg = scrolled ? 'bg-white shadow-sm py-4' : 'bg-transparent py-8';
    textColor = scrolled ? 'text-black' : 'text-white';
    btnStyle = scrolled
        ? 'bg-black text-white hover:bg-violet-deep'
        : 'bg-gold text-black hover:bg-white';
  } else if (theme === 'light') {
    navBg = scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-4' : 'bg-white py-6';
    textColor = 'text-black';
    btnStyle = 'bg-black text-white hover:bg-violet-deep';
  } else {
    navBg = scrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6';
    textColor = 'text-white';
    btnStyle = 'bg-gold text-black hover:bg-white';
  }

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* LOGO */}
          <Link href="/" className={`text-2xl font-black tracking-tighter flex items-center gap-2 transition-colors duration-300 relative z-[60] ${mobileMenuOpen ? 'text-white' : textColor}`}>
            MDLP.
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/biographie" className={`text-xs font-bold uppercase tracking-[0.15em] hover:opacity-50 transition ${textColor}`}>
              Biographie
            </Link>
            <Link href="/live" className={`text-xs font-bold uppercase tracking-[0.15em] hover:opacity-50 transition flex items-center gap-2 ${textColor}`}>
                {mounted && isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
                Live
            </Link>
            <Link href="/planning" className={`text-xs font-bold uppercase tracking-[0.15em] hover:opacity-50 transition ${textColor}`}>
              Calendrier
            </Link>
            <Link href="/don" className={`text-xs font-bold uppercase tracking-[0.15em] hover:opacity-50 transition ${textColor}`}>
              Faire un don
            </Link>

            {/* AUTHENTIFICATION */}
            {isLoggedIn ? (
              <Link href="/dashboard" className={`text-xs font-bold uppercase tracking-[0.15em] hover:opacity-50 transition ${textColor}`}>
                Mon Espace
              </Link>
            ) : (
              <div className={`flex items-center gap-6 ml-4 border-l pl-6 ${theme === 'light' || (theme === 'home' && scrolled) ? 'border-gray-200' : 'border-white/20'}`}>
                <Link href="/login" className={`text-xs font-bold uppercase tracking-[0.15em] hover:opacity-50 transition ${textColor}`}>
                   Connexion
                </Link>
                <Link 
                  href="/register" 
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${btnStyle}`}
                >
                  Rejoindre
                </Link>
              </div>
            )}
          </div>

          {/* BOUTON HAMBURGER (MOBILE) */}
          <button 
            className={`md:hidden relative z-[60] p-2 transition-colors ${mobileMenuOpen ? 'text-white' : textColor}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* ================= MENU MOBILE (Plein écran Noir) ================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[55] bg-black flex flex-col justify-center px-8"
          >
            <div className="flex flex-col gap-6 text-center">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-white hover:text-gold transition">
                Accueil
              </Link>
              <Link href="/biographie" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-white hover:text-gold transition">
                Biographie
              </Link>
              
              {/* LIGNE CORRIGÉE POUR LE MOBILE */}
              <Link href="/live" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-white hover:text-gold transition flex items-center justify-center gap-3">
                {mounted && isLive && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
                Direct
              </Link>

              <Link href="/planning" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-white hover:text-gold transition">
                Calendrier
              </Link>
              <Link href="/don" onClick={() => setMobileMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter text-white hover:text-gold transition">
                Faire un don
              </Link>
              
              <div className="h-px w-16 bg-white/20 mx-auto my-4"></div>

              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition">
                  Mon Espace
                </Link>
              ) : (
                <div className="flex flex-col gap-6 mt-4">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition">
                    Se connecter
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="bg-gold text-black py-5 px-8 mx-auto w-full max-w-xs font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition">
                    Rejoindre l'église
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}