import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion – MDLP | Montagne de la Prière',
  description: 'Connectez-vous à votre espace membre MDLP pour accéder aux enseignements, à votre historique de dons et vos rendez-vous.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
