/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Ini membantu Next.js mengabaikan warnings terkait
    // hot-reloading dari Socket.IO di mode development
    config.externals = {
      ...config.externals,
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    };
    return config;
  },
};

module.exports = nextConfig;
