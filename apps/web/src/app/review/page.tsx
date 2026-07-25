import Link from 'next/link';
import { editorial } from '@/features/editorial/server/editorial';

export default async function ReviewHome() {
  const [contents, history] = await Promise.all([
    editorial.reviewQueue(),
    editorial.reviewHistory(1, 20),
  ]);
  const waiting = contents.filter(
    ({ editorialStatus }) => editorialStatus === 'awaiting_mentor_review',
  );
  const lastReview = history.items[0];
  return (
    <main className="experience-page mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">Seu trabalho</p>
        <h1 className="text-3xl font-semibold">Bom dia</h1>
        <p>
          Aqui está o que merece sua atenção agora. Sua decisão médica não
          publica o material automaticamente.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link className="state-card" href="/review/queue">
          <strong>{waiting.length} aguardando revisão</strong>
          <p>Abra sua fila para escolher o próximo conteúdo.</p>
        </Link>
        <Link className="state-card" href="/review/queue">
          <strong>
            {waiting.filter(({ requestCount }) => requestCount > 0).length} com
            prioridade alta
          </strong>
          <p>Solicitações de estudantes aparecem primeiro na fila.</p>
        </Link>
        <section className="state-card">
          <strong>Última revisão</strong>
          <p>
            {lastReview
              ? `${lastReview.title} · ${new Intl.DateTimeFormat('pt-BR').format(new Date(lastReview.reviewedAt))}`
              : 'Sua primeira decisão aparecerá aqui.'}
          </p>
        </section>
        <section className="state-card">
          <strong>Tempo médio</strong>
          <p>
            Ainda não medido. O tempo será exibido quando houver início de
            revisão registrado.
          </p>
        </section>
      </div>
      <section className="state-card">
        <h2>Conteúdo iniciado recentemente</h2>
        <p>
          {waiting[0]?.title ??
            'Nenhum conteúdo está em revisão neste momento.'}
        </p>
        {waiting[0] && (
          <Link
            className="primary-button inline-flex"
            href={`/review/${waiting[0].id}`}
          >
            Continuar revisão
          </Link>
        )}
      </section>
    </main>
  );
}
