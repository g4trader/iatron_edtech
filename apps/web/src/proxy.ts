import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { safeReturnTo, withReturnTo } from '@/lib/safe-return-to';
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
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    'x-iatron-return-to',
    safeReturnTo(
      request.nextUrl.pathname === '/app/onboarding'
        ? request.nextUrl.searchParams.get('returnTo')
        : `${request.nextUrl.pathname}${request.nextUrl.search}`,
    ),
  );
  if (isAuthBypassEnabled(process.env))
    return NextResponse.next({ request: { headers: requestHeaders } });
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const config = getSupabaseConfig();
  const client = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        requestHeaders.set('cookie', request.cookies.toString());
        response = NextResponse.next({ request: { headers: requestHeaders } });
        items.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const {
    data: { user },
  } = await client.auth.getUser();
  const redirectWithCookies = (destination: URL) => {
    const redirected = NextResponse.redirect(destination);
    for (const cookie of response.cookies.getAll())
      redirected.cookies.set(cookie);
    return redirected;
  };
  const isApp = request.nextUrl.pathname.startsWith('/app');
  if (!user && isApp) {
    const login = new URL('/login', request.url);
    login.searchParams.set(
      'returnTo',
      requestHeaders.get('x-iatron-return-to') ?? '/app',
    );
    return redirectWithCookies(login);
  }
  if (user && isApp) {
    const { data: profile } = await client
      .from('profiles')
      .select('onboarding_status')
      .eq('id', user.id)
      .single();
    const isOnboarding = request.nextUrl.pathname === '/app/onboarding';
    if (profile?.onboarding_status !== 'completed' && !isOnboarding)
      return redirectWithCookies(
        new URL(
          withReturnTo(
            '/app/onboarding',
            `${request.nextUrl.pathname}${request.nextUrl.search}`,
          ),
          request.url,
        ),
      );
    if (profile?.onboarding_status === 'completed' && isOnboarding)
      return redirectWithCookies(
        new URL(
          safeReturnTo(request.nextUrl.searchParams.get('returnTo')),
          request.url,
        ),
      );
  }
  return response;
}
export const config = {
  matcher: [
    '/app/:path*',
    '/review/:path*',
    '/review-preview/:path*',
    '/editorial/:path*',
    '/admin/:path*',
    '/login',
    '/cadastro',
    '/esqueci-minha-senha',
    '/redefinir-senha',
  ],
};
