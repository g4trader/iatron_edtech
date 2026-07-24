import Link from 'next/link';
import { EmptyState } from '@/components/feedback/states';
import {
  AssessmentPage,
  Metric,
} from '@/features/assessments/components/adaptive-page';
import { assessmentResult } from '@/features/assessments/server/adaptive-assessment';
import {
  learningStage,
  measurementClarity,
} from '@/lib/learning-language';

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
              ? `${priorityCount} ${priorityCount === 1 ? 'assunto merece' : 'assuntos merecem'} atenção agora. Seu plano usará suas respostas para organizar os próximos passos.`
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
          label="Precisão deste retrato"
          value={
            result.overallConfidence >= 0.75
              ? 'Bem definida'
              : result.overallConfidence >= 0.4
                ? 'Em construção'
                : 'Precisamos conhecer mais'
          }
        />
        <Metric
          label="Assuntos conhecidos"
          value={`${result.competencies.filter((item) => item.evidenceCount > 0).length} de ${result.competencies.length}`}
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
        Entender meu resultado com um mentor
      </Link>
      <section className="space-y-2" aria-label="Resultado por competência">
        {result.competencies.map((item) => (
          <article
            key={item.competencyId}
            className="rounded-xl border border-[var(--color-border)] p-4"
          >
            <strong>{item.competencyName}</strong>
            <p>{classificationLabel[item.classification]}.</p>
            <p>{learningStage(item.mastery)}</p>
            <p>{measurementClarity(item.confidence)}</p>
          </article>
        ))}
      </section>
    </AssessmentPage>
  );
}
