import { startDiagnostic } from '@/features/assessments/actions';
import { AssessmentPage } from '@/features/assessments/components/adaptive-page';

export default function StartPage() {
  return (
    <AssessmentPage
      title="Diagnóstico inicial"
      description="A seleção mede competências com baixa evidência de forma reproduzível."
    >
      <form
        action={startDiagnostic}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <p>30 minutos · até 10 questões · dificuldade adaptativa</p>
        <button className="primary-button mt-4">Iniciar diagnóstico</button>
      </form>
    </AssessmentPage>
  );
}
