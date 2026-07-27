import { CompetencyIndex } from '@/features/editorial/components/competency-workspace';
import { editorial } from '@/features/editorial/server/editorial';

export default async function EditorialCompetenciesPage() {
  return (
    <CompetencyIndex
      scope="editorial"
      specialties={await editorial.managedSpecialties()}
    />
  );
}
