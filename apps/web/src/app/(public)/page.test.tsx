import { render, screen } from '@testing-library/react';
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
    expect(
      screen.getByRole('region', {
        name: /Conversas que ampliam\s*sua visão da medicina/,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Assistir ao Próxima Conduta/ }),
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
