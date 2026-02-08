/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Azure Static Web Apps (Free Tier)
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,




  eslint: {
    // ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', '@azure/storage-blob', '@azure/ai-form-recognizer', 'groq-sdk'],
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
