import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
export default async function SchedulePage() {
  const items = await learningState.schedule();
  return (
    <LearningPage
      title="Agenda diária"
      description="Ordem determinística de competências recomendadas para hoje."
    >
      {items.length === 0 && <EmptyLearningState />}
      {items.map((item) => (
        <LearningCard
          key={item.competencyId}
          title={`${item.rank}. ${item.competencyName}`}
          eyebrow={item.competencyCode}
        >
          <p>{item.recommendedMinutes} minutos recomendados</p>
          <p>
            Prioridade {Math.round(item.priority * 100)}% ·{' '}
            {item.reasons.join(', ')}
          </p>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
