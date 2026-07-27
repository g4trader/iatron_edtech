import Link from 'next/link';
import type { Route } from 'next';
import {
  knowledgeLibraryKindSchema,
  type KnowledgeLibraryKind,
} from '@iatron/contracts';
import { editorial } from '../server/editorial';
import { resolveKnowledgeDuplicate } from '../actions';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';

const sections: { kind: KnowledgeLibraryKind; label: string }[] = [
  { kind: 'contents', label: 'Conteúdos' },
  { kind: 'questions', label: 'Questões' },
  { kind: 'references', label: 'Referências' },
  { kind: 'blueprints', label: 'Blueprints' },
  { kind: 'competencies', label: 'Competências' },
  { kind: 'duplicates', label: 'Duplicidades' },
  { kind: 'gaps', label: 'Lacunas' },
];

const metricLinks = [
  ['Conteúdos publicados', 'publishedContents', 'contents', 'published'],
  ['Conteúdos em revisão', 'contentsInReview', 'contents', 'editorial_review'],
  [
    'Questões elegíveis',
    'diagnosticEligibleQuestions',
    'questions',
    'published',
  ],
  ['Referências verificadas', 'verifiedReferences', 'references', 'verified'],
  ['Competências cobertas', 'coveredCompetencies', 'competencies', 'covered'],
  ['Sem cobertura', 'uncoveredCompetencies', 'competencies', 'uncovered'],
  ['Possíveis duplicidades', 'possibleDuplicates', 'duplicates', null],
  ['Lacunas prioritárias', 'priorityGaps', 'gaps', null],
] as const;

export async function KnowledgeLibrary({
  scope,
  basePath,
  searchParams,
}: {
  scope: 'editorial' | 'review' | 'admin';
  basePath: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const kind = knowledgeLibraryKindSchema.catch('contents').parse(raw.kind);
  const search = typeof raw.search === 'string' ? raw.search : '';
  const status = typeof raw.status === 'string' ? raw.status : null;
  const specialtyId =
    typeof raw.specialtyId === 'string' ? raw.specialtyId : null;
  const page = Math.max(1, Number(raw.page) || 1);
  const [overview, result] = await Promise.all([
    editorial.libraryOverview(scope),
    editorial.library(scope, {
      kind,
      search,
      status,
      specialtyId,
      page,
      pageSize: 20,
    }),
  ]);
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const href = (next: Record<string, string | null>) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (specialtyId) params.set('specialtyId', specialtyId);
    params.set('kind', kind);
    params.set('page', String(page));
    for (const [key, value] of Object.entries(next))
      if (value === null) params.delete(key);
      else params.set(key, value);
    return `${basePath}?${params}` as Route;
  };

  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-7 px-4 py-8 sm:p-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--foreground-muted)]">
          Biblioteca médica
        </p>
        <h1>Conhecimento em um só lugar</h1>
        <p>
          Localize materiais existentes, confirme suas relações e identifique o
          que precisa de revisão antes de criar algo novo.
        </p>
      </header>

      <section
        aria-label="Resumo operacional"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metricLinks.map(([label, key, targetKind, targetStatus]) => (
          <Link
            className="state-card transition-colors hover:border-[var(--primary)]"
            href={href({
              kind: targetKind,
              status: targetStatus,
              page: '1',
            })}
            key={key}
          >
            <span className="block text-sm text-[var(--foreground-muted)]">
              {label}
            </span>
            <strong className="text-3xl">{overview[key]}</strong>
          </Link>
        ))}
      </section>

      <nav aria-label="Seções da biblioteca" className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <Link
            aria-current={kind === section.kind ? 'page' : undefined}
            className={
              kind === section.kind ? 'primary-button' : 'secondary-button'
            }
            href={href({ kind: section.kind, status: null, page: '1' })}
            key={section.kind}
          >
            {section.label}
          </Link>
        ))}
      </nav>

      <form
        action={basePath}
        className="state-card grid gap-3 md:grid-cols-[1fr_auto]"
        method="get"
      >
        <input name="kind" type="hidden" value={kind} />
        <label>
          Buscar na seção
          <input
            className="form-control mt-1 w-full"
            defaultValue={search}
            name="search"
            placeholder="Título, identificador, competência, referência ou responsável"
            type="search"
          />
        </label>
        <button className="primary-button self-end" type="submit">
          Buscar
        </button>
      </form>

      <section aria-live="polite" className="space-y-4">
        <div>
          <h2>{sections.find((section) => section.kind === kind)?.label}</h2>
          <p>
            {result.total}{' '}
            {result.total === 1 ? 'item localizado' : 'itens localizados'}.
          </p>
        </div>
        {result.items.length === 0 ? (
          <div className="state-card">
            <h3>Nenhum item corresponde a esta busca</h3>
            <p>
              Revise os termos ou remova filtros. A biblioteca mostra apenas
              áreas que seu perfil pode consultar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr>
                  <th className="p-3 text-left">Item</th>
                  <th className="p-3 text-left">Especialidade</th>
                  <th className="p-3 text-left">Competência</th>
                  <th className="p-3 text-left">Situação</th>
                  <th className="p-3 text-left">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr
                    className="border-t border-[var(--border)]"
                    key={`${item.kind}:${item.id}`}
                  >
                    <td className="p-3">
                      <strong className="block">{item.title}</strong>
                      <small>{item.identifier ?? item.detail}</small>
                    </td>
                    <td className="p-3">
                      {item.specialtyName ?? 'Relacionada'}
                    </td>
                    <td className="p-3">
                      {item.competencyName ?? 'Não se aplica'}
                    </td>
                    <td className="p-3">{item.status.replaceAll('_', ' ')}</td>
                    <td className="p-3">
                      {item.ownerName ?? 'Aguardando definição'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {kind === 'duplicates' &&
          scope !== 'review' &&
          result.items.map((item) => (
            <form
              action={resolveKnowledgeDuplicate}
              className="state-card grid gap-3"
              key={`decision:${item.id}`}
            >
              <h3>Revisar “{item.title}”</h3>
              <p>{item.detail}</p>
              <input name="resourceId" type="hidden" value={item.id} />
              <input
                name="candidateId"
                type="hidden"
                value={String(item.metadata.candidateId)}
              />
              <input
                name="resourceType"
                type="hidden"
                value={String(item.metadata.resourceType)}
              />
              <label>
                Motivo da decisão
                <textarea
                  className="form-control mt-1 w-full"
                  minLength={10}
                  name="reason"
                  required
                  rows={3}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <ActionSubmitButton
                  name="decision"
                  pendingLabel="Registrando…"
                  value="confirmed_duplicate"
                >
                  Confirmar duplicidade
                </ActionSubmitButton>
                <button
                  className="secondary-button"
                  name="decision"
                  type="submit"
                  value="not_duplicate"
                >
                  Manter como itens distintos
                </button>
              </div>
            </form>
          ))}
      </section>

      <nav aria-label="Paginação" className="flex items-center justify-between">
        {page > 1 ? (
          <Link
            className="secondary-button"
            href={href({ page: String(page - 1) })}
          >
            Página anterior
          </Link>
        ) : (
          <span />
        )}
        <span>
          Página {page} de {pages}
        </span>
        {page < pages && (
          <Link
            className="secondary-button"
            href={href({ page: String(page + 1) })}
          >
            Próxima página
          </Link>
        )}
      </nav>
    </main>
  );
}
