import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
