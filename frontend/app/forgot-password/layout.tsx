import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mot de passe oublié – MDLP',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
