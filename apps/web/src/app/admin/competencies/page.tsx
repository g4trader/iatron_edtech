import {
  CurriculumCatalog,
  parseCurriculumSearch,
} from '@/features/curriculum/catalog';
import { editorial } from '@/features/editorial/server/editorial';
export default async function AdminCompetenciesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseCurriculumSearch(await searchParams);
  return (
    <CurriculumCatalog data={await editorial.curriculum(query)} query={query} />
  );
}
