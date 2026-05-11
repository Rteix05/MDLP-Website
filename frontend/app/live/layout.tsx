import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live – MDLP | Montagne de la Prière',
  description: 'Suivez les cultes et événements en direct de l\'église Montagne de la Prière sur YouTube et Facebook.',
  openGraph: {
    title: 'Live – MDLP | Montagne de la Prière',
    description: 'Suivez les cultes et événements en direct de l\'église Montagne de la Prière.',
    url: 'https://www.samuelpanzutv.com/live',
    siteName: 'MDLP – Montagne de la Prière',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
