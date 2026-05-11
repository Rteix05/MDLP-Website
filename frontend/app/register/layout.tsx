import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Créer un compte – MDLP | Montagne de la Prière',
  description: 'Créez votre espace membre MDLP pour accéder aux enseignements exclusifs, suivre vos dons et prendre rendez-vous avec le pasteur.',
  openGraph: {
    title: 'Créer un compte – MDLP',
    description: 'Rejoignez la communauté MDLP en ligne.',
    url: 'https://www.samuelpanzutv.com/register',
    siteName: 'MDLP – Montagne de la Prière',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
