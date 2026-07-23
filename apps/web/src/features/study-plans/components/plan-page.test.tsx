import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { StudyPlanItem } from '@iatron/contracts';
import { PlanItemCard } from './plan-page';

vi.mock('../actions', () => ({
  askTutorAboutPlanItem: vi.fn(),
  executePlanItem: vi.fn(),
}));

const item: StudyPlanItem = {
  id: '0d537508-870c-4d0e-aa6a-d9af0206ee4c',
  competencyId: '54ff0dd9-4355-4026-a5f1-f91dd45e9366',
  competencyCode: 'EMERG.CHOQUE.002',
  competencyName: 'Ressuscitação inicial do choque séptico',
  itemType: 'gap_reinforcement',
  priority: 0.72,
  estimatedMinutes: 20,
  plannedDate: '2026-07-23',
  position: 1,
  status: 'in_progress',
  origin: 'learning_gap',
  reasons: [
    {
      code: 'gap_priority',
      contribution: 0.46,
      detail: 'Prioridade produzida pelo Learning Gap Engine.',
    },
    {
      code: 'low_mastery',
      contribution: 0.2,
      detail: 'Mastery atual: 31%.',
    },
  ],
  replanCount: 0,
};

describe('atividade do plano', () => {
  it('explica a recomendação sem códigos, motores ou métricas internas', () => {
    render(<PlanItemCard item={item} />);

    expect(
      screen.getByRole('heading', {
        name: 'Ressuscitação inicial do choque séptico',
      }),
    ).toBeVisible();
    expect(screen.getByText('Vale estudar agora', { exact: false })).toBeVisible();
    expect(screen.getByText(/principais oportunidades de evolução/i)).toBeVisible();
    expect(document.body.textContent).not.toMatch(
      /EMERG\.CHOQUE\.002|Learning Gap Engine|Mastery|importância 72%/i,
    );
  });
});
