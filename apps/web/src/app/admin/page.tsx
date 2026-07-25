import { editorial } from '@/features/editorial/server/editorial';
import {
  assignMentorForReview,
  publishContent,
} from '@/features/editorial/actions';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';

export default async function AdminHome() {
  const contents = await editorial.adminContents();
  const count = (status: string) =>
    contents.filter((item) => item.editorialStatus === status).length;
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-7 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Fluxo editorial
        </p>
        <h1 className="text-3xl font-semibold">Conteúdo médico em operação</h1>
        <p>Veja gargalos e conduza cada versão até a publicação segura.</p>
      </header>
      <section
        className="grid gap-3 sm:grid-cols-3"
        aria-label="Indicadores operacionais"
      >
        <div className="state-card">
          <strong>{count('ai_draft') + count('draft')}</strong>
          <p>rascunhos</p>
        </div>
        <div className="state-card">
          <strong>{count('awaiting_mentor_review')}</strong>
          <p>aguardando mentor</p>
        </div>
        <div className="state-card">
          <strong>{count('mentor_approved')}</strong>
          <p>aprovados para preparar publicação</p>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Fila editorial</h2>
        {contents.map((item) => (
          <article className="state-card space-y-3" key={item.id}>
            <p className="text-sm text-[var(--foreground-muted)]">
              {item.editorialStatus} · versão {item.versionNumber} ·{' '}
              {item.requestCount} solicitações
            </p>
            <h3>{item.title}</h3>
            {[
              'draft',
              'ai_draft',
              'editorial_review',
              'mentor_changes_requested',
            ].includes(item.editorialStatus) && (
              <form
                action={assignMentorForReview}
                className="flex flex-wrap gap-2"
              >
                <input name="versionId" type="hidden" value={item.id} />
                <label>
                  ID do mentor autorizado
                  <input className="form-control" name="mentorId" required />
                </label>
                <ActionSubmitButton pendingLabel="Atribuindo…">
                  Enviar para revisão
                </ActionSubmitButton>
              </form>
            )}
            {item.editorialStatus === 'mentor_approved' && (
              <form action={publishContent}>
                <input name="versionId" type="hidden" value={item.id} />
                <ActionSubmitButton pendingLabel="Publicando…">
                  Publicar versão aprovada
                </ActionSubmitButton>
              </form>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
