import { editorial } from '@/features/editorial/server/editorial';

const decisions = {
  approved: 'Aprovado',
  changes_requested: 'Ajustes solicitados',
  rejected: 'Rejeitado',
};

export default async function ReviewHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedPage = Number((await searchParams).page ?? 1);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const history = await editorial.reviewHistory(page, 20);
  const pages = Math.max(1, Math.ceil(history.total / history.pageSize));
  return (
    <main className="experience-page mx-auto w-full max-w-5xl space-y-5 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">Histórico</p>
        <h1 className="text-3xl font-semibold">Suas revisões médicas</h1>
        <p>
          Cada decisão permanece vinculada à versão e ao hash que você avaliou.
        </p>
      </header>
      {history.items.length ? (
        <ol className="space-y-3">
          {history.items.map((item) => (
            <li className="state-card space-y-2" key={item.reviewId}>
              <p className="text-sm text-[var(--foreground-muted)]">
                {new Intl.DateTimeFormat('pt-BR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(item.reviewedAt))}
              </p>
              <h2>{item.title}</h2>
              <p>
                Versão {item.versionNumber} · {decisions[item.decision]} ·{' '}
                {item.status}
              </p>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt>Mentor</dt>
                  <dd>{item.mentorName}</dd>
                </div>
                <div>
                  <dt>Editor</dt>
                  <dd>{item.editorName ?? 'Não registrado'}</dd>
                </div>
                <div>
                  <dt>Tempo da revisão</dt>
                  <dd>
                    {item.reviewMinutes === null
                      ? 'Não medido'
                      : `${item.reviewMinutes} min`}
                  </dd>
                </div>
                <div>
                  <dt>Referências modificadas</dt>
                  <dd>{item.referencesModified}</dd>
                </div>
              </dl>
              {item.comment && (
                <p>
                  <strong>Comentário:</strong> {item.comment}
                </p>
              )}
              <p className="break-all text-xs text-[var(--foreground-muted)]">
                Hash da versão: {item.versionHash}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <section className="state-card">
          <h2>Seu histórico começa na primeira decisão</h2>
          <p>
            Versão, comentário e identificação do conteúdo aparecerão aqui
            depois que você concluir uma revisão.
          </p>
        </section>
      )}
      {pages > 1 && (
        <nav aria-label="Paginação do histórico" className="flex gap-4">
          {page > 1 && (
            <a href={`/review/history?page=${page - 1}`}>Página anterior</a>
          )}
          <span>
            Página {page} de {pages}
          </span>
          {page < pages && (
            <a href={`/review/history?page=${page + 1}`}>Próxima página</a>
          )}
        </nav>
      )}
    </main>
  );
}
