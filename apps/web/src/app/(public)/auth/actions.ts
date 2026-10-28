'use server';

import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createClient } from '@/lib/supabase/server';
import { workspaceForRoles } from '@/lib/auth';
import { safeReturnTo, withReturnTo } from '@/lib/safe-return-to';
import { authOrigin } from '@/lib/auth-origin';

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim();
}
function feedbackRedirect(
  path: string,
  returnTo: string,
  key: 'erro' | 'mensagem',
  message: string,
): never {
  redirect(
    `${withReturnTo(path, returnTo)}&${key}=${encodeURIComponent(message)}` as Route,
  );
}

export async function login(formData: FormData) {
  const client = await createClient();
  const returnTo = safeReturnTo(value(formData, 'returnTo'));
  const { data, error } = await client.auth.signInWithPassword({
    email: value(formData, 'email'),
    password: value(formData, 'password'),
  });
  if (error || !data.user)
    feedbackRedirect('/login', returnTo, 'erro', 'E-mail ou senha inválidos.');
  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    client
      .from('profiles')
      .select('onboarding_status')
      .eq('id', data.user.id)
      .single(),
    client.from('user_roles').select('role').eq('user_id', data.user.id),
  ]);
  const workspace = workspaceForRoles(roleRows?.map(({ role }) => role) ?? []);
  if (workspace === '/app' && profile?.onboarding_status !== 'completed')
    redirect(withReturnTo('/app/onboarding', returnTo) as Route);
  redirect((returnTo === '/app' ? workspace : returnTo) as Route);
}

export async function signup(formData: FormData) {
  const client = await createClient();
  const returnTo = safeReturnTo(value(formData, 'returnTo'));
  const callback = new URL('/auth/callback', await authOrigin());
  callback.searchParams.set('next', returnTo);
  const { data, error } = await client.auth.signUp({
    email: value(formData, 'email'),
    password: value(formData, 'password'),
    options: {
      data: { display_name: value(formData, 'displayName') },
      emailRedirectTo: callback.toString(),
    },
  });
  if (error)
    feedbackRedirect(
      '/cadastro',
      returnTo,
      'erro',
      'Não foi possível criar a conta. Revise os dados.',
    );
  // The protected destination applies onboarding consistently, including installations without email confirmation.
  if (data.session) redirect(returnTo as Route);
  feedbackRedirect(
    '/login',
    returnTo,
    'mensagem',
    'Já tem uma conta com este e-mail? Entre com sua senha ou selecione Recuperar senha. Se estiver criando uma conta nova, confira seu e-mail para confirmar o cadastro.',
  );
}

export async function recoverPassword(formData: FormData) {
  const client = await createClient();
  const returnTo = safeReturnTo(value(formData, 'returnTo'));
  const callback = new URL('/auth/callback', await authOrigin());
  callback.searchParams.set('next', withReturnTo('/redefinir-senha', returnTo));
  await client.auth.resetPasswordForEmail(value(formData, 'email'), {
    redirectTo: callback.toString(),
  });
  feedbackRedirect(
    '/login',
    returnTo,
    'mensagem',
    'Se o e-mail estiver cadastrado, enviaremos as instruções.',
  );
}

export async function updatePassword(formData: FormData) {
  const client = await createClient();
  const returnTo = safeReturnTo(value(formData, 'returnTo'));
  const { error } = await client.auth.updateUser({
    password: value(formData, 'password'),
  });
  if (error)
    feedbackRedirect(
      '/redefinir-senha',
      returnTo,
      'erro',
      'O link expirou ou a senha é inválida.',
    );
  redirect(returnTo as Route);
}

export async function logout() {
  const client = await createClient();
  await client.auth.signOut();
  redirect('/login');
}
