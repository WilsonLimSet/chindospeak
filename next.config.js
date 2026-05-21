/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle for Docker / Cloud Run.
  output: 'standalone',
};

module.exports = nextConfig;