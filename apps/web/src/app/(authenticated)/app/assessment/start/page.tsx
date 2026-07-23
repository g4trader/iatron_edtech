import { startDiagnostic } from '@/features/assessments/actions';
import { AssessmentPage } from '@/features/assessments/components/adaptive-page';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';

export default function StartPage() {
  return (
    <AssessmentPage
      title="Diagnóstico inicial"
      description="Este é o primeiro passo para entendermos o que você já domina e onde seu tempo de estudo pode fazer mais diferença."
    >
      <form
        action={startDiagnostic}
        className="experience-callout"
      >
        <div>
          <p className="eyebrow">Como funciona</p>
          <h2>Uma avaliação guiada, no seu ritmo</h2>
          <ol className="experience-steps">
            <li>Você responde até 10 questões em cerca de 30 minutos.</li>
            <li>As próximas questões se ajustam às suas respostas.</li>
            <li>Ao final, mostramos seus pontos fortes e prioridades.</li>
          </ol>
          <p className="experience-reassurance">
            Não é uma prova. É o ponto de partida para personalizar seu plano.
          </p>
        </div>
        <ActionSubmitButton
          className="mt-4"
          pendingLabel="Preparando seu diagnóstico…"
        >
          Iniciar diagnóstico
        </ActionSubmitButton>
      </form>
    </AssessmentPage>
  );
}
