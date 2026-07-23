import { AuthForm, Field, Submit } from '@/components/auth/auth-form';
import { updatePassword } from '../auth/actions';
export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthForm
      title="Nova senha"
      description="Escolha uma senha com pelo menos 8 caracteres. Depois, você voltará à sua preparação."
      action={updatePassword}
      error={query.erro}
    >
      <Field
        label="Nova senha"
        name="password"
        type="password"
        autoComplete="new-password"
      />
      <Submit>Salvar e continuar</Submit>
    </AuthForm>
  );
}
