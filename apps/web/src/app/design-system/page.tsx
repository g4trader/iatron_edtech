import { notFound } from 'next/navigation';
import { Button } from '@iatron/ui';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SkeletonMessage,
  UsageLimitNotice,
} from '@/components/feedback/states';
import { QuestionCard } from '@/features/assessments/components/question-card';
import {
  demoQuestion,
  gapConversation,
  planConversation,
} from '@/features/conversations/mocks/demo-data';
import {
  AssistantMessage,
  UserMessage,
} from '@/features/conversations/components/message-list';
import {
  GapSummaryCard,
  StudyPlanCard,
} from '@/features/learning/components/learning-cards';

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const gapPart = gapConversation[0]?.parts.find(
    (part) => part.type === 'gap-summary',
  );
  const planPart = planConversation[0]?.parts.find(
    (part) => part.type === 'study-plan',
  );
  return (
    <main className="design-system">
      <header>
        <p className="eyebrow">Uso interno · desenvolvimento</p>
        <h1>Sistema visual Iatron</h1>
        <p>Tokens e componentes da experiência educacional.</p>
      </header>
      <section>
        <h2>Tokens</h2>
        <div className="token-grid">
          {[
            'background',
            'surface',
            'surface-elevated',
            'foreground',
            'foreground-muted',
            'border',
            'primary',
            'primary-hover',
            'accent',
            'success',
            'warning',
            'error',
            'focus-ring',
          ].map((token) => (
            <div key={token}>
              <span style={{ background: `var(--${token})` }} />
              <code>{token}</code>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>Tipografia e ações</h2>
        <h1>Título principal</h1>
        <h2>Título de seção</h2>
        <p>Texto confortável para leitura prolongada em português.</p>
        <div className="button-row">
          <Button>Primário</Button>
          <button className="secondary-button">Secundário</button>
          <input
            aria-label="Campo demonstrativo"
            placeholder="Campo de texto"
          />
        </div>
      </section>
      <section>
        <h2>Mensagens</h2>
        <UserMessage
          message={{
            id: 'u',
            role: 'user',
            createdAt: '',
            parts: [
              { type: 'text', text: 'Quero revisar um tema importante.' },
            ],
          }}
        />
        <AssistantMessage
          message={{
            id: 'a',
            role: 'assistant',
            createdAt: '',
            status: 'complete',
            parts: [
              {
                type: 'text',
                text: 'Vamos organizar uma sessão objetiva e confortável.',
              },
            ],
          }}
        />
      </section>
      <section>
        <h2>Aprendizagem</h2>
        <div className="two-column">
          {gapPart?.type === 'gap-summary' && (
            <GapSummaryCard data={gapPart.data} />
          )}
          {planPart?.type === 'study-plan' && (
            <StudyPlanCard data={planPart.data} />
          )}
        </div>
      </section>
      <section>
        <h2>Avaliação</h2>
        <QuestionCard question={demoQuestion} />
      </section>
      <section>
        <h2>Estados</h2>
        <div className="state-grid">
          <LoadingState />
          <EmptyState
            description="Não há itens para exibir."
            title="Estado vazio"
          />
          <ErrorState message="Erro demonstrativo." />
          <UsageLimitNotice />
          <SkeletonMessage />
        </div>
      </section>
    </main>
  );
}
