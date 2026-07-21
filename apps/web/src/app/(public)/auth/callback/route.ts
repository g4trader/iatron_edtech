import { NextResponse } from 'next/server';
import { safeReturnTo } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (code) {
    const client = await createClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(safeReturnTo(url.searchParams.get('next')), url.origin),
      );
  }
  return NextResponse.redirect(
    new URL('/login?erro=Link inválido ou expirado.', url.origin),
  );
}
