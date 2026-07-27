import { notFound } from 'next/navigation';
import { CompetencyDetail } from '@/features/editorial/components/competency-workspace';
import { editorial } from '@/features/editorial/server/editorial';

export default async function EditorialCompetencyPage({
  params,
}: {
  params: Promise<{ competencyId: string }>;
}) {
  const { competencyId } = await params;
  const competency = await editorial.competency('editorial', competencyId);
  if (!competency) notFound();
  return <CompetencyDetail competency={competency} />;
}
