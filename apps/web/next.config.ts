import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDirectory = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@iatron/ui'],
  turbopack: { root: path.resolve(appDirectory, '../..') },
  typedRoutes: true,
};

export default nextConfig;
