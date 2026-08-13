// Ce fichier est un worker minimal pour Cloudflare
// Il permet de servir l'application Next.js

export default {
  async fetch(request: Request, env: any, ctx: any) {
    // Rediriger vers le serveur Next.js
    return new Response('Hello from Cloudflare Worker!', {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};
