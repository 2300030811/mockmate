/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Inject Azure URL at build time so it is ALWAYS available
  env: {
    AZURE_QUESTIONS_URL:
      "https://mockmatequiz.blob.core.windows.net/quizzes/aws_questions_verified.json",
  },


};

module.exports = nextConfig;
