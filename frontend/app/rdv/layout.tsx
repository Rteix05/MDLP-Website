import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prendre rendez-vous – MDLP | Montagne de la Prière',
  description: 'Prenez rendez-vous en visioconférence avec le pasteur Samuel Panzu. Créneaux disponibles les mardis et jeudis de 14h à 17h30.',
  openGraph: {
    title: 'Prendre rendez-vous – MDLP',
    description: 'Réservez un créneau en visio avec le pasteur Samuel Panzu.',
    url: 'https://www.samuelpanzutv.com/rdv',
    siteName: 'MDLP – Montagne de la Prière',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
