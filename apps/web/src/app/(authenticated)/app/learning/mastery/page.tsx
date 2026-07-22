import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
export default async function MasteryPage() {
  const items = await learningState.mastery();
  return (
    <LearningPage
      title="Mastery por competência"
      description="Estado derivado exclusivamente das evidências registradas."
    >
      {items.length === 0 && <EmptyLearningState />}
      {items.map((item) => (
        <LearningCard
          key={item.competencyId}
          title={item.competencyName}
          eyebrow={item.competencyCode}
        >
          <p>
            Domínio: {Math.round(item.mastery * 100)}% · confiança:{' '}
            {Math.round(item.confidence * 100)}%
          </p>
          <p>
            {item.evidenceCount} evidência(s) · tendência {item.trend}
          </p>
          <p>Algoritmo: {item.algorithmVersion}</p>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
