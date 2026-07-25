import { startDiagnostic } from '@/features/assessments/actions';
import { AssessmentPage } from '@/features/assessments/components/adaptive-page';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import { dominantMentor, mentors } from '@/features/mentors/mentors';
import {
  MentorCard,
  MentorMessage,
  TargetExamBadge,
} from '@/features/mentors/components/mentor';
import { examIntelligenceContext } from '@/features/exam-intelligence/server/context';

export default async function StartPage() {
  let plan: Awaited<ReturnType<typeof studyPlans.current>> = null;
  try {
    plan = await studyPlans.current();
  } catch {
    plan = null;
  }
  const mentor = dominantMentor(plan?.items ?? []);
  let examContext: Awaited<ReturnType<typeof examIntelligenceContext>> = null;
  try {
    examContext = await examIntelligenceContext();
  } catch {
    examContext = null;
  }
  return (
    <AssessmentPage
      title="Diagnóstico inicial"
      description="Este é o primeiro passo para entendermos o que você já domina e onde seu tempo de estudo pode fazer mais diferença."
    >
      {examContext?.availability === 'available' && (
        <TargetExamBadge
          isSynthetic={examContext.profile.isSynthetic}
          name={examContext.profile.displayName}
        />
      )}
      <MentorMessage
        mentor={mentor}
        title="Vamos entender seu ponto de partida nas grandes áreas."
      >
        <p>
          Não se preocupe em acertar tudo. O objetivo é descobrir exatamente
          onde podemos ajudar e evitar que você perca tempo com o que já está
          consistente.
        </p>
      </MentorMessage>
      <form action={startDiagnostic} className="experience-callout">
        <div>
          <p className="eyebrow">Como funciona</p>
          <h2>Uma avaliação guiada, no seu ritmo</h2>
          <ol className="experience-steps">
            <li>Você responde até 10 questões em cerca de 30 minutos.</li>
            <li>As próximas questões se ajustam às suas respostas.</li>
            <li>Ao final, mostramos seus pontos fortes e prioridades.</li>
          </ol>
          <p className="experience-reassurance">
            Não é uma prova. É o ponto de partida para personalizar seu plano.
          </p>
          <p>
            Em cada resposta, informe também o quanto você se sente seguro. Isso
            ajuda a diferenciar conhecimento consistente de uma resposta
            incerta.
          </p>
        </div>
        <ActionSubmitButton
          className="mt-4"
          pendingLabel="Preparando seu diagnóstico…"
        >
          Descobrir meu ponto de partida
        </ActionSubmitButton>
      </form>
      <section aria-labelledby="diagnostic-mentors-title">
        <p className="eyebrow">Mentores por grande área</p>
        <h2 id="diagnostic-mentors-title">Quem acompanha esta experiência</h2>
        <div className="mentor-grid">
          {mentors.map((item) => (
            <MentorCard key={item.id} mentor={item} />
          ))}
        </div>
      </section>
    </AssessmentPage>
  );
}
