import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DiagnosisPreview, PlatformShowcase } from './platform-showcase';

describe('demonstração pública da plataforma', () => {
  it('mantém uma aba acessível e move seleção e foco com setas, Home e End', () => {
    render(<PlatformShowcase />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(tabs[0]!, { key: 'ArrowRight' });
    expect(tabs[1]).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Lacunas');
    fireEvent.keyDown(tabs[1]!, { key: 'End' });
    expect(tabs[2]).toHaveFocus();
    fireEvent.keyDown(tabs[2]!, { key: 'ArrowRight' });
    expect(tabs[0]).toHaveFocus();
    fireEvent.keyDown(tabs[0]!, { key: 'ArrowLeft' });
    expect(tabs[2]).toHaveFocus();
    fireEvent.keyDown(tabs[2]!, { key: 'Home' });
    expect(tabs[0]).toHaveFocus();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  it('identifica a demonstração e emite somente nome e aba no evento local', () => {
    const listener = vi.fn();
    window.addEventListener('iatron:landing-event', listener);
    render(<PlatformShowcase />);
    expect(screen.getByText('Exemplo ilustrativo')).toBeVisible();
    fireEvent.click(screen.getByRole('tab', { name: 'Trilha' }));
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Trilha');
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      name: 'platform_demo_interaction',
      tab: 'Trilha',
    });
    expect(screen.getByText(/Dados e atividades fictícios/)).toBeVisible();
    window.removeEventListener('iatron:landing-event', listener);
  });

  it('contextualiza temas, domínio e prioridades sem representar estudantes reais', () => {
    render(<PlatformShowcase />);
    fireEvent.click(screen.getByRole('tab', { name: 'Lacunas' }));
    const gaps = within(screen.getByRole('tabpanel'));
    expect(gaps.getByRole('heading', { name: 'Pré-natal' })).toBeVisible();
    expect(
      gaps.getByText('Ginecologia e Obstetrícia · Domínio ilustrativo: 46%'),
    ).toBeVisible();
    expect(
      gaps.getByRole('heading', { name: 'Cuidados perioperatórios' }),
    ).toBeVisible();
    expect(
      gaps.getByText('Cirurgia Geral · Domínio ilustrativo: 58%'),
    ).toBeVisible();
    expect(gaps.getByText('Fortalecer primeiro')).toBeVisible();
    expect(gaps.getByText('Aprofundar na sequência')).toBeVisible();
    expect(gaps.getByText(/Não são dados reais de estudantes/)).toBeVisible();
    fireEvent.click(screen.getByRole('tab', { name: 'Trilha' }));
    const trail = within(screen.getByRole('tabpanel'));
    expect(trail.getByText(/Tema do exemplo: Pré-natal/)).toBeVisible();
    expect(
      trail.getByText(/sem atividades reais nesta demonstração/),
    ).toBeVisible();
    for (const label of [
      'Conteúdo recomendado · 10 min ilustrativos',
      'Revisar · 20 min ilustrativos',
      'Praticar · 15 min ilustrativos',
      'Reavaliar · 10 min ilustrativos',
    ]) {
      expect(trail.getByText(label)).toBeVisible();
    }
    expect(trail.getAllByRole('listitem')).toHaveLength(4);
  });

  it('identifica percentuais fictícios no resumo do hero', () => {
    render(<DiagnosisPreview />);
    expect(screen.getByText('Exemplo ilustrativo')).toBeVisible();
    expect(screen.getByText(/percentuais fictícios/)).toBeVisible();
    expect(
      screen.getByText(/Não representa resultados de estudantes/),
    ).toBeVisible();
    for (const percent of ['72%', '64%', '58%', '46%'])
      expect(screen.getByText(percent)).toBeVisible();
  });
});
