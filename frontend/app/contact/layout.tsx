import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact – MDLP | Montagne de la Prière',
  description: 'Contactez l\'église Montagne de la Prière à Noisy-le-Grand. Posez vos questions, demandez des informations ou prenez contact avec notre équipe.',
  openGraph: {
    title: 'Contact – MDLP | Montagne de la Prière',
    description: 'Contactez l\'église Montagne de la Prière à Noisy-le-Grand.',
    url: 'https://www.samuelpanzutv.com/contact',
    siteName: 'MDLP – Montagne de la Prière',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
