import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CompetencyWorkspace } from '@iatron/contracts';
import { CompetencyDetail } from './competency-workspace';

const competency: CompetencyWorkspace = {
  id: '10000000-0000-4000-8000-000000000001',
  code: 'EMERG.CHOQUE.002',
  name: 'Ressuscitação inicial do choque séptico',
  description: 'Conduzir a abordagem inicial com segurança.',
  hierarchy: {
    area: 'Emergências',
    theme: 'Choque',
    subtheme: 'Choque séptico',
  },
  objectives: ['Reconhecer as prioridades iniciais'],
  specialties: [
    {
      id: '10000000-0000-4000-8000-000000000002',
      name: 'Clínica Médica',
      relationship: 'primary',
      owners: [{ name: 'Dra. Mentora', role: 'primary', status: 'active' }],
    },
  ],
  coverage: {
    status: 'partially_covered',
    publishedContents: 1,
    eligibleQuestions: 0,
    validReferences: 1,
    videos: 0,
    activeBlueprints: 1,
    pending: ['Sem questão elegível'],
    lastReviewedAt: '2026-07-27T12:00:00.000Z',
  },
  contents: [],
  questions: [],
  references: [],
  videos: [],
  blueprints: [],
  learningUse: {
    diagnostic: 'Avaliada em 1 blueprint ativo.',
    plan: 'Pode originar atividades.',
    tutor: 'O tutor pode explicar esta competência.',
  },
  gaps: [
    {
      title: 'Ressuscitação inicial do choque séptico',
      reason: 'Sem questão elegível',
      nextAction: 'Relacionar e homologar uma questão adequada.',
    },
  ],
  limitations: ['A cobertura não representa qualidade clínica.'],
};

describe('Competency workspace', () => {
  it('makes the academic relationships and missing coverage understandable', () => {
    render(<CompetencyDetail competency={competency} />);
    expect(
      screen.getByRole('heading', {
        name: 'Ressuscitação inicial do choque séptico',
      }),
    ).toBeVisible();
    expect(screen.getByText(/Dra. Mentora · Clínica Médica/)).toBeVisible();
    expect(screen.getByText('Cobertura parcial')).toBeVisible();
    expect(screen.getByText('Sem questão elegível')).toBeVisible();
    expect(screen.getByText(/Avaliada em 1 blueprint ativo/)).toBeVisible();
  });
});
