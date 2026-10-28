import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PreferenceHelp } from './preference-help';

describe('ajuda das preferências', () => {
  it('abre por hover e foco e permite dispensar com Escape', () => {
    render(
      <PreferenceHelp label="Duração">
        <p>Impacto no plano</p>
      </PreferenceHelp>,
    );
    const trigger = screen.getByRole('button', { name: 'Entender: Duração' });
    fireEvent.mouseEnter(trigger.parentElement!);
    expect(screen.getByRole('region', { name: 'Duração' })).toBeVisible();
    fireEvent.mouseLeave(trigger.parentElement!);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    fireEvent.focus(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
  it('mantém aberto após toque, fecha ao clicar fora e não envia o formulário', () => {
    render(
      <form>
        <PreferenceHelp label="Feedback">
          <p>Preferência salva</p>
        </PreferenceHelp>
        <button type="button">Fora</button>
      </form>,
    );
    const trigger = screen.getByRole('button', { name: 'Entender: Feedback' });
    expect(trigger).toHaveAttribute('type', 'button');
    fireEvent.click(trigger);
    fireEvent.mouseLeave(trigger.parentElement!);
    expect(screen.getByRole('region')).toBeVisible();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Fora' }));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Fechar explicação' }));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
