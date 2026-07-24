import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mentors } from '../mentors';
import { MentorMessage } from './mentor';

describe('mensagem do mentor', () => {
  it('identifica a pessoa, a especialidade e o próximo passo sem protagonizar a IA', () => {
    const mentor = mentors[3]!;
    render(
      <MentorMessage mentor={mentor} title="Vamos revisar seu próximo passo">
        <p>Este tema merece atenção antes da sua prova.</p>
      </MentorMessage>,
    );

    expect(
      screen.getByRole('region', {
        name: 'Orientação de Dra. Fernanda Grosbelli',
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/orientação de dra\. fernanda grosbelli/i),
    ).toBeVisible();
    expect(document.body.textContent).not.toMatch(/tutor ia|chatbot|engine/i);
  });
});
