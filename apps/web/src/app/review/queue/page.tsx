import Link from 'next/link';
import type { Route } from 'next';
import { editorial } from '@/features/editorial/server/editorial';

export default async function MentorQueuePage() {
  const contents = (await editorial.reviewQueue())
    .filter(
      ({ editorialStatus }) => editorialStatus === 'awaiting_mentor_review',
    )
    .sort((a, b) => b.requestCount - a.requestCount);
  return (
    <main className="experience-page mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">Minha fila</p>
        <h1>Conteúdos aguardando revisão</h1>
        <p>
          Solicitações dos estudantes aparecem primeiro. Abra uma versão para
          entender o motivo e as mudanças antes de decidir.
        </p>
      </header>
      {contents.length ? (
        <ol className="space-y-4">
          {contents.map((item) => (
            <li className="state-card" key={item.id}>
              <p className="text-sm text-[var(--foreground-muted)]">
                {item.requestCount > 0 ? 'Prioridade alta' : 'Fila regular'} ·
                versão {item.versionNumber} · {item.estimatedMinutes} min
              </p>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
              <Link
                className="primary-button inline-flex"
                href={`/review/${item.id}` as Route}
              >
                Revisar esta versão
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <section className="state-card">
          <h2>Sua fila está em dia</h2>
          <p>
            Quando um conteúdo for atribuído a você, ele aparecerá aqui com o
            contexto necessário para a revisão.
          </p>
        </section>
      )}
    </main>
  );
}
