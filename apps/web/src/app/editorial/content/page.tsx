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
          <input name="canonicalKey" required />
        </label>
        <label className="form-field">
          Slug
          <input name="slug" required />
        </label>
        <label className="form-field">
          Título
          <input name="title" required />
        </label>
        <label className="form-field">
          Resumo
          <textarea name="summary" required />
        </label>
        <label className="form-field">
          Duração estimada
          <input min="1" name="estimatedMinutes" required type="number" />
        </label>
        <label className="form-field">
          Objetivo
          <input name="objective" required />
        </label>
        <label className="form-field">
          Título da seção
          <input name="sectionHeading" required />
        </label>
        <label className="form-field">
          Conteúdo da seção
          <textarea name="sectionBody" required />
        </label>
        <label className="form-field">
          Ponto-chave
          <input name="keyPoint" />
        </label>
        <label className="form-field">
          Aplicação em prova
          <textarea name="examApplication" />
        </label>
        <label className="form-field">
          Conclusão
          <textarea name="conclusion" />
        </label>
        <label className="form-field">
          Especialidade (ID)
          <input name="specialtyId" />
        </label>
        <label className="form-field">
          Competência (ID)
          <input name="competencyId" />
        </label>
        <label>
          <input name="aiAssisted" type="checkbox" /> Rascunho produzido com
          apoio de IA
        </label>
        <label>
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
