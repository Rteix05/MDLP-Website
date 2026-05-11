import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MDLP – Montagne de la Prière",
    template: "%s",
  },
  description: "Église chrétienne Montagne de la Prière à Noisy-le-Grand, fondée par le pasteur Samuel Panzu. Enseignements bibliques, cultes en direct, dons et rendez-vous en ligne.",
  metadataBase: new URL("https://www.samuelpanzutv.com"),
  openGraph: {
    title: "MDLP – Montagne de la Prière",
    description: "Église chrétienne à Noisy-le-Grand fondée par le pasteur Samuel Panzu. Cultes, enseignements et dons en ligne.",
    url: "https://www.samuelpanzutv.com",
    siteName: "MDLP – Montagne de la Prière",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MDLP – Montagne de la Prière",
    description: "Église chrétienne à Noisy-le-Grand fondée par le pasteur Samuel Panzu.",
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
