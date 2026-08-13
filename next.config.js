/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  reactStrictMode: true,
  // Désactiver les fonctionnalités expérimentales
  experimental: {
    serverActions: true,
  },
  // Configuration pour Cloudflare
  output: 'standalone',
  swcMinify: false, // Désactiver swcMinify pour Cloudflare
};

module.exports = nextConfig;
