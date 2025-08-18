/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('bufferutil', 'utf-8-validate');
    }
    return config;
  },
};

module.exports = nextConfig;
