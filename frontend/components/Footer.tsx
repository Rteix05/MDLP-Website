import Link from 'next/link';
import { ArrowRight, Clock, Facebook, MapPin, Phone, Youtube } from 'lucide-react';

const navigation = [
  { href: '/', label: 'Accueil' },
  { href: '/biographie', label: 'Biographie' },
  { href: '/live', label: 'Direct' },
  { href: '/planning', label: 'Calendrier' },
  { href: '/rdv', label: 'Prendre rendez-vous' },
  { href: '/contact', label: 'Contact' },
];

const legal = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/cgu', label: 'CGU' },
  { href: '/conditions-des-dons', label: 'Conditions des dons' },
  { href: '/politique-de-confidentialite', label: 'Confidentialité' },
  { href: '/accessibilite', label: 'Accessibilité' },
];

const socials = [
  { href: 'https://www.youtube.com/@SamuelPanzuTV', label: 'YouTube', icon: Youtube },
  { href: 'https://www.facebook.com/samuel.panzu.7', label: 'Facebook', icon: Facebook },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Bandeau d'appel au don */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight max-w-xl">
            Soutenez l&apos;œuvre de <span className="text-gold">La Montagne de la Prière</span>.
          </p>
          <Link
            href="/don"
            className="inline-flex items-center gap-2 bg-gold text-black px-8 py-4 font-black uppercase tracking-widest text-xs hover:bg-white transition shrink-0"
          >
            Faire un don <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Colonnes */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr]">
        <div>
          <Link href="/" className="text-3xl font-black tracking-tighter">
            MDLP<span className="text-gold">.</span>
          </Link>
          <p className="mt-4 text-sm text-white/70 font-medium leading-relaxed max-w-xs">
            La Montagne de la Prière Ministries — église fondée par le pasteur Samuel Panzu à Noisy-le-Grand.
          </p>
          <div className="flex gap-3 mt-6">
            {socials.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-10 h-10 flex items-center justify-center border border-white/20 hover:bg-gold hover:border-gold hover:text-black transition"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Pied de page">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-5">Navigation</h2>
          <ul className="space-y-3">
            {navigation.map(item => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm font-semibold text-white/80 hover:text-gold transition">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-5">Nous rejoindre</h2>
          <ul className="space-y-4 text-sm text-white/80 font-medium">
            <li className="flex gap-3">
              <Clock size={18} className="text-gold shrink-0 mt-0.5" />
              <span>Culte tous les dimanches<br /><span className="text-white font-bold">10h00 – 13h00</span></span>
            </li>
            <li className="flex gap-3">
              <MapPin size={18} className="text-gold shrink-0 mt-0.5" />
              <span>2 Allée Bienvenue<br />93130 Noisy-le-Grand</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold mb-5">Contact</h2>
          <ul className="space-y-4 text-sm text-white/80 font-medium">
            <li>
              <a href="tel:+33749939520" className="flex gap-3 hover:text-gold transition">
                <Phone size={18} className="text-gold shrink-0 mt-0.5" /> 07 49 93 95 20
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bas de page */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p className="text-center lg:text-left">&copy; {new Date().getFullYear()} La Montagne de la Prière Ministries. Tous droits réservés.</p>
          <nav aria-label="Informations légales" className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {legal.map(item => (
              <Link key={item.href} href={item.href} className="hover:text-gold transition">{item.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-white/30">
            <span title="Version du site">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
            <span aria-hidden="true">·</span>
            <a
              href="https://www.rafaelteixeira.fr"
              target="_blank"
              rel="noopener"
              className="hover:text-white/60 transition"
            >
              Rteix05
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
