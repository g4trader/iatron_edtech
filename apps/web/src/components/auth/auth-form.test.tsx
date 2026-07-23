import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthForm, Field, Submit } from './auth-form';

describe('experiência de autenticação', () => {
  it('associa contexto, feedback e campos acessíveis', () => {
    render(
      <AuthForm
        action={vi.fn()}
        title="Entrar"
        description="Retome seu plano e continue de onde parou."
        message="Confira seu e-mail para continuar."
      >
        <Field label="E-mail" name="email" type="email" />
        <Submit>Entrar</Submit>
      </AuthForm>,
    );

    expect(
      screen.getByText('Retome seu plano e continue de onde parou.'),
    ).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Confira seu e-mail para continuar.',
    );
    expect(screen.getByLabelText('E-mail')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });
});
