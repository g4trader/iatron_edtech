import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppShell } from './app-shell';

vi.mock('next/navigation', () => ({ usePathname: () => '/app' }));

describe('AppShell', () => {
  beforeEach(() => window.localStorage.clear());

  it('recolhe e restaura a sidebar desktop', () => {
    const { rerender } = render(
      <AppShell>
        <div>Conteúdo</div>
      </AppShell>,
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Recolher barra lateral' }),
    );
    expect(window.localStorage.getItem('iatron:sidebar-collapsed')).toBe(
      'true',
    );
    rerender(
      <AppShell>
        <div>Conteúdo</div>
      </AppShell>,
    );
    expect(
      screen.getByRole('button', { name: 'Expandir barra lateral' }),
    ).toBeInTheDocument();
  });

  it('abre e fecha drawer mobile, restaurando foco', () => {
    render(
      <AppShell>
        <div>Conteúdo</div>
      </AppShell>,
    );
    const opener = screen.getByRole('button', { name: 'Abrir menu' });
    opener.focus();
    fireEvent.click(opener);
    const close = screen
      .getAllByRole('button', { name: 'Fechar menu' })
      .at(-1)!;
    expect(close).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('separa a identidade da ação de sair e não exibe conversas fictícias', () => {
    render(
      <AppShell
        identity={{
          displayName: 'Luciano Terres Rosa',
          email: 'luciano@example.com',
        }}
      >
        <div>Conteúdo</div>
      </AppShell>,
    );

    expect(
      screen.getByLabelText('Usuário: Luciano Terres Rosa'),
    ).not.toHaveAttribute('type', 'submit');
    expect(
      screen.getByRole('button', { name: 'Sair da conta' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Revisão de clínica médica'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Questão demonstrativa')).not.toBeInTheDocument();
    expect(screen.queryByText('Principais gaps')).not.toBeInTheDocument();
  });

  it('exibe somente conversas reais com destino válido no Tutor', () => {
    render(
      <AppShell
        recentConversations={[
          { id: 'conversation-123', title: 'Minha conversa' },
        ]}
      >
        <div>Conteúdo</div>
      </AppShell>,
    );

    expect(
      screen.getByRole('link', { name: /Minha conversa/ }),
    ).toHaveAttribute('href', '/app/tutor/conversation-123');
  });
});
