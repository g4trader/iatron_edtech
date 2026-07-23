import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnboardingWizard } from './onboarding-wizard';

const saveOnboarding = vi.hoisted(() => vi.fn());

vi.mock('../actions', () => ({ saveOnboarding }));

const baseProps = {
  initialStep: 2,
  initialName: 'Estudante',
  initialResidencyYear: 1,
  initialGraduationYear: 2026,
  initialExperienceLevel: 'medical_student' as const,
  initialSessionMinutes: 45,
  initialAssessmentPreference: 'guided' as const,
  initialAvailability: [],
  initialTargets: [],
  editions: [],
};

describe('rotina de estudos do onboarding', () => {
  beforeEach(() => {
    saveOnboarding.mockReset();
    saveOnboarding.mockResolvedValue({ ok: true });
  });

  it.each([
    ['Estudo praticamente todos os dias', 315, 45],
    ['Consigo estudar principalmente em dias úteis', 300, 0],
    ['Minha rotina depende de plantões', 360, 90],
    ['Prefiro configurar manualmente', 0, 0],
    ['Não tenho certeza ainda', 315, 45],
  ])(
    'aplica o perfil %s e calcula o total',
    (profile, total, sundayMinutes) => {
      render(<OnboardingWizard {...baseProps} />);

      fireEvent.click(screen.getByRole('radio', { name: new RegExp(profile) }));

      expect(
        screen.getByRole('region', { name: 'Disponibilidade semanal' }),
      ).toHaveTextContent(`${total} minutos`);

      if (profile !== 'Prefiro configurar manualmente') {
        expect(screen.queryByLabelText('Dom em minutos')).not.toBeInTheDocument();
        fireEvent.click(
          screen.getByRole('button', { name: 'Personalizar' }),
        );
      }
      expect(screen.getByLabelText('Dom em minutos')).toHaveValue(
        sundayMinutes,
      );
    },
  );

  it('preserva a sugestão e atualiza o resumo após edição manual', () => {
    render(<OnboardingWizard {...baseProps} />);
    fireEvent.click(
      screen.getByRole('radio', {
        name: /Estudo praticamente todos os dias/,
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));
    fireEvent.change(screen.getByLabelText('Seg em minutos'), {
      target: { value: '90' },
    });

    expect(screen.getByLabelText('Dom em minutos')).toHaveValue(45);
    expect(
      screen.getByRole('region', { name: 'Disponibilidade semanal' }),
    ).toHaveTextContent('360 minutos');
    expect(
      screen.getByRole('region', { name: 'Disponibilidade semanal' }),
    ).toHaveTextContent('≈ 6 horas');
  });

  it('persiste o mesmo payload de disponibilidade já aceito pelo backend', async () => {
    render(<OnboardingWizard {...baseProps} />);
    fireEvent.click(
      screen.getByRole('radio', {
        name: /Consigo estudar principalmente em dias úteis/,
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Salvar e continuar' }));

    await waitFor(() => expect(saveOnboarding).toHaveBeenCalledOnce());
    expect(saveOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({
        step: 3,
        preferredSessionMinutes: 45,
        assessmentPreference: 'guided',
        availability: {
          items: [
            { weekday: 0, minutesAvailable: 0 },
            { weekday: 1, minutesAvailable: 60 },
            { weekday: 2, minutesAvailable: 60 },
            { weekday: 3, minutesAvailable: 60 },
            { weekday: 4, minutesAvailable: 60 },
            { weekday: 5, minutesAvailable: 60 },
            { weekday: 6, minutesAvailable: 0 },
          ],
        },
      }),
    );
  });

  it('retoma valores personalizados sem sobrescrevê-los', () => {
    render(
      <OnboardingWizard
        {...baseProps}
        initialAvailability={[
          { weekday: 0, minutesAvailable: 10 },
          { weekday: 1, minutesAvailable: 20 },
          { weekday: 2, minutesAvailable: 30 },
          { weekday: 3, minutesAvailable: 40 },
          { weekday: 4, minutesAvailable: 50 },
          { weekday: 5, minutesAvailable: 60 },
          { weekday: 6, minutesAvailable: 70 },
        ]}
      />,
    );

    expect(
      screen.getByRole('radio', { name: /Prefiro configurar manualmente/ }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Qua em minutos')).toHaveValue(40);
    expect(
      screen.getByRole('region', { name: 'Disponibilidade semanal' }),
    ).toHaveTextContent('280 minutos');
  });

  it('mantém a escolha ao voltar e avançar no wizard', () => {
    render(<OnboardingWizard {...baseProps} e2eBypass />);
    fireEvent.click(
      screen.getByRole('radio', { name: /Não tenho certeza ainda/ }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(
      screen.getByRole('heading', { name: 'Vamos conhecer você' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar e continuar' }));

    expect(
      screen.getByRole('radio', { name: /Não tenho certeza ainda/ }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('region', { name: 'Disponibilidade semanal' }),
    ).toHaveTextContent('315 minutos');
  });

  it('mantém os sete campos recolhidos na abertura mobile-first', () => {
    render(<OnboardingWizard {...baseProps} />);

    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.queryByLabelText('Dom em minutos')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Duração preferida da sessão')).toBeVisible();
    expect(screen.getByLabelText('Preferência de avaliação')).toBeVisible();
  });
});
