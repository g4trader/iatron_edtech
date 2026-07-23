import { startDiagnostic } from '@/features/assessments/actions';
import { AssessmentPage } from '@/features/assessments/components/adaptive-page';

export default function StartPage() {
  return (
    <AssessmentPage
      title="Diagnóstico inicial"
      description="Responda algumas questões para identificarmos seus pontos fortes e as melhores prioridades para o seu plano."
    >
      <form
        action={startDiagnostic}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <p>Reserve cerca de 30 minutos. A avaliação terá até 10 questões.</p>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          As próximas perguntas se ajustam às suas respostas. Você verá o
          resultado assim que concluir.
        </p>
        <button className="primary-button mt-4">Iniciar diagnóstico</button>
      </form>
    </AssessmentPage>
  );
}
