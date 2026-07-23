import Link from 'next/link';
import { EmptyState } from '@/components/feedback/states';
import { AssessmentPage } from '@/features/assessments/components/adaptive-page';
import { assessmentHistory } from '@/features/assessments/server/adaptive-assessment';

export default async function HistoryPage() {
  const items = await assessmentHistory();
  return (
    <AssessmentPage
      title="Seus diagnósticos"
      description="Retome uma avaliação ou reveja como seu conhecimento evoluiu."
    >
      {items.length === 0 ? (
        <EmptyState
          title="Você ainda não fez um diagnóstico"
          description="Comece sua primeira avaliação para identificarmos seus pontos fortes e organizarmos suas prioridades."
          action={
            <Link
              className="primary-button inline-flex"
              href="/app/assessment/start"
            >
              Fazer meu diagnóstico
            </Link>
          }
        />
      ) : (
        items.map((item) => (
          <article
            key={item.id}
            className="mb-3 rounded-xl border border-[var(--color-border)] p-4"
          >
            <strong>{item.objective}</strong>
            <p>
              {item.status === 'completed' ? 'Concluído' : 'Em andamento'} ·{' '}
              {item.answeredCount}/{item.questionCount} questões
            </p>
            {item.status === 'completed' && (
              <Link href={`/app/assessment/result?id=${item.id}`}>
                Rever resultado
              </Link>
            )}
          </article>
        ))
      )}
    </AssessmentPage>
  );
}
