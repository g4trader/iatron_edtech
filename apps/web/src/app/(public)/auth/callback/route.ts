import { NextResponse } from 'next/server';
import { safeReturnTo } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
export async function GET(request: Request) {
  const url = new URL(request.url);
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
    if (!error)
      return NextResponse.redirect(
        new URL(safeReturnTo(url.searchParams.get('next')), url.origin),
      );
  }
  return NextResponse.redirect(
    new URL('/login?erro=Link inválido ou expirado.', url.origin),
  );
}
