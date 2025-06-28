/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'ignore-loader'
    });
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;