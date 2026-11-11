import { Metadata } from 'next';

const description = "Biographie du pasteur Samuel Panzu, fondateur de La Montagne de la Prière Ministries (MDLP) : parcours, fondation d'Arbre de Vie Internationale, engagement humanitaire et mission.";

export const metadata: Metadata = {
  title: 'Biographie de Samuel Panzu – MDLP | Montagne de la Prière',
  description,
  openGraph: {
    title: 'Biographie de Samuel Panzu – MDLP | Montagne de la Prière',
    description,
    url: 'https://www.samuelpanzutv.com/biographie',
    siteName: 'MDLP – Montagne de la Prière',
    locale: 'fr_FR',
    type: 'profile',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
