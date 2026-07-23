import Link from 'next/link';
import type { Route } from 'next';
import { PageContainer } from '@/components/layout/page-container';
import { EmptyState, ErrorState } from '@/components/feedback/states';
import { listTutorConversations } from '@/features/tutor/server/tutor';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';

const actions = [
  {
    href: '/app/assessment/start',
    eyebrow: 'Descobrir prioridades',
    title: 'Fazer meu diagnóstico',
    description: 'Entenda seus pontos fortes e onde vale concentrar o estudo.',
  },
  {
    href: '/app/performance',
    eyebrow: 'Acompanhar evolução',
    title: 'Ver meu domínio',
    description: 'Acompanhe o que já está consistente e o que precisa de atenção.',
  },
  {
    href: '/app/plan',
    eyebrow: 'Hoje',
    title: 'Estudar o plano de hoje',
    description: 'Veja a próxima atividade escolhida para a sua rotina.',
  },
  {
    href: '/app/tutor',
    eyebrow: 'Entender melhor',
    title: 'Conversar com meu tutor',
    description: 'Peça explicações conectadas ao seu diagnóstico e plano.',
  },
  {
    href: '/app/learning/gaps',
    eyebrow: 'Definir foco',
    title: 'Ver minhas prioridades',
    description: 'Entenda por que cada competência merece atenção agora.',
  },
] as const;

export default async function AppHomePage() {
  const authBypass = isAuthBypassEnabled(process.env);
  let conversations: Awaited<ReturnType<typeof listTutorConversations>> | null =
    [];
  if (!authBypass) {
    try {
      conversations = await listTutorConversations();
    } catch {
      conversations = null;
    }
  }
  return (
    <PageContainer>
      <section className="page-intro">
        <p className="eyebrow">Próxima melhor ação</p>
        <h1>Vamos retomar sua preparação.</h1>
        <p>
          O Iatron organiza seus próximos passos para você começar pelo que mais
          importa agora.
        </p>
      </section>
      <section aria-labelledby="actions-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Seu espaço de estudo</p>
            <h2 id="actions-title">O que você quer fazer agora?</h2>
          </div>
        </div>
        <div className="action-card-grid">
          {actions.map((action) => (
            <Link
              className="action-card"
              href={
                (authBypass && action.href === '/app/tutor'
                  ? '/app/chat/new'
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
            <p className="eyebrow">Seu tutor</p>
            <h2 id="recent-home-title">Retome uma conversa</h2>
          </div>
          <Link href="/app/chat/new">Nova conversa</Link>
        </div>
        {conversations === null ? (
          <ErrorState message="Não foi possível carregar suas conversas agora. Você ainda pode iniciar uma nova conversa com o tutor." />
        ) : conversations.length === 0 ? (
          <EmptyState
            title="Seu tutor está pronto para começar"
            description="Inicie uma conversa para entender melhor seu diagnóstico, seu plano ou uma competência."
            action={
              <Link className="primary-button inline-flex" href="/app/tutor">
                Conversar com o tutor
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
