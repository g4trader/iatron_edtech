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
  editions: [
    {
      id: '64000000-0000-4000-8000-000000000001',
      year: 2026,
      edition: 'Ingresso 2026',
      programName: 'Prova AMB/AMRIGS — Processo Seletivo Unificado',
      programCode: 'AMRIGS',
      stateCode: 'RS',
      city: 'Porto Alegre',
      institutionName: 'Associação Médica do Rio Grande do Sul',
    },
    {
      id: '64000000-0000-4000-8000-000000000006',
      year: 2026,
      edition: 'Ingresso 2026',
      programName: 'Residência Médica do Hospital Universitário da UFSC',
      programCode: 'UFSC',
      stateCode: 'SC',
      city: 'Florianópolis',
      institutionName: 'Universidade Federal de Santa Catarina',
    },
  ],
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
        expect(
          screen.queryByLabelText('Dom em minutos'),
        ).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));
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
    expect(
      screen.getByLabelText(
        'Como você prefere receber feedback durante os exercícios?',
      ),
    ).toBeVisible();
  });

  it('explica como a duração e o feedback serão usados', () => {
    render(<OnboardingWizard {...baseProps} />);

    const duration = screen.getByLabelText('Duração preferida da sessão');
    expect(duration).toHaveAttribute(
      'aria-describedby',
      'session-duration-context session-duration-help',
    );
    expect(
      screen.getByText(
        'Ajuda o Iatron a montar um plano que caiba na sua rotina.',
      ),
    ).toBeVisible();
    expect(
      screen.getByText('Escolha o tempo por sessão. Você poderá mudar depois.'),
    ).toBeVisible();

    const feedback = screen.getByLabelText(
      'Como você prefere receber feedback durante os exercícios?',
    );
    expect(feedback).toHaveAttribute(
      'aria-describedby',
      'assessment-preference-context assessment-preference-help assessment-option-description',
    );
    expect(
      screen.getByText(
        'Isso define quanta orientação você verá durante os exercícios.',
      ),
    ).toBeVisible();
    expect(
      screen.getByText('Receba explicações e dicas durante o estudo.'),
    ).toBeVisible();

    fireEvent.change(feedback, { target: { value: 'independent' } });
    expect(
      screen.getByText(
        'Veja o resultado e consulte explicações quando desejar.',
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Essas preferências ajudam o Iatron a criar um plano mais adequado para sua rotina. Você poderá alterá-las depois.',
      ),
    ).toBeVisible();
  });
});

describe('provas-alvo regionais do onboarding', () => {
  beforeEach(() => {
    saveOnboarding.mockReset();
    saveOnboarding.mockResolvedValue({ ok: true });
  });

  it('prioriza o Rio Grande do Sul e pesquisa por sigla, instituição ou cidade', () => {
    render(<OnboardingWizard {...baseProps} initialStep={3} />);

    expect(screen.getByLabelText('Estado')).toHaveValue('RS');
    expect(screen.getByText(/Prova AMB\/AMRIGS/)).toBeVisible();
    expect(
      screen.queryByText(/Hospital Universitário da UFSC/),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { value: '' },
    });
    fireEvent.change(
      screen.getByLabelText('Buscar prova, instituição ou cidade'),
      { target: { value: 'Florianópolis' } },
    );

    expect(screen.getByText(/Hospital Universitário da UFSC/)).toBeVisible();
    expect(screen.queryByText(/Prova AMB\/AMRIGS/)).not.toBeInTheDocument();
  });

  it('seleciona e persiste mais de uma prova-alvo', async () => {
    render(<OnboardingWizard {...baseProps} initialStep={3} />);
    fireEvent.click(screen.getByText(/Prova AMB\/AMRIGS/));
    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByText(/Hospital Universitário da UFSC/));

    expect(screen.getByText('2 provas selecionadas')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar e continuar' }));

    await waitFor(() => expect(saveOnboarding).toHaveBeenCalledOnce());
    expect(saveOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({
        examEditionIds: [
          '64000000-0000-4000-8000-000000000001',
          '64000000-0000-4000-8000-000000000006',
        ],
      }),
    );
  });

  it('não bloqueia o onboarding quando a prova ainda não está no catálogo', async () => {
    render(<OnboardingWizard {...baseProps} initialStep={3} />);
    fireEvent.change(
      screen.getByLabelText('Buscar prova, instituição ou cidade'),
      { target: { value: 'processo inexistente' } },
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Não encontrou sua prova?',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Salvar e continuar' }));

    await waitFor(() => expect(saveOnboarding).toHaveBeenCalledOnce());
    expect(saveOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({ examEditionIds: [] }),
    );
  });

  it('retoma seleções já persistidas', () => {
    render(
      <OnboardingWizard
        {...baseProps}
        initialStep={3}
        initialTargets={['64000000-0000-4000-8000-000000000001']}
      />,
    );

    expect(screen.getByText('1 prova selecionada')).toBeVisible();
    expect(
      screen.getByRole('checkbox', { name: /Prova AMB\/AMRIGS/ }),
    ).toBeChecked();
  });
});
