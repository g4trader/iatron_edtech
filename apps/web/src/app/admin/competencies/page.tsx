import { CompetencyIndex } from '@/features/editorial/components/competency-workspace';
import { editorial } from '@/features/editorial/server/editorial';

export default async function AdminCompetenciesPage() {
  return (
    <CompetencyIndex
      scope="admin"
      specialties={await editorial.managedSpecialties()}
    />
  );
}
