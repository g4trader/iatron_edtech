import {
  CatalogCard,
  CatalogPage,
} from '@/features/academic/components/catalog-page';
import { academicCatalog } from '@/features/academic/server/catalog';
export default async function ExamsPage() {
  const [exams, boards] = await Promise.all([
    academicCatalog.exams(),
    academicCatalog.boards(),
  ]);
  return (
    <CatalogPage
      title="Provas e bancas"
      description="Edições de prova ligadas a programas e bancas, sem duplicar questões."
    >
      <p className="text-sm text-slate-600">
        Bancas: {boards.map((board) => board.acronym ?? board.name).join(', ')}
      </p>
      {exams.map((exam) => (
        <CatalogCard
          key={exam.id}
          title={`${exam.program.name} · ${exam.year}`}
          code={exam.board?.acronym}
        >
          <p>
            {exam.edition ?? 'Edição regular'} ·{' '}
            {exam.city ?? 'Cidade não informada'}
          </p>
          <p>
            {exam.modality ?? 'Modalidade não informada'} ·{' '}
            {exam.questionCount ?? '—'} questões · {exam.durationMinutes ?? '—'}{' '}
            minutos
          </p>
        </CatalogCard>
      ))}
    </CatalogPage>
  );
}
