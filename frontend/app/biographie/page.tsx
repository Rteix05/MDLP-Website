'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Church, GraduationCap, HeartHandshake, Sprout, Users } from 'lucide-react';
import Link from 'next/link';

// --- FRISE CHRONOLOGIQUE ---
const timeline = [
  {
    year: '1989',
    title: 'Parcours et appel',
    text: "Converti en 1989, il se distingue très tôt par une profondeur exceptionnelle dans la compréhension des Écritures. Trois mois après sa conversion, il prêche sur Osée 4:6, posant les bases d'un ministère centré sur la connaissance comme instrument de libération.",
  },
  {
    year: '1990',
    title: 'Déploiement international',
    text: "Appelé en Europe en 1990, il s'établit en Italie après une formation en Suisse.",
  },
  {
    year: '1995',
    title: 'Fondation — Arbre de Vie Internationale',
    text: 'En 1995, il fonde à Milan le ministère Arbre de Vie Internationale, qui devient une œuvre missionnaire majeure.',
  },
  {
    year: '2002',
    title: 'Consécration',
    text: 'Consacré prophète en 2002 à Milan.',
  },
  {
    year: '2004',
    title: 'Engagement humanitaire',
    text: 'Fondateur de Arbre de Vie M.A.C.R.I.A, devenu Secours Humanitaire International.',
  },
];

const expansion = [
  { icon: Church, text: 'Implantation de plusieurs églises en Italie' },
  { icon: Church, text: 'Implantation à Berne (Suisse)' },
  { icon: Users, text: 'Église de maison à Carcassonne (France)' },
  { icon: GraduationCap, text: 'Formation de nombreux pasteurs et leaders' },
];

const humanitarian = [
  { value: '800', label: 'bénéficiaires mensuels' },
  { value: 'Boutiques', label: 'solidaires' },
  { value: 'Partenariats', label: 'institutionnels' },
];

const mission = [
  { icon: BookOpen, title: 'Enseignement profond de la Parole' },
  { icon: Sprout, title: 'Formation spirituelle' },
  { icon: HeartHandshake, title: 'Restauration des vies' },
  { icon: Church, title: 'Structuration ministérielle' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function BiographiePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-black selection:text-white">

      <Navbar theme="home" />

      {/* ================= HERO ================= */}
      <header className="relative min-h-screen w-full bg-black overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 scale-105" style={{ backgroundImage: "url('/church4.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 grid md:grid-cols-[1.2fr_1fr] gap-12 items-center w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
            <p className="text-white/60 text-xs md:text-sm font-bold uppercase tracking-[0.4em] mb-6">Biographie institutionnelle</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase mb-8">
              Samuel <br /> Panzu.
            </h1>
            <p className="text-gray-300 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
              Fondateur de La Montagne de la Prière Ministries (MDLP) et pasteur principal de l&apos;église
              La Montagne de la Prière Paris.
            </p>
            <p className="mt-8 inline-flex items-center gap-3 text-white text-xs font-bold uppercase tracking-[0.2em] border-t border-white/20 pt-6">
              Plus de 30 ans de ministère prophétique et apostolique
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="relative max-w-sm md:max-w-none mx-auto w-full"
          >
            <div className="bg-white/5 overflow-hidden">
              <img src="/086A9997_small.jpg" alt="Le pasteur Samuel Panzu" className="w-full h-auto object-contain grayscale" />
            </div>
          </motion.div>
        </div>
      </header>

      {/* ================= PRÉSENTATION ================= */}
      <section className="py-24 md:py-32 px-6 bg-white">
        <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-10">Présentation générale</h2>
          <p className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            Samuel Panzu exerce un ministère prophétique et apostolique au service de Jésus-Christ depuis plus de trente ans.
          </p>
        </motion.div>
      </section>

      {/* ================= FRISE CHRONOLOGIQUE ================= */}
      <section className="py-24 md:py-32 bg-[#0a0a0a] text-white" aria-labelledby="parcours-title">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2 {...fadeUp} id="parcours-title" className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-16 md:mb-24">
            Un parcours.
          </motion.h2>

          <ol className="relative border-l border-white/15 ml-3 md:ml-0">
            {timeline.map((step, i) => (
              <motion.li
                key={step.year}
                {...fadeUp}
                transition={{ delay: i * 0.05 }}
                className="relative pl-10 md:pl-16 pb-14 last:pb-0"
              >
                <span className="absolute -left-[7px] top-2 w-3.5 h-3.5 rounded-full bg-white ring-4 ring-[#0a0a0a]" aria-hidden="true" />
                <p className="text-5xl md:text-7xl font-black tracking-tighter text-white/15 leading-none mb-3">{step.year}</p>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-3">{step.title}</h3>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed font-medium max-w-2xl">{step.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= EXPANSION & FORMATION ================= */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6">Expansion & formation.</h2>
            <p className="text-gray-500 text-lg font-medium leading-relaxed">Sous son leadership :</p>
          </motion.div>
          <ul className="divide-y divide-gray-200 border-y border-gray-200">
            {expansion.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.li key={item.text} {...fadeUp} transition={{ delay: i * 0.08 }} className="flex items-center gap-5 py-6">
                  <span className="w-11 h-11 shrink-0 bg-black text-white flex items-center justify-center"><Icon size={20} /></span>
                  <span className="text-lg font-bold">{item.text}</span>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ================= ENGAGEMENT HUMANITAIRE ================= */}
      <section className="py-24 md:py-32 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeUp} className="max-w-3xl mb-16">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-6">Engagement humanitaire</h2>
            <p className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Arbre de Vie M.A.C.R.I.A (2004), devenu Secours Humanitaire International.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
            {humanitarian.map((item, i) => (
              <motion.div key={item.label} {...fadeUp} transition={{ delay: i * 0.1 }} className="bg-white p-10">
                <p className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{item.value}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= VIE FAMILIALE ================= */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp} className="bg-gray-100 overflow-hidden max-w-md mx-auto md:mx-0 w-full">
            <img src="/086A9088_small.jpg" alt="Filomena Panzu" className="w-full h-auto object-contain grayscale hover:grayscale-0 transition-all duration-700" />
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-6">Vie familiale</h2>
            <p className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-8">
              Marié à Filomena Panzu depuis près de 26 ans, père de quatre enfants.
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition">
              Découvrir le couple pastoral <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================= MISSION ACTUELLE ================= */}
      <section className="py-24 md:py-32 bg-[#0a0a0a] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 {...fadeUp} className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-16 text-center">
            Mission actuelle.
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {mission.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} {...fadeUp} transition={{ delay: i * 0.08 }} className="bg-[#0a0a0a] p-10 flex flex-col gap-6">
                  <Icon size={28} className="text-white/60" />
                  <h3 className="text-xl font-black uppercase tracking-tight leading-snug">{item.title}</h3>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= APPEL À L'ACTION ================= */}
      <section className="py-32 bg-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter uppercase leading-tight">
            Prendre rendez-vous avec le pasteur
          </h2>
          <Link href="/rdv" className="inline-block bg-black text-white px-12 py-5 font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition">
            Demander un rendez-vous
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
