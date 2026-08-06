import Link from 'next/link';
import type { Route } from 'next';
import { notFound } from 'next/navigation';
import { editorial } from '@/features/editorial/server/editorial';
import { submitMentorDecision } from '@/features/editorial/actions';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';
import { ReferenceGroups } from '@/features/editorial/components/reference-groups';
import { VersionComparison } from '@/features/editorial/components/version-comparison';
import { contentDisplayTitle } from '@/features/editorial/presentation';

export default async function ReviewVersionPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const { versionId } = await params;
  const [material, previous] = await Promise.all([
    editorial.reviewVersion(versionId),
    editorial.previousReviewVersion(versionId),
  ]);
  if (!material) notFound();
  return (
    <main className="experience-page mx-auto w-full max-w-5xl space-y-7 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Revisão médica · Versão {material.versionNumber}
        </p>
        <h1 className="text-3xl font-semibold">
          {contentDisplayTitle(material.title)}
        </h1>
        <p>
          {material.aiAssisted
            ? 'Rascunho preparado com apoio de IA.'
            : 'Conteúdo produzido editorialmente.'}
        </p>
        <Link
          className="secondary-button inline-flex"
          href={`/review-preview/${material.id}` as Route}
          rel="noopener noreferrer"
          target="_blank"
        >
          Visualizar como aluno
        </Link>
      </header>
      <section className="state-card space-y-4" aria-labelledby="context-title">
        <h2 id="context-title">Contexto da revisão</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt>Especialidade</dt>
            <dd>{material.specialtyName ?? 'Não informada'}</dd>
          </div>
          <div>
            <dt>Tema</dt>
            <dd>{material.themeName ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt>Competência</dt>
            <dd>{material.competencyName ?? 'Não informada'}</dd>
          </div>
          <div>
            <dt>Versão</dt>
            <dd>{material.versionNumber}</dd>
          </div>
          <div>
            <dt>Origem</dt>
            <dd>
              {material.aiAssisted
                ? 'Produção editorial com apoio de IA'
                : 'Produção editorial humana'}
            </dd>
          </div>
          <div>
            <dt>Produzido com IA?</dt>
            <dd>{material.aiAssisted ? 'Sim' : 'Não'}</dd>
          </div>
          <div>
            <dt>Solicitações dos estudantes</dt>
            <dd>{material.requestCount}</dd>
          </div>
          <div>
            <dt>Editor responsável</dt>
            <dd>{material.editorName ?? 'Não registrado'}</dd>
          </div>
          <div>
            <dt>Tempo estimado</dt>
            <dd>{material.estimatedMinutes} minutos</dd>
          </div>
        </dl>
        <div>
          <h3>Objetivo da revisão</h3>
          <p>
            Confirmar correção clínica, clareza e qualidade das referências
            antes da publicação.
          </p>
        </div>
        <div>
          <h3>Motivo da nova versão</h3>
          <p>
            {typeof material.provenance.reason === 'string'
              ? material.provenance.reason
              : previous
                ? 'O motivo não foi registrado nesta versão. Use a comparação abaixo para verificar as mudanças.'
                : 'Primeira versão preparada para revisão médica.'}
          </p>
        </div>
      </section>
      <VersionComparison current={material} previous={previous} />
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
      <ReferenceGroups references={material.references} />
      <form action={submitMentorDecision} className="state-card space-y-4">
        <input name="versionId" type="hidden" value={material.id} />
        <fieldset className="space-y-3">
          <legend className="font-semibold">
            Sua decisão sobre esta versão
          </legend>
          <label className="check-option">
            <input name="decision" required type="radio" value="approved" />{' '}
            Aprovar versão
          </label>
          <label className="check-option">
            <input
              name="decision"
              required
              type="radio"
              value="changes_requested"
            />{' '}
            Solicitar ajustes
          </label>
          <label className="check-option">
            <input name="decision" required type="radio" value="rejected" />{' '}
            Rejeitar
          </label>
        </fieldset>
        <section className="space-y-3" aria-labelledby="declaration-title">
          <h2 id="declaration-title">Declaração de responsabilidade</h2>
          <p>
            Confirmo que revisei esta versão para fins educacionais dentro da
            minha área de atuação e que minha decisão se refere exatamente ao
            conteúdo apresentado nesta revisão.
          </p>
          <label className="check-option items-start">
            <input
              className="mt-1"
              name="responsibilityConfirmed"
              required
              type="checkbox"
            />
            Li e confirmo esta declaração antes de registrar minha decisão.
          </label>
          <input
            name="declaration"
            type="hidden"
            value="Confirmo que revisei esta versão para fins educacionais dentro da minha área de atuação."
          />
        </section>
        <label className="form-field">
          Comentário ou justificativa
          <textarea
            className="form-control"
            name="comment"
            placeholder="Explique sua decisão ou descreva os ajustes necessários."
          />
        </label>
        <label className="form-field">
          Ponto principal
          <select className="form-control" name="issueCategory">
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
          A aprovação fica vinculada a esta versão e não publica o conteúdo
          automaticamente.
        </p>
      </form>
    </main>
  );
}
