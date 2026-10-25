import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/**': ['./prisma/**/*', './dev.db'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
