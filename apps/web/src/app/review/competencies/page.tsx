import { CompetencyIndex } from '@/features/editorial/components/competency-workspace';
import { editorial } from '@/features/editorial/server/editorial';

export default async function MentorCompetenciesPage() {
  const summaries = await editorial.specialties();
  const specialties = (
    await Promise.all(summaries.map((item) => editorial.specialty(item.id)))
  ).filter((item) => item !== null);
  return <CompetencyIndex scope="review" specialties={specialties} />;
}
