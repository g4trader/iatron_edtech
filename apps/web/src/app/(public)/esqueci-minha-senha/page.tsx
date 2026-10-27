import { safeReturnTo } from '@/lib/safe-return-to';
import { AuthForm, Field, Submit } from '@/components/auth/auth-form';
import { recoverPassword } from '../auth/actions';
export default async function RecoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const returnTo = safeReturnTo((await searchParams).returnTo);
  return (
    <AuthForm
      title="Recuperar senha"
      description="Informe seu e-mail. Se ele estiver cadastrado, enviaremos um link seguro para você voltar aos estudos."
      action={recoverPassword}
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <Field label="E-mail" name="email" type="email" />
      <Submit>Enviar link de recuperação</Submit>
    </AuthForm>
  );
}
