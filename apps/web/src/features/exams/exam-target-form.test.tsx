import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExamTargetForm } from './exam-target-form';
const save = vi.hoisted(() => vi.fn());
vi.mock('./actions', () => ({ saveExamTargets: save }));
const id = '64000000-0000-4000-8000-000000000001';
const editions = [
  { id, year: 2026, programName: 'Prova existente', stateCode: 'RS' },
];
beforeEach(() => {
  save.mockReset();
});
describe('seleção persistente de provas', () => {
  it('mantém seleção após erro de rede e confirma somente depois da gravação', async () => {
    save
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ ok: true });
    render(
      <ExamTargetForm
        editions={editions}
        initialTargets={[]}
        returnTo="/app"
      />,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar escolha' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Sua seleção foi mantida',
      ),
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Confirmar escolha' }),
      ).toBeEnabled(),
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.queryByText('Provas salvas')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar escolha' }));
    await waitFor(() =>
      expect(screen.getByText('Provas salvas')).toBeVisible(),
    );
    expect(save).toHaveBeenLastCalledWith([id]);
    expect(
      screen.getByRole('link', { name: 'Continuar minha preparação' }),
    ).toHaveAttribute('href', '/app');
  });
  it('restaura seleção e impede duplicação enquanto salva', async () => {
    let finish!: (value: { ok: boolean }) => void;
    save.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    render(
      <ExamTargetForm
        editions={editions}
        initialTargets={[id]}
        returnTo="/app"
      />,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar escolha' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Salvando provas…' }),
      ).toBeDisabled(),
    );
    expect(save).toHaveBeenCalledTimes(1);
    await act(async () => finish({ ok: true }));
  });
  it('não oferece provas inventadas no catálogo vazio', () => {
    render(
      <ExamTargetForm editions={[]} initialTargets={[]} returnTo="/app" />,
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirmar escolha' }),
    ).toBeDisabled();
  });
});
