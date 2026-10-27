import { NextResponse } from 'next/server';
import {
  safeCallbackDestination,
  safeReturnTo,
  withReturnTo,
} from '@/lib/safe-return-to';
import { createClient } from '@/lib/supabase/server';
export async function GET(request: Request) {
  const url = new URL(request.url);
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
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  const destination = new URL(next, url.origin);
  const returnTo = next.startsWith('/redefinir-senha')
    ? destination.searchParams.get('returnTo')
    : next;
  const login = new URL(
    withReturnTo('/login', safeReturnTo(returnTo)),
    url.origin,
  );
  login.searchParams.set(
    'erro',
    'Link inválido ou expirado. Entre novamente ou solicite um novo link.',
  );
  return NextResponse.redirect(login);
}
