import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
export default async function GapsPage() {
  const items = await learningState.gaps();
  return (
    <LearningPage
      title="Learning gaps"
      description="Competências críticas, esquecidas ou com evidência insuficiente."
    >
      {items.length === 0 && <EmptyLearningState />}
      {items.map((item) => (
        <LearningCard
          key={item.competencyId}
          title={item.competencyName}
          eyebrow={`${item.competencyCode} · prioridade ${Math.round(item.priority * 100)}%`}
        >
          <p>Motivos: {item.reasons.join(', ')}</p>
          <p>
            Mastery {Math.round(item.mastery * 100)}% · confiança{' '}
            {Math.round(item.confidence * 100)}%
          </p>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
