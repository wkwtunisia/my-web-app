const { execSync } = require('child_process');

console.log('🔨 Building for Cloudflare...');

// Étape 1: Build Next.js
console.log('📦 Building Next.js...');
execSync('npm run build', { stdio: 'inherit' });

// Étape 2: Préparer pour Cloudflare
console.log('☁️ Preparing for Cloudflare...');
execSync('cp -r .next/static .next/standalone/.next/static 2>/dev/null || true', { stdio: 'inherit' });

console.log('✅ Build completed successfully!');
