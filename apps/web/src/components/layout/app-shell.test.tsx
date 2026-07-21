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
});
