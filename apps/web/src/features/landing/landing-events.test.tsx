import { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LandingEvents } from './landing-events';

describe('eventos locais da landing', () => {
  it('evita duplicação no StrictMode e limita eventos a metadados permitidos', () => {
    const listener = vi.fn();
    window.addEventListener('iatron:landing-event', listener);
    const { unmount } = render(
      <StrictMode>
        <LandingEvents />
        <a
          href="/cadastro"
          onClick={(event) => event.preventDefault()}
          data-lp-event="hero_primary_cta_click"
        >
          Cadastro
        </a>
        <button data-lp-event="email@example.com">Não permitido</button>
      </StrictMode>,
    );
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({
      name: 'lp_view',
    });
    fireEvent.click(screen.getByText('Cadastro'));
    expect((listener.mock.calls[1]?.[0] as CustomEvent).detail).toEqual({
      name: 'hero_primary_cta_click',
    });
    fireEvent.click(screen.getByText('Não permitido'));
    expect(listener).toHaveBeenCalledTimes(2);
    unmount();
    window.removeEventListener('iatron:landing-event', listener);
  });
});
