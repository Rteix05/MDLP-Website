import type { NextConfig } from "next";
import { version } from "./package.json";

const nextConfig: NextConfig = {
  // Version affichée dans le pied de page (à mettre à jour dans package.json à chaque release)
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  images: {
    domains: ["localhost", "samuelpanzutv.com"], 
    formats: ["image/webp", "image/avif"],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  // Anciennes pages : « À propos » est devenue la home, les cours sont sur l'Académie ESIC
  async redirects() {
    return [
      { source: '/about', destination: '/', permanent: true },
      { source: '/courses', destination: '/', permanent: true },
      { source: '/admin/courses', destination: '/admin', permanent: false },
      { source: '/cgv', destination: '/conditions-des-dons', permanent: true },
    ];
  },
};

export default nextConfig;
