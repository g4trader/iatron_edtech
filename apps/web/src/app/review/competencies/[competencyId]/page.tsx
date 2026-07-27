import { notFound } from 'next/navigation';
import { CompetencyDetail } from '@/features/editorial/components/competency-workspace';
import { editorial } from '@/features/editorial/server/editorial';

export default async function MentorCompetencyPage({
  params,
}: {
  params: Promise<{ competencyId: string }>;
}) {
  const { competencyId } = await params;
  const competency = await editorial.competency('review', competencyId);
  if (!competency) notFound();
  return <CompetencyDetail competency={competency} />;
}
