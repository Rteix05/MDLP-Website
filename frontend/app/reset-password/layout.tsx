import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réinitialisation du mot de passe – MDLP',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
