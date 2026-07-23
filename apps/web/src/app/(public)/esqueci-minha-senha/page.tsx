import { headers } from 'next/headers';
import { AuthForm, Field, Submit } from '@/components/auth/auth-form';
import { recoverPassword } from '../auth/actions';
export default async function RecoveryPage() {
  const h = await headers();
  const protocol =
    h.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const origin =
    h.get('origin') ?? `${protocol.split(',')[0]}://${host.split(',')[0]}`;
  return (
    <AuthForm
      title="Recuperar senha"
      description="Informe seu e-mail. Se ele estiver cadastrado, enviaremos um link seguro para você voltar aos estudos."
      action={recoverPassword}
    >
      <input type="hidden" name="origin" value={origin} />
      <Field label="E-mail" name="email" type="email" />
      <Submit>Enviar link de recuperação</Submit>
    </AuthForm>
  );
}
