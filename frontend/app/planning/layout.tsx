import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planning des rendez-vous – MDLP | Montagne de la Prière',
  description: 'Consultez le calendrier et réservez un créneau de rendez-vous avec le pasteur Samuel Panzu en visioconférence.',
  openGraph: {
    title: 'Planning – MDLP',
    description: 'Calendrier de rendez-vous avec le pasteur Samuel Panzu.',
    url: 'https://www.samuelpanzutv.com/planning',
    siteName: 'MDLP – Montagne de la Prière',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
