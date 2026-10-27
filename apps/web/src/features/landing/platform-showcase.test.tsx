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
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Minha trilha');
    fireEvent.keyDown(tabs[1]!, { key: 'End' });
    expect(tabs[2]).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Minha evolução');
    fireEvent.keyDown(tabs[2]!, { key: 'ArrowRight' });
    expect(tabs[0]).toHaveFocus();
    fireEvent.keyDown(tabs[0]!, { key: 'ArrowLeft' });
    expect(tabs[2]).toHaveFocus();
    fireEvent.keyDown(tabs[2]!, { key: 'Home' });
    expect(tabs[0]).toHaveFocus();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  it('preserva o evento local com somente nome e aba, sem duplicação', () => {
    const listener = vi.fn();
    window.addEventListener('iatron:landing-event', listener);
    render(<PlatformShowcase />);
    fireEvent.click(screen.getByRole('tab', { name: 'Minha trilha' }));
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      name: 'platform_demo_interaction',
      tab: 'Minha trilha',
    });
    window.removeEventListener('iatron:landing-event', listener);
  });

  it('demonstra diagnóstico, atividades e evolução com conteúdo distinto e aviso persistente', () => {
    render(<PlatformShowcase />);
    const notice = screen.getByText(
      /dados, atividades, tempos e evolução são fictícios/,
    );
    expect(notice).toBeVisible();
    const diagnosis = within(screen.getByRole('tabpanel'));
    expect(diagnosis.getByRole('heading', { name: 'Pré-natal' })).toBeVisible();
    expect(diagnosis.getByText('46% de domínio')).toBeVisible();
    expect(
      diagnosis.getByRole('heading', { name: 'Cuidados perioperatórios' }),
    ).toBeVisible();
    expect(diagnosis.getByText('58% de domínio')).toBeVisible();
    expect(
      diagnosis.getByRole('list', { name: 'Percentuais fictícios por área' })
        .children,
    ).toHaveLength(4);
    fireEvent.click(screen.getByRole('tab', { name: 'Minha trilha' }));
    const trail = within(screen.getByRole('tabpanel'));
    expect(trail.getAllByRole('listitem')).toHaveLength(5);
    expect(trail.getAllByText('Concluída')).toHaveLength(2);
    expect(trail.getByText('Próxima atividade')).toBeVisible();
    expect(trail.getByText('Tempos ilustrativos')).toBeVisible();
    for (const label of [
      'Conteúdo recomendado',
      'Revisão',
      'Prática',
      'Reavaliação',
    ])
      expect(trail.getByText(label)).toBeVisible();
    expect(notice).toBeVisible();
    fireEvent.click(screen.getByRole('tab', { name: 'Minha evolução' }));
    const evolution = within(screen.getByRole('tabpanel'));
    expect(evolution.getByText('Evolução fictícia')).toBeVisible();
    const comparisons = evolution.getByRole('list', {
      name: 'Comparação fictícia de domínio por área',
    });
    const rows = within(comparisons).getAllByRole('listitem');
    expect(rows).toHaveLength(4);
    rows.forEach((row) => {
      expect(within(row).getByText('Antes')).toBeVisible();
      expect(within(row).getByText('Agora')).toBeVisible();
    });
    expect(evolution.getByText('em 2 semanas ilustrativas')).toBeVisible();
    expect(
      evolution.getByRole('heading', { name: 'Consolidar Pré-natal' }),
    ).toBeVisible();
    expect(notice).toBeVisible();
    expect(notice).toHaveTextContent(
      'Não representam estudantes reais nem chance de aprovação.',
    );
  });

  it('resume mapa, prioridade, atividade e progresso ilustrativos no hero', () => {
    render(<DiagnosisPreview />);
    expect(
      screen.getByRole('heading', { name: 'Seu mapa de aprendizagem' }),
    ).toBeVisible();
    expect(screen.getByText('Exemplo ilustrativo')).toBeVisible();
    expect(screen.getByText('PRIORIDADE · PRÉ-NATAL')).toBeVisible();
    expect(screen.getByText('Próxima atividade · 20 min')).toBeVisible();
    expect(screen.getByText('2 de 5 etapas')).toBeVisible();
    expect(
      screen.getByText(/Dados, tempos e progresso fictícios/),
    ).toBeVisible();
    const areas = within(
      screen.getByRole('list', { name: 'Percentuais fictícios por área' }),
    );
    for (const percent of ['72%', '64%', '58%', '46%'])
      expect(areas.getByText(percent)).toBeVisible();
  });
});
