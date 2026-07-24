import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import type { TutorMode, TutorOriginType } from '@iatron/contracts';
import { createTutorConversation, listTutorConversations } from '@/features/tutor/server/tutor';
import { EmptyState } from '@/components/feedback/states';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import { dominantMentor, mentors } from '@/features/mentors/mentors';
import {
  MentorCard,
  MentorMessage,
} from '@/features/mentors/components/mentor';

export default async function TutorPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const authBypass = isAuthBypassEnabled(process.env);
  async function create() {
    'use server';
    if (isAuthBypassEnabled(process.env)) redirect('/app/chat/new');
    const mode = (params.mode ?? 'general') as TutorMode;
    const originType = (params.originType ?? null) as TutorOriginType | null;
    const result = await createTutorConversation({ mode, originType, originId: params.originId ?? null });
    redirect(`/app/tutor/${result.id}` as Route);
  }
  const conversations = authBypass ? [] : await listTutorConversations();
  let plan: Awaited<ReturnType<typeof studyPlans.current>> = null;
  try {
    plan = await studyPlans.current();
  } catch {
    plan = null;
  }
  const mentor = dominantMentor(plan?.items ?? []);
  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <p className="eyebrow">Mentores do Iatron</p>
        <h1>Orientação médica para cada etapa da sua preparação</h1>
        <p>
          Nossos especialistas ajudam você a entender seu diagnóstico, seu
          plano e os conteúdos mais difíceis. A tecnologia amplia essa
          orientação usando apenas informações reais da sua preparação.
        </p>
      </header>
      <MentorMessage
        action={
          <form action={create}>
            <ActionSubmitButton pendingLabel="Preparando sua orientação…">
              Conversar com {mentor.displayName}
            </ActionSubmitButton>
          </form>
        }
        mentor={mentor}
        title={`${mentor.displayName} está acompanhando seu momento atual`}
      >
        <p>
          {plan
            ? `Seu plano tem maior presença de ${mentor.specialty}. Você pode pedir uma explicação sobre uma atividade, revisar um resultado ou aprofundar um conteúdo.`
            : 'Quando você concluir seu diagnóstico, o especialista mais próximo das suas prioridades assumirá a condução da experiência.'}
        </p>
      </MentorMessage>
      <section aria-labelledby="mentor-list-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Equipe de especialistas</p>
            <h2 id="mentor-list-title">Quem acompanha você</h2>
          </div>
        </div>
        <div className="mentor-grid">
          {mentors.map((item) => (
            <MentorCard key={item.id} mentor={item} />
          ))}
        </div>
      </section>
      <section className="catalog-grid" aria-label="Orientações anteriores">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Seu histórico</p>
            <h2>Orientações anteriores</h2>
          </div>
        </div>
        {conversations.length === 0 && (
          <EmptyState
            title="Comece sua primeira orientação"
            description="Você pode perguntar: “Por que este tema está no meu plano?”, “O que meu resultado indica?” ou “Como posso fortalecer este conteúdo?”"
            action={
              <form action={create}>
                <ActionSubmitButton pendingLabel="Preparando sua orientação…">
                  Conversar com {mentor.displayName}
                </ActionSubmitButton>
              </form>
            }
          />
        )}
        {conversations.map((conversation) => (
          <Link className="catalog-card" href={`/app/tutor/${conversation.id}` as Route} key={conversation.id}>
            <strong>{conversation.title}</strong>
            <span>Continuar orientação</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
