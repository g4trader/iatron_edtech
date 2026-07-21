import { headers } from 'next/headers';
import Link from 'next/link';
import { AuthForm, Field, Submit } from '@/components/auth/auth-form';
import { signup } from '../auth/actions';
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const query = await searchParams;
  const headerStore = await headers();
  const origin =
    headerStore.get('origin') ??
    `http://${headerStore.get('host') ?? 'localhost:3000'}`;
  return (
    <AuthForm
      title="Criar conta"
      description="Comece definindo seus objetivos acadêmicos."
      action={signup}
      error={query.erro}
    >
      <input type="hidden" name="origin" value={origin} />
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
      <Submit>Criar conta</Submit>
      <Link className="text-sm" href="/login">
        Já tenho conta
      </Link>
    </AuthForm>
  );
}
