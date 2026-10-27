import { headers } from 'next/headers';

/** Ignore form-provided origins. Only server-approved hosts may receive auth links. */
export function approvedAuthOrigin(
  host: string | null,
  deploymentHost = process.env.VERCEL_URL,
  development = process.env.NODE_ENV !== 'production',
) {
  const candidate = host?.split(',')[0]?.trim();
  if (
    candidate === 'go.iatron.com.br' ||
    candidate === 'iatron-web-staging.vercel.app'
  )
    return 'https://go.iatron.com.br';
  if (
    candidate &&
    candidate === deploymentHost &&
    /^[a-z0-9.-]+\.vercel\.app$/i.test(candidate)
  )
    return `https://${candidate}`;
  if (
    development &&
    candidate &&
    /^(localhost|127\.0\.0\.1)(:\d{1,5})?$/.test(candidate)
  ) {
    try {
      return new URL(`http://${candidate}`).origin;
    } catch {
      /* Invalid port. */
    }
  }
  return 'https://go.iatron.com.br';
}

export async function authOrigin() {
  const h = await headers();
  return approvedAuthOrigin(h.get('x-forwarded-host') ?? h.get('host'));
}
