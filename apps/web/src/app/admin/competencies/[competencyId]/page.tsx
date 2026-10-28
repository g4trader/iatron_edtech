import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { CompetencyDetail } from '@/features/editorial/components/competency-workspace';
import { editorial } from '@/features/editorial/server/editorial';
import { CurriculumEditor } from '@/features/curriculum/editor';
import {
  curriculumParams,
  parseCurriculumSearch,
  reviewLabels,
} from '@/features/curriculum/catalog';
export default async function AdminCompetencyPage({
  params,
  searchParams,
}: {
  params: Promise<{ competencyId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { competencyId } = await params;
  const query = parseCurriculumSearch(await searchParams);
  const [competency, catalog] = await Promise.all([
    editorial.competency('admin', competencyId),
    editorial.curriculum({ id: competencyId }),
  ]);
  const item = catalog.items[0];
  if (!competency || !item) notFound();
  return (
    <>
      <div className="mx-auto max-w-6xl space-y-3 px-4 pt-8 sm:px-8">
        <Link href={`/admin/competencies?${curriculumParams(query)}` as Route}>
          ← Voltar ao catálogo com os filtros
        </Link>
        <p className="state-card">
          {reviewLabels[item.status]} ·{' '}
          {item.active
            ? 'Competência existente: identidade e vínculos preservados.'
            : 'Proposta inativa: não utilizada em diagnósticos ou trilhas.'}
        </p>
      </div>
      {item.superseded_by ? (
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <Link
            className="action-link"
            href={`/admin/competencies/${item.superseded_by}` as Route}
          >
            Consultar a competência que substitui esta proposta
          </Link>
        </div>
      ) : null}
      <CompetencyDetail
        competency={{
          ...competency,
          coverage: {
            ...competency.coverage,
            publishedContents: item.contents,
            eligibleQuestions: item.questions,
            validReferences: item.verified_references,
            status:
              item.coverage === 'partial' ? 'partially_covered' : item.coverage,
          },
        }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-8">
        {!item.active && ['draft', 'pending_review'].includes(item.status) ? (
          <CurriculumEditor item={item} />
        ) : (
          <p className="state-card">
            A edição direta de competências ativas ou substituídas está
            protegida para preservar avaliações e planos existentes. Mudanças
            clínicas exigem revisão versionada.
          </p>
        )}
      </div>
    </>
  );
}
