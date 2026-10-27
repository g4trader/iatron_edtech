import { DIAGNOSTIC_ENTRY_PATH } from '@/features/acquisition/routes';
import { SignupObserver } from '@/features/acquisition/signup-observer';
import type { Route } from 'next';
import { safeReturnTo, withReturnTo } from '@/lib/safe-return-to';
import Link from 'next/link';
import { AuthForm, Field, Submit } from '@/components/auth/auth-form';
import { signup } from '../auth/actions';
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; returnTo?: string }>;
}) {
  const query = await searchParams;
  const returnTo = safeReturnTo(query.returnTo);
  return (
    <AuthForm
      title="Criar conta"
      description={
        returnTo === DIAGNOSTIC_ENTRY_PATH
          ? 'Crie sua conta. Após confirmar seu e-mail e informar sua rotina, você seguirá para o diagnóstico.'
          : 'Leva poucos minutos. Depois, vamos conhecer sua rotina e organizar seus primeiros passos.'
      }
      action={signup}
      error={query.erro}
    >
      <SignupObserver />
      <input type="hidden" name="returnTo" value={returnTo} />
      <Field
        label="Como devemos chamar você?"
        name="displayName"
        autoComplete="name"
      />
      <Field label="E-mail" name="email" type="email" autoComplete="email" />
      <Field
        label="Senha (mínimo de 8 caracteres)"
        name="password"
        type="password"
        autoComplete="new-password"
      />
      <Submit>Começar minha preparação</Submit>
      <Link
        className="text-sm"
        href={withReturnTo('/login', returnTo) as Route}
      >
        Já tenho uma conta
      </Link>
    </AuthForm>
  );
}
