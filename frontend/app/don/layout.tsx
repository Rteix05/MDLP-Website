import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Faire un don – MDLP | Montagne de la Prière',
  description: 'Soutenez l\'œuvre de l\'église Montagne de la Prière. Faites un don en ligne sécurisé par carte bancaire ou PayPal.',
  openGraph: {
    title: 'Faire un don – MDLP | Montagne de la Prière',
    description: 'Soutenez l\'œuvre de l\'église Montagne de la Prière avec un don en ligne sécurisé.',
    url: 'https://www.samuelpanzutv.com/don',
    siteName: 'MDLP – Montagne de la Prière',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
