import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('landing premium', () => {
  it('apresenta os mesmos mentores que conduzem a plataforma', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', {
        name: /Experiência médica\s*que vai além dos livros/,
      }),
    ).toBeVisible();
    for (const mentor of [
      'Dr. Aristóteles',
      'Dr. Lucas',
      'Dr. Guilherme Peterson',
      'Dr. João Garcia',
    ]) {
      expect(screen.getByText(mentor)).toBeVisible();
    }
    expect(document.body.textContent).not.toMatch(/tutor ia|chatbot/i);
    const journey = screen.getByRole('list', { name: 'Etapas da preparação' });
    for (const name of ['Diagnóstico', 'Lacunas', 'Trilha', 'Evolução']) {
      expect(
        within(journey).getByRole('heading', { name: new RegExp(`^${name}$`) }),
      ).toBeVisible();
    }
    expect(
      screen.getByRole('tab', { name: 'Meu diagnóstico' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Minha trilha' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Minha evolução' })).toBeVisible();
    const ctas = screen.getAllByRole('link', {
      name: /Iniciar meu diagnóstico/,
    });
    expect(ctas).toHaveLength(3);
    for (const cta of ctas)
      expect(cta).toHaveAttribute('href', '/app/assessment/entry');

    expect(
      screen.getByRole('region', {
        name: /Conversas que ampliam\s*sua visão da medicina/,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Assistir ao episódio/ }),
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=PEKL4AgCtMQ');
    expect(
      screen.getByTitle(
        'Próxima Conduta — Episódio #0: Carreira médica: como escolhemos nossos caminhos',
      ),
    ).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/PEKL4AgCtMQ',
    );
  });
});
