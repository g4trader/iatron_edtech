import {
  EmptyLearningState,
  LearningCard,
  LearningPage,
} from '@/features/learning/components/learning-page';
import { learningState } from '@/features/learning/server/learning';
export default async function EvidencePage() {
  const items = await learningState.evidence();
  return (
    <LearningPage
      title="Evidências"
      description="Fatos explicáveis derivados dos eventos de aprendizagem."
    >
      {items.length === 0 && <EmptyLearningState />}
      {items.map((item) => (
        <LearningCard
          key={item.id}
          title={item.competencyName}
          eyebrow={item.competencyCode}
        >
          <p>
            {item.isCorrect ? 'Acerto' : 'Erro'} · dificuldade {item.difficulty}{' '}
            · peso {item.weight}
          </p>
          <p>
            Tempo:{' '}
            {item.responseTimeMs === null
              ? 'não informado'
              : `${Math.round(item.responseTimeMs / 1000)}s`}
          </p>
          <p>
            {new Date(item.observedAt).toLocaleString('pt-BR')} ·{' '}
            {item.algorithmVersion}
          </p>
        </LearningCard>
      ))}
    </LearningPage>
  );
}
