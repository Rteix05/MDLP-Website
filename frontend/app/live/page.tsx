'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, Facebook, MapPin, PlayCircle, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const YOUTUBE_URL = 'https://www.youtube.com/@SamuelPanzuTV';
const FACEBOOK_URL = 'https://www.facebook.com/samuel.panzu.7';

// --- PLATEFORMES ---
const platforms = [
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Rejoignez le chat en direct, abonnez-vous et activez la cloche pour ne rien manquer.',
    icon: Youtube,
    link: YOUTUBE_URL,
    image: '/church3.jpg',
    tag: 'Haute qualité',
    accent: 'group-hover:bg-red-600 group-hover:border-red-600',
  },
  {
    id: 'facebook',
    name: 'Facebook Live',
    description: 'Partagez le direct avec vos proches et échangez avec la communauté en temps réel.',
    icon: Facebook,
    link: FACEBOOK_URL,
    image: '/church4.jpg',
    tag: 'Communauté',
    accent: 'group-hover:bg-blue-600 group-hover:border-blue-600',
  },
];

/** Le culte est diffusé le dimanche de 10h00 à 13h30 */
function isLiveNow(now: Date) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return now.getDay() === 0 && minutes >= 10 * 60 && minutes <= 13 * 60 + 30;
}

/** Prochain dimanche à 10h00 (aujourd'hui si on est dimanche avant 10h) */
function nextService(now: Date) {
  const next = new Date(now);
  next.setHours(10, 0, 0, 0);
  const daysUntilSunday = (7 - now.getDay()) % 7;
  next.setDate(now.getDate() + daysUntilSunday);
  if (next <= now) next.setDate(next.getDate() + 7);
  return next;
}

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // L'heure n'est lue qu'après le montage, pour éviter un écart entre le rendu serveur et le navigateur
    const first = setTimeout(() => setNow(new Date()), 0);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => { clearTimeout(first); clearInterval(timer); };
  }, []);
  return now;
}

function Countdown({ target, now }: { target: Date; now: Date }) {
  const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const parts = [
    { value: Math.floor(total / 86400), label: 'jours' },
    { value: Math.floor((total % 86400) / 3600), label: 'heures' },
    { value: Math.floor((total % 3600) / 60), label: 'minutes' },
    { value: total % 60, label: 'secondes' },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-3" role="timer" aria-label="Temps restant avant le prochain culte">
      {parts.map(p => (
        <div key={p.label} className="bg-white/10 border border-white/15 px-2 py-4 md:py-5 text-center">
          <p className="text-3xl md:text-5xl font-black tabular-nums tracking-tighter text-white">{String(p.value).padStart(2, '0')}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mt-1">{p.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function LivePage() {
  const now = useNow();
  const live = now ? isLiveNow(now) : false;
  const next = now ? nextService(now) : null;

  return (
    <div className="min-h-screen bg-black font-sans text-white flex flex-col">
      <Navbar theme="dark" />

      {/* ================= EN-TÊTE ================= */}
      <header className="relative overflow-hidden pt-36 pb-20 px-6">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/church8.jpg')" }} aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" aria-hidden="true" />

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            {/* Statut */}
            <div className="h-9 mb-8">
              {now && (live ? (
                <span className="inline-flex items-center gap-3 bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.3em]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                  En direct
                </span>
              ) : (
                <span className="inline-flex items-center gap-3 border border-white/25 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-white/80">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/40" aria-hidden="true" />
                  Hors ligne · Dimanche 10h
                </span>
              ))}
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
              {live ? <>Le culte <br /><span className="text-gold">commence.</span></> : <>Rejoignez-nous <br /><span className="text-gold">où que vous soyez.</span></>}
            </h1>
            <p className="text-white/75 text-lg md:text-xl font-medium max-w-xl leading-relaxed mb-10">
              {live
                ? 'Le culte est diffusé en ce moment. Choisissez votre plateforme pour le vivre avec nous.'
                : 'Chaque dimanche de 10h00 à 13h00, vivez le culte avec nous en direct sur YouTube et Facebook.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-gold text-black px-8 py-5 font-black uppercase tracking-widest text-xs hover:bg-white transition">
                <Youtube size={18} /> {live ? 'Regarder sur YouTube' : 'Ouvrir la chaîne YouTube'}
                <span className="sr-only"> (nouvelle fenêtre)</span>
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 border border-white/30 px-8 py-5 font-black uppercase tracking-widest text-xs text-white hover:border-gold hover:text-gold transition">
                <Facebook size={18} /> Facebook Live
                <span className="sr-only"> (nouvelle fenêtre)</span>
              </a>
            </div>
          </motion.div>

          {/* Compte à rebours / direct en cours */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="bg-violet-deep/70 backdrop-blur-sm border border-white/15 p-6 md:p-8">
            {now && next && !live ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold mb-2">Prochain culte</p>
                <p className="text-xl md:text-2xl font-black uppercase tracking-tight mb-6 first-letter:uppercase">
                  {next.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · 10h00
                </p>
                <Countdown target={next} now={now} />
              </>
            ) : now && live ? (
              <div className="text-center py-6">
                <PlayCircle size={56} className="mx-auto text-gold mb-4" aria-hidden="true" />
                <p className="text-2xl font-black uppercase tracking-tight mb-2">Le direct est en cours</p>
                <p className="text-white/70 text-sm">Jusqu&apos;à 13h30 environ</p>
              </div>
            ) : (
              <div className="h-48" aria-hidden="true" />
            )}
          </motion.div>
        </div>
      </header>

      {/* ================= PLATEFORMES ================= */}
      <section className="px-6 pb-20" aria-labelledby="plateformes-title">
        <div className="max-w-6xl mx-auto">
          <h2 id="plateformes-title" className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-6">Nos plateformes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {platforms.map((platform, index) => (
              <motion.a
                key={platform.id}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group block border border-white/15 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-white/40"
              >
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center grayscale opacity-60 transition duration-700 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-90"
                    style={{ backgroundImage: `url('${platform.image}')` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <span className="absolute top-5 left-5 bg-black/80 backdrop-blur-md px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-white/15">
                    {platform.tag}
                  </span>
                  <div className="absolute bottom-5 left-5 flex items-center gap-3">
                    <span className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                      <platform.icon size={22} />
                    </span>
                    <span className="text-2xl md:text-3xl font-black uppercase tracking-tight">{platform.name}</span>
                  </div>
                </div>
                <div className="p-6 md:p-8 bg-black">
                  <p className="text-white/75 text-sm leading-relaxed font-medium mb-6">{platform.description}</p>
                  <span className={`flex w-full items-center justify-center gap-3 border border-white/25 py-4 text-xs font-black uppercase tracking-widest transition-colors ${platform.accent}`}>
                    Accéder au direct <ArrowUpRight size={16} />
                  </span>
                  <span className="sr-only"> (nouvelle fenêtre)</span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ================= INFOS PRATIQUES + REPLAYS ================= */}
      <section className="px-6 pb-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-px bg-white/15 border border-white/15">
          <div className="bg-black p-8">
            <CalendarDays className="text-gold mb-5" size={26} aria-hidden="true" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Tous les dimanches</h3>
            <p className="text-white/75 text-sm font-medium flex items-center gap-2"><Clock size={14} aria-hidden="true" /> 10h00 – 13h00</p>
          </div>
          <div className="bg-black p-8">
            <MapPin className="text-gold mb-5" size={26} aria-hidden="true" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Ou sur place</h3>
            <p className="text-white/75 text-sm font-medium mb-4">2 Allée Bienvenue, 93130 Noisy-le-Grand</p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gold hover:text-white transition">
              Planifier une visite <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-violet-deep p-8">
            <PlayCircle className="text-gold mb-5" size={26} aria-hidden="true" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Vous avez manqué le direct ?</h3>
            <p className="text-white/75 text-sm font-medium mb-4">Retrouvez tous les messages en replay sur YouTube.</p>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gold hover:text-white transition">
              Voir les replays <ArrowUpRight size={14} /><span className="sr-only"> (nouvelle fenêtre)</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
