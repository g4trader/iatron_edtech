import Link from 'next/link';
import { EmptyState } from '@/components/feedback/states';
import {
  AssessmentPage,
  Metric,
} from '@/features/assessments/components/adaptive-page';
import {
  assessmentHistory,
  assessmentResult,
} from '@/features/assessments/server/adaptive-assessment';

export default async function CoveragePage() {
  const latest = (await assessmentHistory()).find(
    (item) => item.status === 'completed',
  );
  if (!latest)
    return (
      <AssessmentPage
        title="O que já foi avaliado"
        description="Aqui você verá quais competências já conhecemos bem e quais ainda precisam ser medidas."
      >
        <EmptyState
          title="Precisamos do seu primeiro diagnóstico"
          description="Depois dele, mostraremos o alcance da avaliação e onde ainda precisamos conhecer melhor seu nível."
          action={
            <Link
              className="primary-button inline-flex"
              href="/app/assessment/start"
            >
              Começar diagnóstico
            </Link>
          }
        />
      </AssessmentPage>
    );
  const result = await assessmentResult(latest.id);
  const measured = result.competencies.filter(
    (item) => item.evidenceCount > 0,
  ).length;
  return (
    <AssessmentPage
      title="O que já foi avaliado"
      description="Veja quanto do seu conhecimento já conseguimos medir com segurança."
    >
      <section className="experience-callout">
        <div>
          <p className="eyebrow">Seu diagnóstico evolui com você</p>
          <h2>
            {measured === result.competencies.length
              ? 'Já passamos por todos os assuntos deste diagnóstico'
              : 'Alguns assuntos ainda precisam de mais respostas'}
          </h2>
          <p>
            Quanto mais você pratica, mais precisas ficam as prioridades e as
            sugestões do seu plano.
          </p>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Assuntos já observados"
          value={`${measured} de ${result.competencies.length}`}
        />
        <Metric label="Atividades concluídas" value={`${result.answeredCount}`} />
        <Metric
          label="Precisam de mais respostas"
          value={`${result.competencies.filter((item) => item.confidenceLevel === 'low').length}`}
        />
      </div>
    </AssessmentPage>
  );
}
