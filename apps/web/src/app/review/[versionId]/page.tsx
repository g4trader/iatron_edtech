import { notFound } from 'next/navigation';
import { editorial } from '@/features/editorial/server/editorial';
import { submitMentorDecision } from '@/features/editorial/actions';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';

export default async function ReviewVersionPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const material = await editorial.reviewVersion((await params).versionId);
  if (!material) notFound();
  return (
    <main className="experience-page mx-auto w-full max-w-5xl space-y-7 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Revisão médica · Versão {material.versionNumber}
        </p>
        <h1 className="text-3xl font-semibold">{material.title}</h1>
        <p>
          {material.aiAssisted
            ? `Rascunho preparado com apoio de IA (${material.aiModel}).`
            : 'Conteúdo produzido editorialmente.'}
        </p>
      </header>
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">Conteúdo completo</h2>
        <p>{material.summary}</p>
        {material.sections.map((section) => (
          <article key={section.heading}>
            <h3 className="text-xl font-semibold">{section.heading}</h3>
            <p className="whitespace-pre-line">{section.body}</p>
          </article>
        ))}
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Referências</h2>
        {material.references.length ? (
          <ul className="list-disc pl-6">
            {material.references.map((reference) => (
              <li key={reference.id}>
                {reference.title} · {reference.verificationStatus}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma referência foi vinculada a esta versão.</p>
        )}
      </section>
      <details className="state-card">
        <summary className="font-semibold">Visualizar como o estudante</summary>
        <p>{material.summary}</p>
      </details>
      <form action={submitMentorDecision} className="state-card space-y-4">
        <input name="versionId" type="hidden" value={material.id} />
        <fieldset className="space-y-3">
          <legend className="font-semibold">
            Sua decisão sobre esta versão
          </legend>
          <label className="block">
            <input name="decision" required type="radio" value="approved" />{' '}
            Aprovar versão
          </label>
          <label className="block">
            <input
              name="decision"
              required
              type="radio"
              value="changes_requested"
            />{' '}
            Solicitar ajustes
          </label>
          <label className="block">
            <input name="decision" required type="radio" value="rejected" />{' '}
            Rejeitar
          </label>
        </fieldset>
        <label className="form-field">
          Declaração para aprovação
          <textarea
            name="declaration"
            placeholder="Confirmo que revisei esta versão para fins educacionais dentro da minha área de atuação."
          />
        </label>
        <label className="form-field">
          Comentário ou justificativa
          <textarea name="comment" />
        </label>
        <label className="form-field">
          Ponto principal
          <select name="issueCategory">
            <option value="">Não se aplica</option>
            <option value="content">Conteúdo</option>
            <option value="reference">Referência</option>
            <option value="clarity">Clareza</option>
            <option value="currency">Atualização</option>
            <option value="safety">Segurança</option>
            <option value="structure">Estrutura</option>
            <option value="other">Outro</option>
          </select>
        </label>
        <ActionSubmitButton pendingLabel="Registrando decisão…">
          Confirmar decisão
        </ActionSubmitButton>
        <p className="text-sm text-[var(--foreground-muted)]">
          A aprovação fica vinculada ao hash desta versão e não publica o
          conteúdo automaticamente.
        </p>
      </form>
    </main>
  );
}
