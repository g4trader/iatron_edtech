import { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AcquisitionView } from './acquisition-view';
import { DiagnosticCTA } from './diagnostic-cta';
import { emitAcquisitionEvent } from './events';

describe('instrumentação de aquisição sem identidade', () => {
  it('não duplica visualização no StrictMode', () => {
    const listener = vi.fn();
    window.addEventListener('iatron:acquisition-event', listener);
    const { rerender } = render(
      <StrictMode>
        <AcquisitionView name="diagnostic_entry_view" />
      </StrictMode>,
    );
    rerender(
      <StrictMode>
        <AcquisitionView name="diagnostic_entry_view" />
      </StrictMode>,
    );
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      name: 'diagnostic_entry_view',
    });
    window.removeEventListener('iatron:acquisition-event', listener);
  });
  it('clique confirma somente intenção e mantém destino interno real', () => {
    const listener = vi.fn();
    const onNavigate = vi.fn();
    window.addEventListener('iatron:acquisition-event', listener);
    render(<DiagnosticCTA location="hero" onNavigate={onNavigate} />);
    const link = screen.getByRole('link', { name: 'Iniciar meu diagnóstico' });
    expect(link).toHaveAttribute('href', '/app/assessment/entry');
    link.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(link);
    expect(onNavigate).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      name: 'diagnostic_cta_click',
      cta_location: 'hero',
      user_auth_state: 'unknown',
    });
    window.removeEventListener('iatron:acquisition-event', listener);
  });
  it('descarta propriedades extras antes de emitir um evento', () => {
    const listener = vi.fn();
    window.addEventListener('iatron:acquisition-event', listener);
    const event = {
      name: 'diagnostic_started' as const,
      email: 'never-send@example.test',
      assessmentId: 'private',
    };
    emitAcquisitionEvent(event);
    expect((listener.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      name: 'diagnostic_started',
    });
    const click = {
      name: 'diagnostic_cta_click' as const,
      cta_location: 'hero' as const,
      user_auth_state: 'unknown' as const,
      email: 'never-send@example.test',
    };
    emitAcquisitionEvent(click);
    expect((listener.mock.calls[1]![0] as CustomEvent).detail).toEqual({
      name: 'diagnostic_cta_click',
      cta_location: 'hero',
      user_auth_state: 'unknown',
    });
    window.removeEventListener('iatron:acquisition-event', listener);
  });
});
