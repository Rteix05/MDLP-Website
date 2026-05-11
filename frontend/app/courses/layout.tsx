import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Enseignements – MDLP | Montagne de la Prière',
  description: 'Accédez aux enseignements bibliques, cours et messages du pasteur Samuel Panzu. Téléchargez les ressources de l\'église Montagne de la Prière.',
  openGraph: {
    title: 'Enseignements – MDLP | Montagne de la Prière',
    description: 'Accédez aux enseignements bibliques et cours du pasteur Samuel Panzu.',
    url: 'https://www.samuelpanzutv.com/courses',
    siteName: 'MDLP – Montagne de la Prière',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
