import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import type { TutorMode, TutorOriginType } from '@iatron/contracts';
import { createTutorConversation, listTutorConversations } from '@/features/tutor/server/tutor';

export default async function TutorPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  async function create() {
    'use server';
    const mode = (params.mode ?? 'general') as TutorMode;
    const originType = (params.originType ?? null) as TutorOriginType | null;
    const result = await createTutorConversation({ mode, originType, originId: params.originId ?? null });
    redirect(`/app/tutor/${result.id}` as Route);
  }
  const conversations = await listTutorConversations();
  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <p className="eyebrow">Tutor IA</p>
        <h1>Converse sobre seu aprendizado</h1>
        <p>Explicações fundamentadas no seu diagnóstico e plano, sem alterar métricas determinísticas.</p>
        <form action={create}><button className="primary-action" type="submit">Nova conversa</button></form>
      </header>
      <section className="catalog-grid" aria-label="Histórico de conversas">
        {conversations.map((conversation) => (
          <Link className="catalog-card" href={`/app/tutor/${conversation.id}` as Route} key={conversation.id}>
            <strong>{conversation.title}</strong><span>{conversation.mode}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
