/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Azure Static Web Apps (Free Tier)
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    // Packages that should only run in Node.js (not bundled for Edge)
    serverComponentsExternalPackages: ['pdf-parse', '@azure/storage-blob', '@azure/ai-form-recognizer', 'groq-sdk'],

    serverActions: {
      // Extra allowed origins for reverse-proxy / preview deployments
      allowedOrigins: process.env.NEXT_PUBLIC_APP_URL
        ? [new URL(process.env.NEXT_PUBLIC_APP_URL).host]
        : [],
    },
  },

  // Tree-shake lucide-react icons for smaller bundles
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
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
            value: 'camera=(self), microphone=(self), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "img-src 'self' data: blob: https://*.supabase.co https://*.githubusercontent.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.groq.com https://*.cognitiveservices.azure.com https://*.upstash.io https://ce.judge0.com https://cdn.jsdelivr.net https://*.blob.core.windows.net",
              "frame-src 'self' https://*.codesandbox.io",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
