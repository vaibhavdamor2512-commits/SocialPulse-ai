/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Output ─────────────────────────────────────────────────────────────────
  output: 'standalone',           // optimised Docker image

  // ── TypeScript ─────────────────────────────────────────────────────────────
  typescript: {
    // Surface tsc errors at build time (do not ignore them)
    ignoreBuildErrors: false,
  },

  // ── ESLint ─────────────────────────────────────────────────────────────────
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ── Images ─────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // ── Environment variables exposed to the browser ────────────────────────────
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // ── Redirects ──────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // ── Headers ────────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
