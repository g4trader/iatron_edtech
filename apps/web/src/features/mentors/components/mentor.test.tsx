import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mentors } from '../mentors';
import { MentorMessage, TargetExamBadge } from './mentor';

describe('mensagem do mentor', () => {
  it('identifica a pessoa e a especialidade sem atribuir autoria ou fala', () => {
    const mentor = mentors[3]!;
    render(
      <MentorMessage mentor={mentor} title="Vamos revisar seu próximo passo">
        <p>Este tema merece atenção antes da sua prova.</p>
      </MentorMessage>,
    );

    expect(
      screen.getByRole('region', {
        name: 'Contexto de Ginecologia e Obstetrícia',
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/mentor da área: dra\. fernanda grosbelli/i),
    ).toBeVisible();
    expect(document.body.textContent).not.toMatch(
      /fernanda recomenda|orientação de dra\. fernanda|engine/i,
    );
  });

  it('mostra a prova-alvo e a limitação do perfil demonstrativo', () => {
    render(<TargetExamBadge isSynthetic name="AMRIGS" />);

    expect(screen.getByText('AMRIGS')).toBeVisible();
    expect(
      screen.getByText(/perfil demonstrativo, sem dados de provas oficiais/i),
    ).toBeVisible();
  });
});
