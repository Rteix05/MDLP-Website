import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos – MDLP | Montagne de la Prière',
  description: 'Découvrez le pasteur Samuel Panzu et son épouse Filomena, fondateurs de l\'église Montagne de la Prière à Noisy-le-Grand.',
  openGraph: {
    title: 'À propos – MDLP | Montagne de la Prière',
    description: 'Découvrez le pasteur Samuel Panzu et son épouse Filomena, fondateurs de l\'église Montagne de la Prière à Noisy-le-Grand.',
    url: 'https://www.samuelpanzutv.com/about',
    siteName: 'MDLP – Montagne de la Prière',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
