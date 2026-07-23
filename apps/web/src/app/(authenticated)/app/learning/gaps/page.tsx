import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
import Link from 'next/link';
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
          <Link className="secondary-button inline-flex" href={{ pathname: '/app/tutor', query: { mode: 'gap_coaching', originType: 'gap', originId: item.competencyId } }}>
            Trabalhar este gap com o tutor
          </Link>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
