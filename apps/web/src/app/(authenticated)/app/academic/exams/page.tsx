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
      description="Conheça as provas que podem orientar seus objetivos e seu plano de estudos."
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
