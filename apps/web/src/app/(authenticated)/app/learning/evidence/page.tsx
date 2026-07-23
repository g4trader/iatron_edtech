import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
import { difficultyLabel } from '@/lib/learning-language';
export default async function EvidencePage() {
  const items = await learningState.evidence();
  return (
    <LearningPage
      title="Como seu progresso é reconhecido"
      description="Cada resposta e atividade ajuda o Iatron a entender seu momento em cada competência."
    >
      {items.length === 0 && <EmptyLearningState />}
      {items.map((item) => (
        <LearningCard
          key={item.id}
          title={item.competencyName}
          eyebrow={item.isCorrect ? 'Resposta correta' : 'Oportunidade de revisão'}
        >
          <p>Esta foi uma {difficultyLabel(item.difficulty)}.</p>
          <p>
            Você respondeu em{' '}
            {item.responseTimeMs === null
              ? 'um tempo não registrado'
              : `${Math.round(item.responseTimeMs / 1000)}s`}
            .
          </p>
          <p>
            Esta atividade passou a fazer parte da sua evolução em{' '}
            {new Date(item.observedAt).toLocaleString('pt-BR')}
          </p>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
