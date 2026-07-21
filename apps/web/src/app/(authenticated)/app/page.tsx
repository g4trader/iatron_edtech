import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { recentConversations } from '@/features/conversations/mocks/demo-data';

const actions = [
  {
    href: '/app/assessment/demo',
    eyebrow: 'Avaliação',
    title: 'Continuar minha avaliação',
    description: 'Retome a demonstração do ponto em que parou.',
  },
  {
    href: '/app/performance',
    eyebrow: 'Prioridades',
    title: 'Ver meus principais gaps',
    description: 'Consulte dados claramente demonstrativos.',
  },
  {
    href: '/app/plan',
    eyebrow: 'Hoje',
    title: 'Estudar o plano de hoje',
    description: 'Organize uma sessão de estudo focada.',
  },
  {
    href: '/app/simulations',
    eyebrow: 'Prática',
    title: 'Fazer um simulado rápido',
    description: 'Explore os formatos disponíveis.',
  },
  {
    href: '/app/chat/question',
    eyebrow: 'Revisão',
    title: 'Revisar meus últimos erros',
    description: 'Abra uma questão dentro da conversa.',
  },
] as const;

export default function AppHomePage() {
  return (
    <PageContainer>
      <section className="page-intro">
        <p className="eyebrow">Próxima melhor ação</p>
        <h2>Vamos retomar sua preparação.</h2>
        <p>
          Escolha um caminho para continuar. Os dados desta fase são apenas
          demonstrativos.
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
            <Link className="action-card" href={action.href} key={action.href}>
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
            <p className="eyebrow">Histórico local</p>
            <h2 id="recent-home-title">Conversas recentes</h2>
          </div>
          <Link href="/app/chat/new">Nova conversa</Link>
        </div>
        <div className="conversation-list">
          {recentConversations.map((item) => (
            <Link href={`/app/chat/${item.id}`} key={item.id}>
              <span className="conversation-icon" aria-hidden="true">
                C
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.dateLabel}</small>
              </span>
              <span aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
