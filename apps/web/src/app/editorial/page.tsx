import { editorial } from '@/features/editorial/server/editorial';
import {
  assignMentorForReview,
  publishContent,
} from '@/features/editorial/actions';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';
import {
  contentDisplayTitle,
  editorialStatusLabel,
} from '@/features/editorial/presentation';

export default async function EditorialHome() {
  const [contents, roles] = await Promise.all([
    editorial.adminContents(),
    editorial.roles(),
  ]);
  const canPublish = roles.some((role) =>
    ['admin', 'super_admin'].includes(role),
  );
  const count = (status: string) =>
    contents.filter((item) => item.editorialStatus === status).length;
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-7 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Workflow editorial
        </p>
        <h1 className="text-3xl font-semibold">Conteúdo médico em operação</h1>
        <p>Veja gargalos e conduza cada versão até a próxima etapa segura.</p>
      </header>
      <section
        className="grid gap-3 sm:grid-cols-3"
        aria-label="Etapas do workflow"
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
          <p>prontos para publicação autorizada</p>
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Fila editorial</h2>
        {contents.length === 0 && (
          <div className="state-card">
            <h3>A fila está vazia</h3>
            <p>
              Novos rascunhos e solicitações aparecerão aqui com sua próxima
              ação.
            </p>
          </div>
        )}
        {contents.map((item) => (
          <article className="state-card space-y-3" key={item.id}>
            <p className="text-sm text-[var(--foreground-muted)]">
              {editorialStatusLabel(item.editorialStatus)} · versão{' '}
              {item.versionNumber} · {item.requestCount} solicitações
            </p>
            <h3>{contentDisplayTitle(item.title)}</h3>
            {[
              'draft',
              'ai_draft',
              'editorial_review',
              'mentor_changes_requested',
            ].includes(item.editorialStatus) && (
              <form
                action={assignMentorForReview}
                className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <input name="versionId" type="hidden" value={item.id} />
                <label className="form-field">
                  ID do mentor autorizado
                  <input className="form-control" name="mentorId" required />
                </label>
                <ActionSubmitButton pendingLabel="Atribuindo…">
                  Enviar para revisão
                </ActionSubmitButton>
              </form>
            )}
            {canPublish && item.editorialStatus === 'mentor_approved' && (
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
