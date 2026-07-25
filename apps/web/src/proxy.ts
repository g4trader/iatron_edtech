import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';

const STAGING_ALIAS = 'iatron-web-staging.vercel.app';
const STAGING_CANONICAL_HOST = 'go.iatron.com.br';

export function canonicalStagingUrl(request: NextRequest) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = (
    forwardedHost ??
    request.headers.get('host') ??
    request.nextUrl.host
  )
    .split(':')[0]
    ?.toLowerCase();
  if (host !== STAGING_ALIAS) return null;
  const canonical = request.nextUrl.clone();
  canonical.protocol = 'https';
  canonical.host = STAGING_CANONICAL_HOST;
  return canonical;
}

export async function proxy(request: NextRequest) {
  const canonical = canonicalStagingUrl(request);
  if (canonical) return NextResponse.redirect(canonical, 308);
  if (isAuthBypassEnabled(process.env)) return NextResponse.next();
  let response = NextResponse.next({ request });
  const config = getSupabaseConfig();
  const client = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const {
    data: { user },
  } = await client.auth.getUser();
  const isApp = request.nextUrl.pathname.startsWith('/app');
  if (!user && isApp) {
    const login = new URL('/login', request.url);
    login.searchParams.set(
      'returnTo',
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(login);
  }
  if (user && isApp) {
    const { data: profile } = await client
      .from('profiles')
      .select('onboarding_status')
      .eq('id', user.id)
      .single();
    const isOnboarding = request.nextUrl.pathname === '/app/onboarding';
    if (profile?.onboarding_status !== 'completed' && !isOnboarding)
      return NextResponse.redirect(new URL('/app/onboarding', request.url));
    if (profile?.onboarding_status === 'completed' && isOnboarding)
      return NextResponse.redirect(new URL('/app', request.url));
  }
  return response;
}
export const config = {
  matcher: [
    '/app/:path*',
    '/login',
    '/cadastro',
    '/esqueci-minha-senha',
    '/redefinir-senha',
  ],
};
