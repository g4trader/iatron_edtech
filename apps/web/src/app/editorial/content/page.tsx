import { createEditorialDraft } from '@/features/editorial/actions';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';

export default function EditorialContentPage() {
  return (
    <main className="experience-page mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:p-8">
      <header>
        <h1 className="text-3xl font-semibold">Criar conteúdo estruturado</h1>
        <p>
          A IA pode apoiar o rascunho. A autoridade médica continua no workflow
          editorial e na revisão do mentor.
        </p>
      </header>
      <form action={createEditorialDraft} className="space-y-4">
        <label className="form-field">
          Chave canônica
          <input className="form-control" name="canonicalKey" required />
        </label>
        <label className="form-field">
          Slug
          <input className="form-control" name="slug" required />
        </label>
        <label className="form-field">
          Título
          <input className="form-control" name="title" required />
        </label>
        <label className="form-field">
          Resumo
          <textarea className="form-control" name="summary" required />
        </label>
        <label className="form-field">
          Duração estimada
          <input
            className="form-control"
            min="1"
            name="estimatedMinutes"
            required
            type="number"
          />
        </label>
        <label className="form-field">
          Objetivo
          <input className="form-control" name="objective" required />
        </label>
        <label className="form-field">
          Título da seção
          <input className="form-control" name="sectionHeading" required />
        </label>
        <label className="form-field">
          Conteúdo da seção
          <textarea className="form-control" name="sectionBody" required />
        </label>
        <label className="form-field">
          Ponto-chave
          <input className="form-control" name="keyPoint" />
        </label>
        <label className="form-field">
          Aplicação em prova
          <textarea className="form-control" name="examApplication" />
        </label>
        <label className="form-field">
          Conclusão
          <textarea className="form-control" name="conclusion" />
        </label>
        <label className="form-field">
          Especialidade (ID)
          <input className="form-control" name="specialtyId" />
        </label>
        <label className="form-field">
          Competência (ID)
          <input className="form-control" name="competencyId" />
        </label>
        <label className="check-option">
          <input name="aiAssisted" type="checkbox" /> Rascunho produzido com
          apoio de IA
        </label>
        <label className="check-option">
          <input name="isSynthetic" type="checkbox" /> Material demonstrativo
          sintético
        </label>
        <ActionSubmitButton pendingLabel="Criando versão…">
          Criar rascunho
        </ActionSubmitButton>
      </form>
    </main>
  );
}
