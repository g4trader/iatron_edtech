import Link from 'next/link';
import type { Route } from 'next';
import { editorial } from '@/features/editorial/server/editorial';

export default async function ReviewHome() {
  const contents = await editorial.reviewQueue();
  const waiting = contents.filter(
    ({ editorialStatus }) => editorialStatus === 'awaiting_mentor_review',
  );
  return (
    <main className="experience-page mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Sua fila médica
        </p>
        <h1 className="text-3xl font-semibold">
          Conteúdos aguardando sua revisão
        </h1>
        <p>
          Revise cada versão com calma. Nenhuma decisão publica o material
          automaticamente.
        </p>
      </header>
      <section aria-label="Resumo da fila" className="state-card">
        <strong>{waiting.length} aguardando revisão</strong>
        <p>
          Tempo estimado:{' '}
          {waiting.reduce((sum, item) => sum + item.estimatedMinutes, 0)}{' '}
          minutos.
        </p>
      </section>
      {contents.length ? (
        <ol className="space-y-4">
          {contents.map((item) => (
            <li className="state-card" key={item.id}>
              <p className="text-sm text-[var(--foreground-muted)]">
                Versão {item.versionNumber} · {item.requestCount} solicitações
              </p>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
              <Link
                className="primary-button inline-flex"
                href={`/review/${item.id}` as Route}
              >
                Abrir conteúdo para revisão
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <section className="state-card">
          <h2>Sua fila está em dia</h2>
          <p>
            Novos conteúdos atribuídos aparecerão aqui com versão e prioridade.
          </p>
        </section>
      )}
    </main>
  );
}
