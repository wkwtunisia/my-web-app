/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  output: 'standalone',
  reactStrictMode: true,
  // swcMinify est maintenant activé par défaut dans Next.js 15
  experimental: {
    // Configuration pour Cloudflare
    serverActions: true,
  },
};

module.exports = nextConfig;
