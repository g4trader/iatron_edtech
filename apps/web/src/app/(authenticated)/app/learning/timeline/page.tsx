import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
export default async function TimelinePage() {
  const items = await learningState.timeline();
  return (
    <LearningPage
      title="Sua evolução"
      description="Acompanhe as atividades que construíram seu progresso ao longo do tempo."
    >
      {items.length === 0 && <EmptyLearningState />}
      {items.map((item) => (
        <LearningCard
          key={`${item.type}-${item.id}`}
          title={item.title}
          eyebrow={item.type}
        >
          <p>{item.detail}</p>
          <time dateTime={item.occurredAt}>
            {new Date(item.occurredAt).toLocaleString('pt-BR')}
          </time>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
