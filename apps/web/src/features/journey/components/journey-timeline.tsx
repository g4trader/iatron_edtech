'use client';
import { useState } from 'react';
export type JourneyStepStatus = 'complete' | 'current' | 'upcoming';
export interface JourneyStep {
  label: string;
  status: JourneyStepStatus;
}
export function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  const [expanded, setExpanded] = useState(false);
  const currentStep = steps.find((step) => step.status === 'current');
  const completed = steps.filter((step) => step.status === 'complete').length;
  return (
    <section
      aria-label="Seu progresso"
      className="journey-timeline"
      data-expanded={expanded}
    >
      <div className="journey-timeline-heading">
        <h2>Seu progresso</h2>
        <p>
          {completed} de {steps.length} marcos concluídos
        </p>
      </div>
      <p className="journey-current">
        {currentStep
          ? `Você está em: ${currentStep.label}`
          : 'Marcos registrados'}
      </p>
      <ol id="preparation-milestones">
        {steps.map((step) => (
          <li
            data-status={step.status}
            aria-current={step.status === 'current' ? 'step' : undefined}
            key={step.label}
          >
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
                    : 'Pendente'}
              </small>
            </span>
          </li>
        ))}
      </ol>
      <button
        className="journey-expand secondary-button"
        type="button"
        aria-expanded={expanded}
        aria-controls="preparation-milestones"
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? 'Recolher progresso' : 'Ver todas as etapas'}
      </button>
      <p className="journey-progress-note">
        Marcos de organização dos estudos; não indicam aprovação ou prontidão
        para a prova.
      </p>
    </section>
  );
}
