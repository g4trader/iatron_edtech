import Link from 'next/link';
import type { Route } from 'next';
import { safeReturnTo, withReturnTo } from '@/lib/safe-return-to';
import { AuthForm, Field, Submit } from '@/components/auth/auth-form';
import { updatePassword } from '../auth/actions';
export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; returnTo?: string }>;
}) {
  const query = await searchParams;
  const returnTo = safeReturnTo(query.returnTo);
  return (
    <AuthForm
      title="Nova senha"
      description="Escolha uma senha com pelo menos 8 caracteres. Depois, você voltará à sua preparação."
      action={updatePassword}
      error={query.erro}
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <Field
        label="Nova senha"
        name="password"
        type="password"
        autoComplete="new-password"
      />
      <Submit>Salvar e continuar</Submit>
      {query.erro && (
        <Link href={withReturnTo('/esqueci-minha-senha', returnTo) as Route}>
          Solicitar um novo link
        </Link>
      )}
    </AuthForm>
  );
}
