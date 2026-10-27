import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LearningSpaces } from './learning-spaces';
import { ProficiencyBar } from './proficiency-bar';
vi.mock('next/navigation', () => ({
  usePathname: () => '/app/learning/mastery',
}));
describe('continuidade LP e plataforma', () => {
  it('liga as três dimensões aos ambientes reais sem confundir a timeline', () => {
    render(<LearningSpaces overview />);
    expect(
      screen.getByRole('link', { name: /Meu diagnóstico/ }),
    ).toHaveAttribute('href', '/app/assessment/entry');
    expect(screen.getByRole('link', { name: /Minha trilha/ })).toHaveAttribute(
      'href',
      '/app/plan',
    );
    expect(
      screen.getByRole('link', { name: /Minha evolução/ }),
    ).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
  it('apenas apresenta o percentual fornecido e seu contexto', () => {
    render(
      <ProficiencyBar
        label="Domínio estimado"
        percent={63.4}
        description="3 evidências registradas"
      />,
    );
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '63.4');
    expect(screen.getByText('63%')).toBeVisible();
    expect(screen.getByText('3 evidências registradas')).toBeVisible();
  });
  it('não transforma um valor inválido em progresso fictício', () => {
    render(<ProficiencyBar label="Domínio" percent={NaN} />);
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
    expect(screen.getByText(/evidência indisponível/)).toBeVisible();
  });
});
