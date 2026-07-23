import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import type { TutorMode, TutorOriginType } from '@iatron/contracts';
import { createTutorConversation, listTutorConversations } from '@/features/tutor/server/tutor';
import { EmptyState } from '@/components/feedback/states';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';

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
  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <p className="eyebrow">Seu tutor de estudos</p>
        <h1>Olá, sou seu tutor de estudos</h1>
        <p>
          Estou aqui para explicar seu diagnóstico, mostrar por que cada
          atividade entrou no plano e ajudar você a compreender conteúdos
          difíceis — sempre usando as informações reais da sua aprendizagem.
        </p>
        <form action={create}>
          <ActionSubmitButton pendingLabel="Abrindo sua conversa…">
            Começar conversa
          </ActionSubmitButton>
        </form>
      </header>
      <section className="catalog-grid" aria-label="Histórico de conversas">
        {conversations.length === 0 && (
          <EmptyState
            title="Comece sua primeira conversa"
            description="Experimente perguntar: “Por que esta competência está no meu plano?”, “O que significa meu domínio?” ou “Como posso melhorar este ponto?”"
            action={
              <form action={create}>
                <ActionSubmitButton pendingLabel="Abrindo sua conversa…">
                  Fazer minha primeira pergunta
                </ActionSubmitButton>
              </form>
            }
          />
        )}
        {conversations.map((conversation) => (
          <Link className="catalog-card" href={`/app/tutor/${conversation.id}` as Route} key={conversation.id}>
            <strong>{conversation.title}</strong>
            <span>Continuar conversa</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
