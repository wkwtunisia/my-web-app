/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  // Pour Next.js 15
  experimental: {
    // Configuration spécifique à Next.js 15
  },
};

module.exports = nextConfig;
