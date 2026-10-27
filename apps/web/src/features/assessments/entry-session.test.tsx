import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SessionPage from '@/app/(authenticated)/app/assessment/session/page';
const api = vi.hoisted(() => ({
  nextQuestion: vi.fn(),
  assessmentHistory: vi.fn(),
}));
vi.mock('./server/adaptive-assessment', () => api);
vi.mock('./actions', () => ({
  pauseDiagnostic: vi.fn(),
  submitDiagnosticAnswer: vi.fn(),
}));
vi.mock('./entry-form', () => ({
  DiagnosticEntryForm: () => <button>Ver meu resultado</button>,
}));
const id = '10000000-0000-4000-8000-000000000001';
describe('sessão sem próxima questão', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.nextQuestion.mockResolvedValue(null);
  });
  it.each([{ history: [] }, { history: [{ id, answeredCount: 0 }] }])(
    'não oferece conclusão sem respostas confirmadas: %j',
    async ({ history }) => {
      api.assessmentHistory.mockResolvedValue(history);
      render(await SessionPage({ searchParams: Promise.resolve({ id }) }));
      expect(
        screen.getByRole('heading', {
          name: 'As questões não estão disponíveis agora',
        }),
      ).toBeVisible();
      expect(
        screen.queryByRole('button', { name: 'Ver meu resultado' }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Tentar novamente' }),
      ).toBeVisible();
    },
  );
  it('não presume conclusão quando histórico falha', async () => {
    api.assessmentHistory.mockRejectedValue(new Error('offline'));
    render(await SessionPage({ searchParams: Promise.resolve({ id }) }));
    expect(screen.getByRole('alert')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Ver meu resultado' }),
    ).not.toBeInTheDocument();
  });
  it('permite verificar conclusão com respostas sem declará-la já concluída', async () => {
    api.assessmentHistory.mockResolvedValue([{ id, answeredCount: 5 }]);
    render(await SessionPage({ searchParams: Promise.resolve({ id }) }));
    expect(
      screen.getByRole('button', { name: 'Ver meu resultado' }),
    ).toBeVisible();
    expect(screen.getByText(/5 respostas estão registradas/)).toBeVisible();
    expect(screen.queryByText('Questões concluídas')).not.toBeInTheDocument();
  });
});
