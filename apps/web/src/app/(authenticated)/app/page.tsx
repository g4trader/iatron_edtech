import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@/components/layout/page-container';
import { EmptyState, ErrorState } from '@/components/feedback/states';
import { listTutorConversations } from '@/features/tutor/server/tutor';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';
import { getAuthState } from '@/lib/auth';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import { dominantMentor } from '@/features/mentors/mentors';
import {
  MentorIdentity,
  MentorMessage,
} from '@/features/mentors/components/mentor';

const actions = [
  {
    href: '/app/assessment/start',
    eyebrow: 'Conhecer seu ponto de partida',
    title: 'Fazer um diagnóstico',
    description: 'Descubra onde seu tempo de estudo pode fazer mais diferença.',
  },
  {
    href: '/app/tutor',
    eyebrow: 'Orientação dos especialistas',
    title: 'Conversar com um mentor',
    description: 'Entenda seu plano ou aprofunde um conteúdo com contexto.',
  },
  {
    href: '/app/performance',
    eyebrow: 'Acompanhar sua preparação',
    title: 'Ver minha evolução',
    description: 'Veja o que ganhou consistência e os próximos pontos a fortalecer.',
  },
] as const;

export default async function AppHomePage() {
  const authBypass = isAuthBypassEnabled(process.env);
  const { profile } = await getAuthState();
  let currentPlan: Awaited<ReturnType<typeof studyPlans.current>> = null;
  let conversations: Awaited<ReturnType<typeof listTutorConversations>> | null =
    [];
  try {
    currentPlan = await studyPlans.current();
  } catch {
    currentPlan = null;
  }
  if (!authBypass) {
    try {
      conversations = await listTutorConversations();
    } catch {
      conversations = null;
    }
  }
  const mentor = dominantMentor(currentPlan?.items ?? []);
  const firstName =
    profile?.display_name?.trim().split(/\s+/)[0] ?? 'estudante';
  const nextActivity = currentPlan?.items.find((item) =>
    ['planned', 'in_progress'].includes(item.status),
  );
  const completedCount =
    currentPlan?.items.filter((item) => item.status === 'completed').length ?? 0;
  return (
    <PageContainer>
      <section className="page-intro">
        <p className="eyebrow">Sua preparação</p>
        <h1>Olá, {firstName}.</h1>
        <p>
          Hoje vamos continuar sua preparação com um passo claro e possível
          para a sua rotina.
        </p>
      </section>
      <MentorMessage
        action={
          <Link className="primary-button inline-flex" href="/app/tutor">
            Conversar com {mentor.displayName}
          </Link>
        }
        mentor={mentor}
        title={mentor.greeting}
      >
        <p>
          {nextActivity
            ? `Seu plano indica ${nextActivity.competencyName} como um bom próximo passo. Essa atividade foi escolhida para aproximar sua prática das prioridades atuais.`
            : 'Antes de organizar as próximas atividades, quero conhecer seu ponto de partida. Um diagnóstico curto mostrará onde podemos ajudar mais.'}
        </p>
      </MentorMessage>
      <section aria-labelledby="next-step-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Seu próximo passo</p>
            <h2 id="next-step-title">
              {nextActivity
                ? nextActivity.competencyName
                : 'Vamos conhecer seu momento atual'}
            </h2>
          </div>
          <MentorIdentity compact mentor={mentor} />
        </div>
        <div className="next-step-card">
          <div>
            <p>
              {nextActivity
                ? `${nextActivity.estimatedMinutes} minutos reservados no seu plano. Ao concluir, usaremos sua atividade para orientar os estudos seguintes.`
                : 'Responda algumas questões para receber prioridades e um plano conectado à sua rotina.'}
            </p>
          </div>
          <Link
            className="primary-button inline-flex"
            href={nextActivity ? '/app/plan/today' : '/app/assessment/start'}
          >
            {nextActivity ? 'Continuar meu plano' : 'Começar diagnóstico'}
          </Link>
        </div>
      </section>
      {currentPlan && (
        <section aria-labelledby="home-progress-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Sua evolução nesta semana</p>
              <h2 id="home-progress-title">
                {completedCount > 0
                  ? `${completedCount} ${completedCount === 1 ? 'atividade concluída' : 'atividades concluídas'}`
                  : 'Seu plano está pronto para começar'}
              </h2>
            </div>
            <Link href="/app/plan">Ver plano completo</Link>
          </div>
          <p>
            Cada atividade concluída ajuda seus mentores a explicar melhor o
            que manter, revisar e priorizar a seguir.
          </p>
        </section>
      )}
      <section aria-labelledby="actions-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Outros caminhos</p>
            <h2 id="actions-title">O que você precisa agora?</h2>
          </div>
        </div>
        <div className="action-card-grid">
          {actions.map((action) => (
            <Link
              className="action-card"
              href={
                (authBypass && action.href === '/app/tutor'
                  ? '/app/tutor'
                  : action.href) as Route
              }
              key={action.href}
            >
              <span>{action.eyebrow}</span>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
              <strong aria-hidden="true">→</strong>
            </Link>
          ))}
        </div>
      </section>
      <section aria-labelledby="recent-home-title" className="home-recents">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Seus mentores</p>
            <h2 id="recent-home-title">Retome uma orientação</h2>
          </div>
          <Link href="/app/tutor">Falar com um mentor</Link>
        </div>
        {conversations === null ? (
          <ErrorState message="Não foi possível carregar suas conversas agora. Você ainda pode iniciar uma nova orientação com seus mentores." />
        ) : conversations.length === 0 ? (
          <EmptyState
            title="Seus mentores estão prontos para começar"
            description="Inicie uma orientação para entender seu diagnóstico, seu plano ou um conteúdo."
            action={
              <Link className="primary-button inline-flex" href="/app/tutor">
                Conversar com um mentor
              </Link>
            }
          />
        ) : (
          <div className="conversation-list">
            {conversations.slice(0, 4).map((item) => (
              <Link
                href={`/app/tutor/${item.id}` as Route}
                key={item.id}
              >
                <span className="conversation-icon" aria-hidden="true">
                  T
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>Continuar conversa</small>
                </span>
                <span aria-hidden="true">›</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
