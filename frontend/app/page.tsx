'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// --- SLIDER D'ACCUEIL ---
const slides = [
  {
    id: 1,
    image: '/church1.jpg',
    subtitle: 'DIMANCHES À 10H00',
    title: 'VIVRE SA PRÉSENCE.',
    link: '/contact',
    btnText: 'Planifier une visite'
  },
  {
    id: 2,
    image: '/church3.jpg',
    subtitle: 'COMMUNAUTÉ',
    title: 'GRANDIR ENSEMBLE.',
    link: '/biographie',
    btnText: 'Découvrir notre histoire'
  },
  {
    id: 3,
    image: '/church6.jpg',
    subtitle: 'ÉVÉNEMENTS',
    title: 'UNE ÉGLISE EN ACTION.',
    link: '/planning',
    btnText: 'Voir le calendrier'
  },
  {
    id: 4,
    image: '/church_kids1.jpg',
    subtitle: 'MDLP KIDS',
    title: 'LA PROCHAINE GÉNÉRATION.',
    link: '/contact',
    btnText: 'Infos enfants & jeunesse'
  },
  {
    id: 5,
    image: '/church8.jpg',
    subtitle: 'LOUANGE',
    title: 'ÉLEVER SA VOIX.',
    link: '/live',
    btnText: 'Rejoindre le direct'
  }
];

// --- DONNÉES DU COUPLE PASTORAL ---
const team = [
  {
    id: 1,
    name: 'Pasteur Samuel Panzu',
    role: 'Pasteur Principal',
    image: '/086A9997_small.jpg'
  },
  {
    id: 2,
    name: 'Pastoresse Filomena Panzu',
    role: 'Pastoresse',
    image: '/086A9088_small.jpg'
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000); // Change toutes les 6 secondes
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const slide = slides[currentSlide] ?? slides[0];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-black selection:text-gold">

      <Navbar theme="home" />

      {/* ================= SLIDER ================= */}
      <header className="relative h-screen w-full bg-black overflow-hidden flex flex-col justify-center items-center text-center">

        {slides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear ${index === currentSlide ? 'scale-105' : 'scale-100'}`}
              style={{ backgroundImage: `url('${s.image}')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30"></div>
          </div>
        ))}

        <div className="relative z-20 max-w-5xl mx-auto px-6 pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-6">
                {slide.subtitle}
              </h2>
              <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white mb-10 leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
                {slide.title}
              </h1>

              <Link
                href={slide.link}
                className="inline-block bg-gold text-black px-10 py-5 font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-white transition-colors"
              >
                {slide.btnText}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Contrôles du carrousel */}
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-between items-center px-6 md:px-12">
          {/* Indicateurs (Dots) */}
          <div className="flex gap-2 md:gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Afficher la diapositive ${i + 1}`}
                className={`h-1 transition-all duration-300 ${i === currentSlide ? 'w-8 md:w-12 bg-gold' : 'w-4 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>

          {/* Flèches */}
          <div className="flex gap-2 md:gap-4">
            <button onClick={prevSlide} aria-label="Diapositive précédente" className="p-3 border border-white/20 text-white rounded-full hover:bg-gold hover:border-gold hover:text-black transition backdrop-blur-sm">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextSlide} aria-label="Diapositive suivante" className="p-3 border border-white/20 text-white rounded-full hover:bg-gold hover:border-gold hover:text-black transition backdrop-blur-sm">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MANIFESTO / VISION ================= */}
      <section className="py-32 px-6 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-10 text-black"
          >
            NOTRE DÉSIR EST DE VOIR NOTRE VILLE TRANSFORMÉE PAR L'ÉVANGILE DE JÉSUS-CHRIST.
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto"
          >
            Nous ne sommes pas juste un bâtiment ou une réunion le dimanche. Nous sommes une famille de croyants imparfaits, sauvés par la grâce, et appelés à aimer Dieu, à nous aimer les uns les autres, et à servir notre prochain.
          </motion.p>
        </div>
      </section>

      {/* ================= NOS RENCONTRES (Culte & Kids) ================= */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          {/* Colonne Gauche : Le Culte */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2">Le Culte</h2>
              <h3 className="text-gold font-bold tracking-[0.2em] uppercase text-xs">Tous les dimanches • 10h00 - 13h00</h3>
            </div>
            <p className="text-white/75 text-lg leading-relaxed font-medium">
              Chaque dimanche, nous nous rassemblons pour célébrer Jésus. Attendez-vous à des temps de louange passionnés, un message biblique profond et ancré dans la réalité, et une communauté authentique prête à vous accueillir tel que vous êtes.
            </p>
            <div className="flex items-center gap-6 pt-4 border-t border-white/15">
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white">
                <Clock size={18} className="text-gold" /> 10:00 - 13:00
              </div>
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white">
                <MapPin size={18} className="text-gold" /> Noisy-Le-Grand
              </div>
            </div>
          </motion.div>

          {/* Colonne Droite : Image Culte */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-[500px] bg-white/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-cover bg-center grayscale opacity-80 hover:scale-105 transition-transform duration-1000"
              style={{ backgroundImage: "url('/church6.jpg')" }}>
            </div>
          </motion.div>

          {/* Colonne Gauche (Inversée sur Desktop) : Image Kids */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-[500px] bg-white/5 relative overflow-hidden order-last md:order-none"
          >
            <div className="absolute inset-0 bg-cover bg-center grayscale opacity-80 hover:scale-105 transition-transform duration-1000"
              style={{ backgroundImage: "url('/church_kids1.jpg')" }}>
            </div>
          </motion.div>

          {/* Colonne Droite : École du Dimanche */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2">MDLP Kids</h2>
              <h3 className="text-gold font-bold tracking-[0.2em] uppercase text-xs">École du dimanche • 10h00 - 13h00</h3>
            </div>
            <p className="text-white/75 text-lg leading-relaxed font-medium">
              Nous croyons que l'église doit être le meilleur moment de la semaine pour vos enfants. Pendant que vous assistez au culte, vos enfants (de 3 à 12 ans) grandissent dans leur foi dans un environnement sécurisé, ludique et adapté à leur âge.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold border-b-2 border-gold pb-1 hover:text-white hover:border-white transition mt-4">
              En savoir plus sur l'accueil des enfants <ArrowRight size={16} />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* ================= NOS VALEURS ================= */}
      <section className="py-32 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-16">Ce que nous croyons</h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-black">La Bible est notre boussole.</h4>
              <p className="text-gray-500 font-medium">Nous croyons que les Écritures sont la parole infaillible de Dieu, notre autorité finale pour la foi et la vie.</p>
            </div>
            <div>
              <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-black">Jésus est le centre.</h4>
              <p className="text-gray-500 font-medium">Tout ce que nous faisons pointe vers l'œuvre achevée de Christ à la croix. Il est le seul chemin, la vérité et la vie.</p>
            </div>
            <div>
              <h4 className="text-xl font-black uppercase tracking-tight mb-4 text-black">L'Église est une famille.</h4>
              <p className="text-gray-500 font-medium">Nous sommes appelés à vivre en communauté authentique, portant les fardeaux les uns des autres dans l'amour.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LE COUPLE PASTORAL ================= */}
      <section id="couple-pastoral" className="py-32 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 text-black">Le Couple Pastoral.</h2>
            <p className="text-gray-500 text-lg max-w-2xl font-medium mx-auto">
              Rencontrez le couple qui servent, dirigent et prennent soin de la communauté de MDLP au quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-16 max-w-2xl mx-auto items-end">
            {team.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer flex flex-col"
              >
                <div className="bg-gray-100 mb-6 overflow-hidden relative flex-1">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1 text-black">{member.name}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/biographie" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition">
              Lire la biographie du pasteur Samuel Panzu <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= APPEL À L'ACTION ================= */}
      <section className="py-32 bg-black text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter uppercase leading-tight">
            PRÊT À NOUS RENDRE VISITE ?
          </h2>
          <Link href="/contact" className="inline-block bg-gold text-black px-12 py-5 font-black uppercase tracking-widest text-xs hover:bg-white transition">
            Planifier ma visite
          </Link>
        </div>
      </section>

      <Footer />

    </div>
  );
}
