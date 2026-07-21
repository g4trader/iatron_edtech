import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDirectory = path.dirname(fileURLToPath(import.meta.url));

if (process.env.VERCEL === '1') {
  const requiredPublicVariables = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  ];
  const missing = requiredPublicVariables.filter(
    (name) => !process.env[name]?.trim(),
  );
  if (missing.length > 0) {
    throw new Error(`Missing Vercel configuration: ${missing.join(', ')}`);
  }
  for (const name of ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_SUPABASE_URL']) {
    const value = process.env[name];
    if (value && ['localhost', '127.0.0.1'].includes(new URL(value).hostname)) {
      throw new Error(`${name} cannot target localhost in Vercel.`);
    }
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@iatron/ui'],
  turbopack: { root: path.resolve(appDirectory, '../..') },
  typedRoutes: true,
};

export default nextConfig;
