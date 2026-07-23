import Link from 'next/link';
import { AuthForm, Field, Submit } from '@/components/auth/auth-form';
import { login } from '../auth/actions';
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    erro?: string;
    mensagem?: string;
    returnTo?: string;
  }>;
}) {
  const query = await searchParams;
  return (
    <AuthForm
      title="Entrar"
      description="Retome seu plano e continue de onde parou."
      action={login}
      error={query.erro}
      message={query.mensagem}
    >
      <input type="hidden" name="returnTo" value={query.returnTo ?? '/app'} />
      <Field label="E-mail" name="email" type="email" autoComplete="email" />
      <Field
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
      />
      <Submit>Entrar</Submit>
      <div className="flex justify-between text-sm">
        <Link href="/cadastro">Começar agora</Link>
        <Link href="/esqueci-minha-senha">Recuperar senha</Link>
      </div>
    </AuthForm>
  );
}
