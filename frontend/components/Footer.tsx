import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="text-2xl font-black tracking-tighter">
          MDLP.
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          <Link href="/about" className="hover:text-white transition">À propos</Link>
          <Link href="/don" className="hover:text-white transition">Donner</Link>
          <Link href="/courses" className="hover:text-white transition">Cours</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
        </div>
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} MDLP Church.
        </p>
      </div>
    </footer>
  );
}
