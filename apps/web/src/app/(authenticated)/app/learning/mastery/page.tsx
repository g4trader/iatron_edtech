import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
  learningTrendLabel,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
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
          eyebrow={item.competencyCode}
        >
          <p>
            Domínio: {Math.round(item.mastery * 100)}% · confiança:{' '}
            {Math.round(item.confidence * 100)}%
          </p>
          <p>
            {item.evidenceCount} atividade(s) considerada(s) · tendência{' '}
            {learningTrendLabel(item.trend)}
          </p>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
