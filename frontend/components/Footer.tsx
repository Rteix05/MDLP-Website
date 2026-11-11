import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="text-2xl font-black tracking-tighter">
          MDLP<span className="text-gold">.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          <Link href="/" className="hover:text-gold transition">Accueil</Link>
          <Link href="/biographie" className="hover:text-gold transition">Biographie</Link>
          <Link href="/don" className="hover:text-gold transition">Donner</Link>
          <Link href="/contact" className="hover:text-gold transition">Contact</Link>
        </div>
        <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} MDLP Church.
        </p>
      </div>
    </footer>
  );
}
