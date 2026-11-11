'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-black selection:text-white">
      
      {/* On utilise le thème "home" car on a un Hero sombre au début */}
      <Navbar theme="home" />

      {/* ================= HERO SECTION (Dark) ================= */}
      {/* MODIFICATION ICI : h-[80vh] remplacé par h-screen */}
      <header className="relative h-screen w-full bg-black flex flex-col justify-center items-center text-center overflow-hidden">
        {/* Background Image avec overlay fort */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
          style={{ backgroundImage: "url('/church4.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto px-6 mt-20"
        >
          <h2 className="text-white/70 text-xs md:text-sm font-bold uppercase tracking-[0.4em] mb-6">
            Notre Histoire
          </h2>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase">
            NOUS SOMMES <br/> L'ÉGLISE MDLP.
          </h1>
        </motion.div>
      </header>

      {/* ================= MANIFESTO / VISION ================= */}
      <section className="py-32 px-6 bg-white text-center">
        <div className="max-w-4xl mx-auto">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-10"
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
      <section className="py-20 bg-[#0a0a0a] text-white">
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
              <h3 className="text-gray-400 font-bold tracking-[0.2em] uppercase text-xs">Tous les dimanches • 10h00 - 13h00</h3>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              Chaque dimanche, nous nous rassemblons pour célébrer Jésus. Attendez-vous à des temps de louange passionnés, un message biblique profond et ancré dans la réalité, et une communauté authentique prête à vous accueillir tel que vous êtes.
            </p>
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white">
                <Clock size={18} className="text-gray-500" /> 10:00 - 13:00
              </div>
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white">
                <MapPin size={18} className="text-gray-500" /> Noisy-Le-Grand
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
              <h3 className="text-gray-400 font-bold tracking-[0.2em] uppercase text-xs">École du dimanche • 10h00 - 13h00</h3>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              Nous croyons que l'église doit être le meilleur moment de la semaine pour vos enfants. Pendant que vous assistez au culte, vos enfants (de 3 à 12 ans) grandissent dans leur foi dans un environnement sécurisé, ludique et adapté à leur âge.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white border-b-2 border-white pb-1 hover:text-gray-400 hover:border-gray-400 transition mt-4">
              En savoir plus sur l'accueil des enfants <ArrowRight size={16} />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* ================= SUGGESTION : NOS VALEURS ================= */}
      <section className="py-32 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-16">Ce que nous croyons</h3>
            <div className="grid md:grid-cols-3 gap-12">
                <div>
                    <h4 className="text-xl font-black uppercase tracking-tight mb-4">La Bible est notre boussole.</h4>
                    <p className="text-gray-500 font-medium">Nous croyons que les Écritures sont la parole infaillible de Dieu, notre autorité finale pour la foi et la vie.</p>
                </div>
                <div>
                    <h4 className="text-xl font-black uppercase tracking-tight mb-4">Jésus est le centre.</h4>
                    <p className="text-gray-500 font-medium">Tout ce que nous faisons pointe vers l'œuvre achevée de Christ à la croix. Il est le seul chemin, la vérité et la vie.</p>
                </div>
                <div>
                    <h4 className="text-xl font-black uppercase tracking-tight mb-4">L'Église est une famille.</h4>
                    <p className="text-gray-500 font-medium">Nous sommes appelés à vivre en communauté authentique, portant les fardeaux les uns des autres dans l'amour.</p>
                </div>
            </div>
        </div>
      </section>

      {/* ================= L'ÉQUIPE PASTORALE (Style Editorial) ================= */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6">Le Couple Pastoral.</h2>
            <p className="text-gray-500 text-lg max-w-2xl font-medium mx-auto">
              Rencontrez le couple qui servent, dirigent et prennent soin de la communauté de MDLP au quotidien.
            </p>
          </div>

          {/* Grille de l'équipe (Style "Portrait" très épuré) */}
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
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1">{member.name}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/biographie" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition">
              Lire la biographie du pasteur Samuel Panzu <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION (Footer Transition) ================= */}
      <section className="py-32 bg-black text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tighter uppercase leading-tight">
            PRÊT À NOUS RENDRE VISITE ?
          </h2>
          <Link href="/contact" className="inline-block bg-white text-black px-12 py-5 font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition">
            Planifier ma visite
          </Link>
        </div>
      </section>

      <Footer />

    </div>
  );
}