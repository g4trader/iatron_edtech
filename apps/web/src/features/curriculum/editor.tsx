'use client';
import { useActionState } from 'react';
import type { CurriculumItem } from '@iatron/contracts';
import { saveCurriculum } from './actions';
export function CurriculumEditor({ item }: { item: CurriculumItem }) {
  const [state, action, pending] = useActionState(saveCurriculum, {
    message: '',
    ok: false,
  });
  return (
    <section id="editar" className="state-card space-y-4 scroll-mt-24">
      <h2>Editar proposta curricular</h2>
      <p>
        Alterações ficam registradas com justificativa e versão. Salvar não
        homologa nem ativa a competência.
      </p>
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="revision" value={item.revision} />
        <label className="block space-y-1">
          <span>Nome da competência</span>
          <input
            className="form-control"
            name="name"
            defaultValue={item.name}
            required
            minLength={10}
            maxLength={240}
          />
        </label>
        <label className="block space-y-1">
          <span>Descrição</span>
          <textarea
            className="form-control"
            name="description"
            defaultValue={item.description}
            required
            minLength={20}
            maxLength={4000}
            rows={3}
          />
        </label>
        <label className="block space-y-1">
          <span>Objetivos de aprendizagem — um por linha</span>
          <textarea
            className="form-control"
            name="objectives"
            defaultValue={item.objectives.join('\n')}
            required
            rows={5}
          />
        </label>
        <label className="block space-y-1">
          <span>Termos relacionados — um por linha</span>
          <textarea
            className="form-control"
            name="terms"
            defaultValue={item.terms.join('\n')}
            rows={3}
          />
        </label>
        <label className="block space-y-1">
          <span>Estado da proposta</span>
          <select
            className="form-control"
            name="status"
            defaultValue={item.status}
          >
            <option value="draft">Rascunho</option>
            <option value="pending_review">Aguardando revisão médica</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span>Justificativa da alteração</span>
          <textarea
            className="form-control"
            name="reason"
            required
            minLength={10}
            maxLength={1000}
            rows={2}
          />
        </label>
        <p className="text-sm">
          Versão {item.revision} · Origem: {item.source ?? 'Não registrada'}
        </p>
        {state.message ? (
          <p role={state.ok ? 'status' : 'alert'}>{state.message}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[var(--primary)] px-4 py-3 font-semibold text-white hover:bg-[var(--primary-hover)] disabled:opacity-60"
        >
          {pending ? 'Salvando…' : 'Salvar proposta'}
        </button>
      </form>
    </section>
  );
}
