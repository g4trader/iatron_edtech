import { NextResponse } from 'next/server';
import {
  safeCallbackDestination,
  safeReturnTo,
  withReturnTo,
} from '@/lib/safe-return-to';
import { createClient } from '@/lib/supabase/server';
import { approvedAuthOrigin } from '@/lib/auth-origin';
export async function GET(request: Request) {
  const url = new URL(request.url);
  // Route Handler request.url may reflect the internal Next host. Keep cookies and redirects on the approved public host.
  const origin = approvedAuthOrigin(
    request.headers.get('x-forwarded-host') ??
      request.headers.get('host') ??
      url.host,
  );
  const next = safeCallbackDestination(url.searchParams.get('next'));
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  if (code || (tokenHash && type === 'recovery')) {
    const client = await createClient();
    const { error } = code
      ? await client.auth.exchangeCodeForSession(code)
      : await client.auth.verifyOtp({
          token_hash: tokenHash!,
          type: 'recovery',
        });
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  const destination = new URL(next, origin);
  const returnTo = next.startsWith('/redefinir-senha')
    ? destination.searchParams.get('returnTo')
    : next;
  const login = new URL(withReturnTo('/login', safeReturnTo(returnTo)), origin);
  login.searchParams.set(
    'erro',
    'Link inválido ou expirado. Entre novamente ou solicite um novo link.',
  );
  return NextResponse.redirect(login);
}
