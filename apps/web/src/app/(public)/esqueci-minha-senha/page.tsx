import { headers } from 'next/headers';
import { AuthForm, Field, Submit } from '@/components/auth/auth-form';
import { recoverPassword } from '../auth/actions';
export default async function RecoveryPage() {
  const h = await headers();
  const origin =
    h.get('origin') ?? `http://${h.get('host') ?? 'localhost:3000'}`;
  return (
    <AuthForm
      title="Recuperar senha"
      description="Enviaremos um link se o endereço estiver cadastrado."
      action={recoverPassword}
    >
      <input type="hidden" name="origin" value={origin} />
      <Field label="E-mail" name="email" type="email" />
      <Submit>Enviar instruções</Submit>
    </AuthForm>
  );
}
