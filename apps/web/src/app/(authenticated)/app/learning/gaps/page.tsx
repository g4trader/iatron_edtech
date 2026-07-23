import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
  learningReasonLabel,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
import Link from 'next/link';
import {
  learningStage,
  measurementClarity,
  studyPriority,
} from '@/lib/learning-language';
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
          eyebrow={studyPriority(item.priority)}
        >
          <p>
            Por que estudar agora:{' '}
            {item.reasons.map(learningReasonLabel).join(', ')}
          </p>
          <p>{learningStage(item.mastery)}</p>
          <p>{measurementClarity(item.confidence)}</p>
          <Link className="secondary-button inline-flex" href={{ pathname: '/app/tutor', query: { mode: 'gap_coaching', originType: 'gap', originId: item.competencyId } }}>
            Entender esta prioridade com o tutor
          </Link>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
