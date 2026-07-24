import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('landing Mentor First', () => {
  it('apresenta os mesmos mentores que conduzem a plataforma', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: 'Conheça seus mentores' }),
    ).toBeVisible();
    for (const mentor of [
      'Dr. Aristóteles',
      'Dr. Lucas',
      'Dr. Guilherme Peterson',
      'Dra. Fernanda Grosbelli',
    ]) {
      expect(screen.getByText(mentor)).toBeVisible();
    }
    expect(document.body.textContent).not.toMatch(/tutor ia|chatbot/i);
  });
});
