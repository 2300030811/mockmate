/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Azure Static Web Apps (Free Tier)
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,

  // Packages that should only run in Node.js (not bundled for Edge)
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', '@azure/storage-blob', '@azure/ai-form-recognizer', 'groq-sdk'],
  },

  eslint: {
    // ignoreDuringBuilds: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
