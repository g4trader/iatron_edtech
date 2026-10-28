import Link from 'next/link';
import type { Route } from 'next';
import {
  curriculumQuerySchema,
  type CurriculumQuery,
  type CurriculumPage,
} from '@iatron/contracts';

export const reviewLabels = {
  legacy_unreviewed: 'Revisão curricular não registrada',
  superseded: 'Substituída — histórico preservado',
  draft: 'Rascunho',
  pending_review: 'Aguardando revisão médica',
};
export const coverageLabels = {
  covered: 'Com cobertura',
  partial: 'Cobertura parcial',
  uncovered: 'Sem cobertura',
};
export function parseCurriculumSearch(
  input: Record<string, string | string[] | undefined>,
) {
  const clean = Object.fromEntries(
    Object.entries(input).filter(([, v]) => typeof v === 'string' && v !== ''),
  );
  const result = curriculumQuerySchema.safeParse(clean);
  return result.success ? result.data : curriculumQuerySchema.parse({});
}
export function curriculumParams(
  query: CurriculumQuery,
  overrides: Partial<CurriculumQuery> = {},
) {
  return new URLSearchParams(
    Object.entries({ ...query, ...overrides })
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  );
}
export function CurriculumCatalog({
  data,
  query,
}: {
  data: CurriculumPage;
  query: CurriculumQuery;
}) {
  const groups = new Map<string, CurriculumPage['items']>();
  for (const item of data.items)
    groups.set(item.subarea, [...(groups.get(item.subarea) ?? []), item]);
  const metrics = [
    ['Competências', data.summary.total],
    ['Com cobertura', data.summary.covered],
    ['Sem cobertura', data.summary.uncovered],
    ['Com questões', data.summary.withQuestions],
    ['Revisão pendente', data.summary.pendingReview],
  ] as const;
  const link = (override: Partial<CurriculumQuery>) =>
    `/admin/competencies?${curriculumParams(query, override)}` as Route;
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:p-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--foreground-muted)]">
          Conhecimento médico / Matriz curricular
        </p>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Competências médicas
        </h1>
        <p>
          Organize, acompanhe e amplie a matriz de conhecimentos utilizada na
          preparação dos estudantes.
        </p>
      </header>
      <nav aria-label="Especialidades médicas" className="flex flex-wrap gap-2">
        <Link
          href={link({ specialtyId: undefined, areaId: undefined, page: 1 })}
          aria-current={!query.specialtyId ? 'page' : undefined}
          className={!query.specialtyId ? 'primary-button' : 'secondary-button'}
        >
          Todas
        </Link>
        {data.specialties.map((sp) => (
          <Link
            key={sp.id}
            href={link({ specialtyId: sp.id, areaId: undefined, page: 1 })}
            aria-current={query.specialtyId === sp.id ? 'page' : undefined}
            className={
              query.specialtyId === sp.id
                ? 'primary-button'
                : 'secondary-button'
            }
          >
            {sp.name} <span>({sp.count})</span>
          </Link>
        ))}
      </nav>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {metrics.map(([label, value]) => (
          <div key={label} className="state-card">
            <dt className="text-sm text-[var(--foreground-muted)]">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-[var(--foreground-muted)]">
        Indicadores da especialidade selecionada. Cobertura exige conteúdo
        publicado, questão elegível e referência verificada; não representa
        validação clínica. Propostas inativas não entram no diagnóstico nem
        geram trilhas.
      </p>
      <form
        method="get"
        className="state-card grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {query.specialtyId ? (
          <input type="hidden" name="specialtyId" value={query.specialtyId} />
        ) : null}
        <label className="space-y-1 sm:col-span-2 lg:col-span-3">
          <span>Buscar competência</span>
          <input
            className="w-full"
            name="search"
            defaultValue={query.search}
            maxLength={160}
            placeholder="Nome, subárea, termo relacionado ou código"
          />
        </label>
        <label className="space-y-1">
          <span>Subárea</span>
          <select
            className="w-full"
            name="areaId"
            defaultValue={query.areaId ?? ''}
          >
            <option value="">Todas as subáreas</option>
            {data.areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span>Cobertura educacional</span>
          <select
            className="w-full"
            name="coverage"
            defaultValue={query.coverage}
          >
            <option value="">Qualquer cobertura</option>
            {Object.entries(coverageLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span>Lacunas de recursos</span>
          <select
            className="w-full"
            name="missing"
            defaultValue={query.missing}
          >
            <option value="">Todos os recursos</option>
            <option value="content">Sem conteúdo publicado</option>
            <option value="questions">Sem questões elegíveis</option>
            <option value="references">Sem referências verificadas</option>
          </select>
        </label>
        <label className="space-y-1">
          <span>Revisão curricular</span>
          <select className="w-full" name="status" defaultValue={query.status}>
            <option value="">Todos os estados</option>
            {Object.entries(reviewLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-3">
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-4 py-3 font-semibold text-white hover:bg-[var(--primary-hover)]"
          >
            Aplicar filtros
          </button>
          <Link className="px-3 py-3" href="/admin/competencies">
            Limpar filtros
          </Link>
        </div>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status">
          {data.total} competência(s) encontrada(s) · até 25 por página
        </p>
        <span className="text-sm">
          Página {data.page} de {Math.max(1, Math.ceil(data.total / 25))}
        </span>
      </div>
      {data.items.length ? (
        Array.from(groups, ([area, items]) => (
          <details
            key={area}
            open
            className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
          >
            <summary className="cursor-pointer px-5 py-4 font-semibold">
              {area}{' '}
              <span className="font-normal">· {items.length} nesta página</span>
            </summary>
            <ul className="divide-y divide-[var(--border)]">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 space-y-2">
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {item.code} · {item.subarea}
                    </p>
                    <h2 className="text-base font-semibold leading-relaxed">
                      <Link
                        href={
                          `/admin/competencies/${item.id}?${curriculumParams(query)}` as Route
                        }
                      >
                        {item.name}
                      </Link>
                    </h2>
                    <p className="text-sm">
                      {item.contents} conteúdo(s) publicado(s) ·{' '}
                      {item.questions} questão(ões) · {item.verified_references}{' '}
                      referência(s) verificada(s)
                    </p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {coverageLabels[item.coverage]} ·{' '}
                      {reviewLabels[item.status]}
                      {!item.active ? ' · Inativa' : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <Link
                      className="rounded-lg border px-3 py-3 text-sm"
                      href={
                        `/admin/competencies/${item.id}?${curriculumParams(query)}` as Route
                      }
                    >
                      Ver detalhes
                    </Link>
                    {!item.active &&
                    ['draft', 'pending_review'].includes(item.status) ? (
                      <Link
                        className="rounded-lg border px-3 py-3 text-sm"
                        href={
                          `/admin/competencies/${item.id}?${curriculumParams(query)}#editar` as Route
                        }
                      >
                        Editar proposta
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </details>
        ))
      ) : (
        <section className="state-card space-y-2">
          <h2>Nenhuma competência neste recorte</h2>
          <p>
            Revise os filtros ou selecione outra especialidade. A ausência de
            recursos indica uma lacuna editorial, não proficiência zero do
            estudante.
          </p>
        </section>
      )}
      <nav
        aria-label="Paginação do catálogo"
        className="flex justify-between gap-3"
      >
        {data.page > 1 ? (
          <Link
            className="rounded-lg border px-4 py-3"
            href={link({ page: data.page - 1 })}
          >
            Página anterior
          </Link>
        ) : (
          <span />
        )}
        {data.page * 25 < data.total ? (
          <Link
            className="rounded-lg border px-4 py-3"
            href={link({ page: data.page + 1 })}
          >
            Próxima página
          </Link>
        ) : null}
      </nav>
    </main>
  );
}
