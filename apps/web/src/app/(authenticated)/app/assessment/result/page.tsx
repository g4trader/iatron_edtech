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
const confidenceLabel = {
  low: 'baixa',
  medium: 'média',
  high: 'alta',
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
  const strongCount = result.competencies.filter(
    ({ classification }) => classification === 'strong',
  ).length;
  const priorityCount = result.competencies.filter(
    ({ classification }) => classification === 'weak',
  ).length;
  return (
    <AssessmentPage
      title="Agora já conhecemos seu ponto de partida"
      description="Seu resultado mostra o que já está consistente e onde seu tempo de estudo pode gerar mais avanço."
    >
      <section className="experience-callout" aria-label="Resumo do diagnóstico">
        <div>
          <p className="eyebrow">Seu retrato de hoje</p>
          <h2>
            {strongCount > 0
              ? `${strongCount} ${strongCount === 1 ? 'ponto forte identificado' : 'pontos fortes identificados'}`
              : 'Seu primeiro retrato está pronto'}
          </h2>
          <p>
            {priorityCount > 0
              ? `${priorityCount} ${priorityCount === 1 ? 'competência merece' : 'competências merecem'} atenção agora. Seu plano usará exatamente essas evidências para organizar os próximos passos.`
              : 'Continue praticando para aumentarmos a confiança deste diagnóstico e refinarmos seu plano.'}
          </p>
        </div>
        <Link className="primary-button inline-flex" href="/app/plan">
          Ver meu plano
        </Link>
      </section>
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
              {confidenceLabel[item.confidenceLevel]} ·{' '}
              {classificationLabel[item.classification]}
            </p>
          </article>
        ))}
      </section>
    </AssessmentPage>
  );
}
