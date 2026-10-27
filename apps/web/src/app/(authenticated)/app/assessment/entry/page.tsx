import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AssessmentPage } from '@/features/assessments/components/adaptive-page';
import { assessmentHistory } from '@/features/assessments/server/adaptive-assessment';
import { selectAssessmentEntry } from '@/features/assessments/entry-state';
import { DiagnosticEntryForm } from '@/features/assessments/entry-form';
import { AcquisitionView } from '@/features/acquisition/acquisition-view';

export default async function DiagnosticEntryPage() {
  const { current, completed } = selectAssessmentEntry(
    await assessmentHistory(),
  );
  if (!current && !completed) redirect('/app/assessment/start');
  return (
    <AssessmentPage
      title={
        current
          ? 'Continue de onde parou'
          : 'Seu ponto de partida já está registrado'
      }
      description={
        current
          ? 'Suas respostas estão salvas. Retome a avaliação para continuar seu diagnóstico.'
          : 'Reveja seus resultados ou acompanhe os próximos passos da sua preparação.'
      }
    >
      <AcquisitionView name="diagnostic_entry_view" />
      {current ? (
        <>
          <p>
            {current.answeredCount} de {current.questionCount} questões
            respondidas.
          </p>
          <DiagnosticEntryForm kind="resume" assessmentId={current.id} />
        </>
      ) : (
        completed && (
          <div className="flex flex-wrap gap-3">
            <Link
              className="primary-button"
              href={`/app/assessment/result?id=${completed.id}`}
            >
              Ver meu diagnóstico
            </Link>
            <Link className="secondary-button" href="/app/plan">
              Ver minha trilha de estudos
            </Link>
            <Link className="secondary-button" href="/app/assessment/start">
              Fazer um novo diagnóstico
            </Link>
          </div>
        )
      )}
    </AssessmentPage>
  );
}
