import Link from 'next/link';
import { notFound } from 'next/navigation';
import { editorial } from '@/features/editorial/server/editorial';
import { LearningContentPage } from '@/features/editorial/components/learning-content-page';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import { activityReason } from '@/lib/learning-language';

export default async function LearningActivityPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const [item, contents] = await Promise.all([
    studyPlans.item(itemId),
    editorial.studentContents(),
  ]);
  if (!item) notFound();
  const material = contents.find(
    ({ competencyId }) => competencyId === item.competencyId,
  );
  if (!material)
    return (
      <main className="experience-page mx-auto w-full max-w-3xl space-y-5 px-4 py-8 sm:p-8">
        <Link className="font-semibold text-[var(--primary)]" href="/app">
          ← Voltar para minha Jornada
        </Link>
        <p className="text-sm text-[var(--foreground-muted)]">
          {item.competencyName}
        </p>
        <h1 className="text-3xl font-semibold">
          Este material está sendo preparado
        </h1>
        <p>
          Ainda não há uma versão publicada e revisada para esta atividade. Você
          pode voltar à Jornada sem perder seu progresso.
        </p>
        <Link className="primary-button inline-flex" href="/app">
          Voltar para minha Jornada
        </Link>
      </main>
    );
  return (
    <LearningContentPage
      itemId={item.id}
      itemStatus={item.status}
      material={material}
      reason={
        item.reasons[0]
          ? activityReason(item.reasons[0].code)
          : 'Este assunto contribui para a preparação da sua prova.'
      }
    />
  );
}
