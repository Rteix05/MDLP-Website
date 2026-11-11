import Link from 'next/link';
import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LEGAL_INFO } from '@/lib/legalInfo';

/** Mise en forme commune des pages juridiques (mentions légales, CGU, dons, confidentialité, accessibilité) */

export const legalLinkClass = 'font-semibold text-black underline underline-offset-4 hover:text-gray-500';

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar theme="light" />
      <header className="pt-36 pb-12 px-6 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition">
            ← Retour à l&apos;accueil
          </Link>
          <h1 className="mt-6 text-4xl md:text-6xl font-black uppercase tracking-tighter text-black leading-[0.95]">{title}</h1>
          <p className="mt-4 text-sm text-gray-500">Dernière mise à jour : {LEGAL_INFO.miseAJour}</p>
        </div>
      </header>
      <main id="contenu-principal" className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 p-8 sm:p-12 space-y-10 text-[15px] leading-relaxed text-gray-600">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function LegalArticle({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-28">
      <h2 id={id} className="mb-3 text-lg font-black uppercase tracking-tight text-black">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-black">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

/** Sommaire cliquable des articles */
export function LegalToc({ label, articles }: { label: string; articles: { id: string; title: string }[] }) {
  return (
    <nav aria-label={label} className="bg-gray-50 border border-gray-200 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-black">Sommaire</p>
      <ol className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 text-sm">
        {articles.map((a) => (
          <li key={a.id}><a href={`#${a.id}`} className={legalLinkClass}>{a.title}</a></li>
        ))}
      </ol>
    </nav>
  );
}

/** Valeur légale connue, ou repère visible « À compléter » tant qu'elle ne l'est pas */
export function LegalValue({ value, label }: { value: string | null; label: string }) {
  if (value) return <>{value}</>;
  return <mark className="bg-amber-100 px-1.5 py-0.5 font-medium text-amber-900">[À compléter : {label}]</mark>;
}

export function ContactEmail() {
  return <a href={`mailto:${LEGAL_INFO.email}`} className={legalLinkClass}>{LEGAL_INFO.email}</a>;
}

/** Bloc d'identification de l'association (lignes « Libellé : valeur ») */
export function LegalIdentity({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="space-y-1 bg-gray-50 border border-gray-200 p-5">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap gap-x-2">
          <dt className="font-semibold text-black">{row.label} :</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
