import { DIAGNOSTIC_ENTRY_PATH } from '@/features/acquisition/routes';
import type { Route } from 'next';
import { safeReturnTo, withReturnTo } from '@/lib/safe-return-to';
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
  const returnTo = safeReturnTo(query.returnTo);
  return (
    <AuthForm
      title="Entrar"
      description={
        returnTo === DIAGNOSTIC_ENTRY_PATH
          ? 'Entre para iniciar ou retomar seu diagnóstico. Seu próximo passo está preservado.'
          : 'Retome seu plano e continue de onde parou.'
      }
      action={login}
      error={query.erro}
      message={query.mensagem}
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <Field label="E-mail" name="email" type="email" autoComplete="email" />
      <Field
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
      />
      <Submit>Entrar</Submit>
      <div className="flex justify-between text-sm">
        <Link href={withReturnTo('/cadastro', returnTo) as Route}>
          Começar agora
        </Link>
        <Link href={withReturnTo('/esqueci-minha-senha', returnTo) as Route}>
          Recuperar senha
        </Link>
      </div>
    </AuthForm>
  );
}
