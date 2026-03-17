'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de l\'envoi');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* On utilise le thème "home" car on a un Hero sombre au début */}
      <Navbar theme="home" />

      {/* ================= HERO SECTION (Dark) ================= */}
      <header className="relative h-[60vh] w-full bg-black flex flex-col justify-center items-center text-center overflow-hidden">
        {/* Background Image avec overlay fort */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: "url('/church2.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto px-6 mt-20"
        >
          <h2 className="text-white/70 text-xs md:text-sm font-bold uppercase tracking-[0.4em] mb-6">
            Une question ? Un besoin ?
          </h2>
          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase">
            NOUS <br/> CONTACTER.
          </h1>
        </motion.div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24">
          
          {/* === COLONNE GAUCHE : INFORMATIONS === */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-3xl md:text-5xl font-black tracking-tight uppercase mb-8">
              L'église est là <br/> pour vous.
            </h3>
            <p className="text-gray-500 font-medium text-lg mb-12 leading-relaxed">
              Que vous ayez une question sur nos cultes, besoin d'accompagnement pastoral, ou simplement l'envie de discuter, n'hésitez pas à joindre notre secrétariat.
            </p>

            <div className="space-y-10">
              {/* Adresse */}
              <div className="flex gap-6 group">
                <div className="h-14 w-14 bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100 group-hover:bg-black group-hover:text-white transition-colors duration-300 flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Adresse</h4>
                  <p className="text-xl font-black text-gray-900 uppercase tracking-tight">5 Allée Bienvenue</p>
                  <p className="text-gray-500 font-medium">93130 Noisy-Le-Grand, France</p>
                </div>
              </div>

              {/* Téléphone Secrétariat */}
              <div className="flex gap-6 group">
                <div className="h-14 w-14 bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100 group-hover:bg-black group-hover:text-white transition-colors duration-300 flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Secrétariat</h4>
                  <p className="text-xl font-black text-gray-900 uppercase tracking-tight">01 43 00 00 00</p>
                  <p className="text-gray-500 font-medium">Du Mardi au Vendredi (10h - 17h)</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-6 group">
                <div className="h-14 w-14 bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100 group-hover:bg-black group-hover:text-white transition-colors duration-300 flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email</h4>
                  <p className="text-xl font-black text-gray-900 uppercase tracking-tight">contact@mdlp.fr</p>
                  <p className="text-gray-500 font-medium">Nous répondons sous 48h.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* === COLONNE DROITE : FORMULAIRE === */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gray-50 p-8 md:p-12 rounded-[30px] border border-gray-100"
          >
            <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Envoyer un message</h3>

            {success && (
              <div className="mb-8 p-6 bg-green-50 text-green-800 rounded-2xl border border-green-200 text-sm font-bold flex items-center gap-3 animate-in fade-in">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">✅</div>
                Votre message a été envoyé avec succès !
              </div>
            )}

            {error && (
              <div className="mb-8 p-6 bg-red-50 text-red-800 rounded-2xl border border-red-200 text-sm font-bold flex items-center gap-3">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">❌</div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Votre Nom</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-gray-200 p-4 rounded-xl focus:border-black focus:ring-0 outline-none transition font-medium text-sm placeholder-gray-300"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Votre Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border border-gray-200 p-4 rounded-xl focus:border-black focus:ring-0 outline-none transition font-medium text-sm placeholder-gray-300"
                    placeholder="jean@exemple.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sujet</label>
                <select 
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-white border border-gray-200 p-4 rounded-xl focus:border-black focus:ring-0 outline-none transition font-medium text-sm text-gray-700"
                >
                  <option value="" disabled>Sélectionnez un sujet</option>
                  <option value="infos">Informations sur l'église</option>
                  <option value="priere">Demande de prière</option>
                  <option value="benevolat">Devenir bénévole</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Message</label>
                <textarea 
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-white border border-gray-200 p-4 rounded-xl focus:border-black focus:ring-0 outline-none transition font-medium text-sm placeholder-gray-300 resize-none"
                  placeholder="Comment pouvons-nous vous aider ?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white px-8 py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-800 transition transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:transform-none"
              >
                {loading ? 'Envoi en cours...' : (
                  <>Envoyer <Send size={16} /></>
                )}
              </button>
            </form>
          </motion.div>

        </div>
      </section>

      <Footer />

    </div>
  );
}