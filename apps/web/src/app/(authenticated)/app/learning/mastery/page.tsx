import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
  learningTrendLabel,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
import { learningStage, measurementClarity } from '@/lib/learning-language';
export default async function MasteryPage() {
  const items = await learningState.mastery();
  return (
    <LearningPage
      title="Seu domínio por competência"
      description="Veja quanto cada competência está consolidada e quanto já conhecemos sobre seu aprendizado."
    >
      {items.length === 0 && <EmptyLearningState />}
      {items.map((item) => (
        <LearningCard
          key={item.competencyId}
          title={item.competencyName}
          eyebrow={learningTrendLabel(item.trend)}
        >
          <p>{learningStage(item.mastery)}</p>
          <p>{measurementClarity(item.confidence)}</p>
          <p>
            {item.evidenceCount === 1
              ? '1 atividade ajudou a construir este retrato.'
              : `${item.evidenceCount} atividades ajudaram a construir este retrato.`}
          </p>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
