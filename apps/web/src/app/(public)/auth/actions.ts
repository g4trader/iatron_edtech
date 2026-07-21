'use server';

import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createClient } from '@/lib/supabase/server';
import { safeReturnTo } from '@/lib/auth';

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim();
}
function errorRedirect(path: string, message: string): never {
  redirect(`${path}?erro=${encodeURIComponent(message)}` as Route);
}

export async function login(formData: FormData) {
  const client = await createClient();
  const returnTo = safeReturnTo(value(formData, 'returnTo'));
  const { error } = await client.auth.signInWithPassword({
    email: value(formData, 'email'),
    password: value(formData, 'password'),
  });
  if (error) errorRedirect('/login', 'E-mail ou senha inválidos.');
  redirect(returnTo as Route);
}

export async function signup(formData: FormData) {
  const client = await createClient();
  const origin = value(formData, 'origin');
  const { error } = await client.auth.signUp({
    email: value(formData, 'email'),
    password: value(formData, 'password'),
    options: {
      data: { display_name: value(formData, 'displayName') },
      emailRedirectTo: `${origin}/auth/callback?next=/app/onboarding`,
    },
  });
  if (error)
    errorRedirect(
      '/cadastro',
      'Não foi possível criar a conta. Revise os dados.',
    );
  redirect('/login?mensagem=Confira seu e-mail para confirmar o cadastro.');
}

export async function recoverPassword(formData: FormData) {
  const client = await createClient();
  const origin = value(formData, 'origin');
  await client.auth.resetPasswordForEmail(value(formData, 'email'), {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  });
  redirect(
    '/login?mensagem=Se o e-mail estiver cadastrado, enviaremos as instruções.',
  );
}

export async function updatePassword(formData: FormData) {
  const client = await createClient();
  const { error } = await client.auth.updateUser({
    password: value(formData, 'password'),
  });
  if (error)
    errorRedirect('/redefinir-senha', 'O link expirou ou a senha é inválida.');
  redirect('/app');
}

export async function logout() {
  const client = await createClient();
  await client.auth.signOut();
  redirect('/login');
}
