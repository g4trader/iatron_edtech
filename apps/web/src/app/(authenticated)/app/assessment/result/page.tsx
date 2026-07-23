import Link from 'next/link';
import { EmptyState } from '@/components/feedback/states';
import {
  AssessmentPage,
  Metric,
} from '@/features/assessments/components/adaptive-page';
import { assessmentResult } from '@/features/assessments/server/adaptive-assessment';

const classificationLabel = {
  strong: 'ponto forte',
  weak: 'precisa de atenção',
  developing: 'em desenvolvimento',
  unmeasured: 'ainda não avaliada',
} as const;

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const id = (await searchParams).id;
  if (!id)
    return (
      <AssessmentPage
        title="Resultado do diagnóstico"
        description="Escolha um diagnóstico concluído para rever seus resultados."
      >
        <EmptyState
          title="Nenhum resultado selecionado"
          description="Abra seu histórico para escolher uma avaliação ou faça um novo diagnóstico."
          action={
            <Link
              className="primary-button inline-flex"
              href="/app/assessment/history"
            >
              Ver meus diagnósticos
            </Link>
          }
        />
      </AssessmentPage>
    );
  const result = await assessmentResult(id);
  return (
    <AssessmentPage
      title="Seu resultado"
      description="Use este retrato para entender seus pontos fortes e escolher onde concentrar o estudo."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Respostas corretas"
          value={`${result.correctCount}/${result.answeredCount}`}
        />
        <Metric
          label="Confiança da medição"
          value={`${Math.round(result.overallConfidence * 100)}%`}
        />
        <Metric
          label="Competências avaliadas"
          value={`${Math.round(result.diagnosticCoverage * 100)}%`}
        />
      </div>
      <Link
        className="secondary-button inline-flex"
        href={{
          pathname: '/app/tutor',
          query: {
            mode: 'study_guidance',
            originType: 'assessment',
            originId: id,
          },
        }}
      >
        Entender meu resultado com o tutor
      </Link>
      <section className="space-y-2" aria-label="Resultado por competência">
        {result.competencies.map((item) => (
          <article
            key={item.competencyId}
            className="rounded-xl border border-[var(--color-border)] p-4"
          >
            <strong>
              {item.competencyCode} · {item.competencyName}
            </strong>
            <p>
              Domínio {Math.round(item.mastery * 100)}% · confiança{' '}
              {item.confidenceLevel} ·{' '}
              {classificationLabel[item.classification]}
            </p>
          </article>
        ))}
      </section>
    </AssessmentPage>
  );
}
