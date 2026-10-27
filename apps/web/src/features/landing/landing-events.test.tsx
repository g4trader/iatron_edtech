import { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LandingEvents } from './landing-events';

describe('eventos locais da landing', () => {
  it('emite view somente na aquisição e preserva eventos editoriais permitidos', () => {
    const landing = vi.fn();
    const acquisition = vi.fn();
    window.addEventListener('iatron:landing-event', landing);
    window.addEventListener('iatron:acquisition-event', acquisition);
    const { unmount } = render(
      <StrictMode>
        <LandingEvents />
        <a
          href="#como-funciona"
          onClick={(event) => event.preventDefault()}
          data-lp-event="hero_secondary_cta_click"
        >
          Como funciona
        </a>
        <button data-lp-event="hero_primary_cta_click">Evento antigo</button>
        <button data-lp-event="email@example.com">Não permitido</button>
      </StrictMode>,
    );
    expect(landing).not.toHaveBeenCalled();
    expect(acquisition).toHaveBeenCalledTimes(1);
    expect((acquisition.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      name: 'landing_page_view',
    });
    fireEvent.click(screen.getByText('Como funciona'));
    expect((landing.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      name: 'hero_secondary_cta_click',
    });
    fireEvent.click(screen.getByText('Evento antigo'));
    fireEvent.click(screen.getByText('Não permitido'));
    expect(landing).toHaveBeenCalledTimes(1);
    expect(acquisition).toHaveBeenCalledTimes(1);
    unmount();
    window.removeEventListener('iatron:landing-event', landing);
    window.removeEventListener('iatron:acquisition-event', acquisition);
  });
});
