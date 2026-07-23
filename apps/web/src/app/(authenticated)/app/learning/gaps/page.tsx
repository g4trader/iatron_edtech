import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
  learningReasonLabel,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
import Link from 'next/link';
export default async function GapsPage() {
  const items = await learningState.gaps();
  return (
    <LearningPage
      title="Suas prioridades de estudo"
      description="Entenda quais competências merecem atenção agora e por que elas foram priorizadas."
    >
      {items.length === 0 && <EmptyLearningState />}
      {items.map((item) => (
        <LearningCard
          key={item.competencyId}
          title={item.competencyName}
          eyebrow={`${item.competencyCode} · importância ${Math.round(item.priority * 100)}%`}
        >
          <p>
            Por que estudar agora:{' '}
            {item.reasons.map(learningReasonLabel).join(', ')}
          </p>
          <p>
            Domínio {Math.round(item.mastery * 100)}% · confiança da medição{' '}
            {Math.round(item.confidence * 100)}%
          </p>
          <Link className="secondary-button inline-flex" href={{ pathname: '/app/tutor', query: { mode: 'gap_coaching', originType: 'gap', originId: item.competencyId } }}>
            Entender esta prioridade com o tutor
          </Link>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
