import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
  learningReasonLabel,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
import { studyPriority } from '@/lib/learning-language';
export default async function SchedulePage() {
  const items = await learningState.schedule();
  return (
    <LearningPage
      title="Próximos estudos"
      description="Uma ordem sugerida para você usar melhor o tempo disponível hoje."
    >
      {items.length === 0 && <EmptyLearningState />}
      {items.map((item) => (
        <LearningCard
          key={item.competencyId}
          title={`${item.rank}. ${item.competencyName}`}
          eyebrow={studyPriority(item.priority)}
        >
          <p>{item.recommendedMinutes} minutos recomendados</p>
          <p>
            Por que estudar: {item.reasons.map(learningReasonLabel).join(', ')}
          </p>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
