export type JourneyStepStatus = 'complete' | 'current' | 'upcoming';

export interface JourneyStep {
  label: string;
  status: JourneyStepStatus;
}

export function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  const currentStep = steps.find((step) => step.status === 'current');

  return (
    <section aria-label="Progresso da sua jornada" className="journey-timeline">
      <div className="journey-timeline-heading">
        <p className="eyebrow">Sua jornada</p>
        {currentStep && <p>Você está em: {currentStep.label}</p>}
      </div>
      <ol>
        {steps.map((step) => (
          <li data-status={step.status} key={step.label}>
            <span aria-hidden="true" className="journey-marker">
              {step.status === 'complete' ? '✓' : ''}
            </span>
            <span>
              <strong>{step.label}</strong>
              <small>
                {step.status === 'complete'
                  ? 'Concluído'
                  : step.status === 'current'
                    ? 'Agora'
                    : 'Próxima etapa'}
              </small>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
