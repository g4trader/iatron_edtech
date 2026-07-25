import { fireEvent, render, screen, within } from '@testing-library/react';
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

  it('exibe identidade e logout no menu mobile', () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const drawer = screen.getByRole('dialog', { name: 'Menu de navegação' });

    expect(
      within(drawer).getByLabelText('Usuário: Luciano Terres Rosa'),
    ).toBeVisible();
    expect(within(drawer).getByText('luciano@example.com')).toBeVisible();
    expect(within(drawer).getByRole('button', { name: 'Sair' })).toBeVisible();
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

  it('mantém a navegação focada na jornada', () => {
    render(
      <AppShell>
        <div>Conteúdo</div>
      </AppShell>,
    );

    expect(screen.getByRole('link', { name: /Jornada/ })).toBeVisible();
    expect(screen.queryByRole('link', { name: /Simulados/ })).toBeNull();
    expect(screen.getByRole('link', { name: /Mentores/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /Perfil/ })).toBeVisible();
    expect(screen.queryByText('Orientações recentes')).not.toBeInTheDocument();
  });
});
