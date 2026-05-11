import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merci pour votre don – MDLP',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
