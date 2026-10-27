import { StrictMode } from 'react';
import type * as ReactModule from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DiagnosticActionState } from './entry-state';

const fixture = vi.hoisted(() => ({
  state: { status: 'idle' } as DiagnosticActionState,
  push: vi.fn(),
  event: vi.fn(),
  submit: vi.fn(),
}));
vi.mock('react', async () => ({
  ...(await vi.importActual<typeof ReactModule>('react')),
  useActionState: () => [fixture.state, fixture.submit],
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: fixture.push }),
}));
vi.mock('@/features/acquisition/events', () => ({
  emitAcquisitionEvent: fixture.event,
}));
vi.mock('./entry-actions', () => ({
  beginAcquisitionDiagnostic: vi.fn(),
  resumeAcquisitionDiagnostic: vi.fn(),
  finishAcquisitionDiagnostic: vi.fn(),
}));
import { DiagnosticEntryForm } from './entry-form';

beforeEach(() => {
  vi.clearAllMocks();
  fixture.state = { status: 'idle' };
});

describe('diagnostic confirmed action navigation', () => {
  it('handles a new success when React preserves the form across start and finish', () => {
    fixture.state = {
      status: 'success',
      destination: '/app/assessment/session?id=fixture',
      event: 'diagnostic_started',
    };
    const { rerender } = render(<DiagnosticEntryForm />);
    expect(fixture.push).toHaveBeenLastCalledWith(
      '/app/assessment/session?id=fixture',
    );
    fixture.state = {
      status: 'success',
      destination: '/app/assessment/result?id=fixture',
      event: 'diagnostic_completed',
    };
    rerender(<DiagnosticEntryForm kind="finish" assessmentId="fixture" />);
    expect(fixture.push).toHaveBeenCalledTimes(2);
    expect(fixture.push).toHaveBeenLastCalledWith(
      '/app/assessment/result?id=fixture',
    );
    expect(fixture.event).toHaveBeenNthCalledWith(2, {
      name: 'diagnostic_completed',
    });
  });
  it('handles finish after resume without inventing a start event', () => {
    fixture.state = {
      status: 'success',
      destination: '/app/assessment/session?id=fixture',
    };
    const { rerender } = render(
      <DiagnosticEntryForm kind="resume" assessmentId="fixture" />,
    );
    fixture.state = {
      status: 'success',
      destination: '/app/assessment/result?id=fixture',
      event: 'diagnostic_completed',
    };
    rerender(<DiagnosticEntryForm kind="finish" assessmentId="fixture" />);
    expect(fixture.push).toHaveBeenCalledTimes(2);
    expect(fixture.event).toHaveBeenCalledExactlyOnceWith({
      name: 'diagnostic_completed',
    });
  });
  it('deduplicates the same success under StrictMode and rerenders', () => {
    fixture.state = {
      status: 'success',
      destination: '/app/assessment/result?id=fixture',
      event: 'diagnostic_completed',
    };
    const { rerender } = render(
      <StrictMode>
        <DiagnosticEntryForm kind="finish" assessmentId="fixture" />
      </StrictMode>,
    );
    fixture.state = { ...fixture.state };
    rerender(
      <StrictMode>
        <DiagnosticEntryForm kind="finish" assessmentId="fixture" />
      </StrictMode>,
    );
    expect(fixture.push).toHaveBeenCalledTimes(1);
    expect(fixture.event).toHaveBeenCalledTimes(1);
  });
  it('does not navigate or emit when the action fails', () => {
    fixture.state = { status: 'error', message: 'Não foi possível confirmar.' };
    render(<DiagnosticEntryForm />);
    expect(fixture.push).not.toHaveBeenCalled();
    expect(fixture.event).not.toHaveBeenCalled();
  });
});
