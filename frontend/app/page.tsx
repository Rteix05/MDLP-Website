'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, ArrowRight, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// --- DONNÉES DU CARROUSEL ---
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
    link: '/about',
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

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Autoplay du carrousel
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
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white selection:bg-black selection:text-white">

      {/* ================= NAVBAR ================= */}
      <Navbar theme="home" />

      {/* ================= HERO CAROUSEL ================= */}
      <header className="relative h-screen w-full bg-black overflow-hidden flex flex-col justify-center items-center text-center">
        
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Image de fond avec effet de zoom très lent */}
            <div 
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear ${index === currentSlide ? 'scale-105' : 'scale-100'}`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            ></div>
            
            {/* Overlay sombre pour la lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30"></div>
          </div>
        ))}

        {/* Contenu du texte synchronisé avec le carrousel */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] mb-6">
                {slide.subtitle}
              </h2>
              <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white mb-10 leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
                {slide.title}
              </h1>
              
              <Link 
                href={slide.link} 
                className="inline-block bg-white text-black px-10 py-5 font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-gray-200 transition-colors"
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
                        className={`h-1 transition-all duration-300 ${i === currentSlide ? 'w-8 md:w-12 bg-white' : 'w-4 bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>

            {/* Flèches */}
            <div className="flex gap-2 md:gap-4">
                <button onClick={prevSlide} className="p-3 border border-white/20 text-white rounded-full hover:bg-white hover:text-black transition backdrop-blur-sm">
                    <ChevronLeft size={18} />
                </button>
                <button onClick={nextSlide} className="p-3 border border-white/20 text-white rounded-full hover:bg-white hover:text-black transition backdrop-blur-sm">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
      </header>

      {/* ================= LATEST MESSAGE SECTION ================= */}
      <section className="py-32 bg-white text-black border-b border-gray-100">
         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
            >
               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-4">Message de la semaine</h3>
               <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter uppercase leading-[0.95]">
                  La puissance <br/>de la grâce.
               </h2>
               <p className="text-gray-500 text-lg mb-10 font-medium leading-relaxed">
                  Découvrez le message de ce dimanche. Une invitation à redécouvrir l'amour inconditionnel de Dieu, peu importe votre passé ou vos échecs.
               </p>
               <Link href="/live" className="inline-flex items-center gap-2 border-b-2 border-black pb-1 text-xs font-bold uppercase tracking-widest hover:text-gray-500 hover:border-gray-500 transition">
                  Regarder le message <ArrowRight size={14} className="ml-1"/>
               </Link>
            </motion.div>

            <motion.a
               href="https://www.youtube.com/@SamuelPanzuTV"
               target="_blank"
               rel="noopener noreferrer"
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="aspect-[4/3] bg-gray-100 relative group cursor-pointer overflow-hidden rounded-xl md:rounded-none block"
            >
               <div 
                  className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                  style={{backgroundImage: "url('/church10.jpg')"}}
               ></div>
               <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center pl-1.5 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                     <Play className="text-black w-8 h-8" fill="currentColor" />
                  </div>
               </div>
            </motion.a>

         </div>
      </section>

      {/* ================= NEXT STEPS (Cards) ================= */}
      <section className="py-32 bg-gray-50">
         <div className="max-w-7xl mx-auto px-6">
            
            <div className="mb-20 text-center md:text-left">
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6">Prochaines Étapes.</h2>
               <p className="text-gray-500 text-lg max-w-2xl font-medium">L'église n'est pas un événement auquel on assiste, c'est une famille à laquelle on appartient. Voici comment vous impliquer.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {/* Card 1 */}
               <div className="bg-white p-12 border border-gray-100 hover:border-black transition-colors duration-300 group">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Le Baptême</h3>
                  <p className="text-gray-500 font-medium mb-12 leading-relaxed">Déclarez publiquement votre foi en Jésus. C'est la prochaine étape naturelle de tout croyant.</p>
                  <Link href="/contact" className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-gray-500 transition">
                     S'inscrire <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>

               {/* Card 2 */}
               <div className="bg-white p-12 border border-gray-100 hover:border-black transition-colors duration-300 group">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Le Bénévolat</h3>
                  <p className="text-gray-500 font-medium mb-12 leading-relaxed">De l'accueil à la technique, en passant par les enfants, découvrez la joie de servir les autres.</p>
                  <Link href="/contact" className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-gray-500 transition">
                     Rejoindre une équipe <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>

               {/* Card 3 */}
               <div className="bg-black text-white p-12 border border-black transition-transform duration-300 group hover:-translate-y-2 shadow-2xl shadow-black/10">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Faire un Don</h3>
                  <p className="text-gray-400 font-medium mb-12 leading-relaxed">Votre générosité permet à l'église d'avoir un impact réel dans notre ville et au-delà.</p>
                  <Link href="/don" className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-white hover:text-gray-300 transition border-b border-transparent hover:border-gray-300 pb-1 w-fit">
                     Soutenir l'œuvre <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>

         </div>
      </section>

      {/* ================= INFO GRID (Clean Monochrome) ================= */}
      <section className="bg-white">
         <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-6 py-16">
            
            {/* Culte */}
            <div className="p-16 text-center group border border-gray-200 rounded-xl hover:border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
               <Clock size={32} className="mx-auto mb-8 text-black" strokeWidth={1.5} />
               <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Cultes</h3>
               <p className="text-gray-500 font-medium text-sm mb-2">Tous les dimanches</p>
               <p className="text-3xl font-black text-black tracking-tighter">10:00</p>
            </div>

            {/* Adresse */}
            <div className="p-16 text-center group border border-gray-200 rounded-xl hover:border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
               <MapPin size={32} className="mx-auto mb-8 text-black" strokeWidth={1.5} />
               <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Localisation</h3>
               <p className="text-gray-500 font-medium text-sm mb-2">5 Allée Bienvenue</p>
               <p className="text-xl font-black text-black tracking-tight mt-2 uppercase">Noisy-Le-Grand</p>
            </div>

            {/* Calendrier */}
            <div className="p-16 text-center group border border-gray-200 rounded-xl hover:border-black hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center items-center">
               <Calendar size={32} className="mx-auto mb-8 text-black" strokeWidth={1.5} />
               <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Événements</h3>
               <Link href="/planning" className="inline-flex items-center gap-2 border-b-2 border-black pb-1 text-[10px] font-bold uppercase tracking-widest hover:text-gray-500 hover:border-gray-500 transition mt-2">
                 Voir le planning <ArrowRight size={14} />
               </Link>
            </div>

         </div>
      </section>

      {/* Espace gris de transition */}
      <div className="py-16 bg-gray-50"></div>

      {/* ================= GET INVOLVED (Brutalist Dark Footer Transition) ================= */}
      <section className="py-32 bg-[#0a0a0a] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-6">Notre Mission</h3>
            <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter uppercase leading-[0.9]">
              FAIRE DES DISCIPLES.<br/>VIVRE L'ÉVANGILE.
            </h2>
            <p className="text-gray-400 text-lg md:text-xl mb-14 leading-relaxed max-w-2xl mx-auto font-medium">
              Peu importe votre histoire, vos questions ou vos doutes, il y a une place pour vous dans cette famille. Venez tel que vous êtes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-white text-black px-10 py-5 font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition">
                Rejoindre l'église
              </Link>
              <Link href="/contact" className="border border-gray-700 text-white px-10 py-5 font-black uppercase tracking-widest text-[10px] hover:border-white transition">
                Nous contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

    </div>
  );
}