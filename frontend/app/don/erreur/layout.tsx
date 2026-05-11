import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paiement annulé – MDLP',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
