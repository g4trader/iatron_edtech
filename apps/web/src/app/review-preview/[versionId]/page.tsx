import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { LearningContentPage } from '@/features/editorial/components/learning-content-page';
import { requireEditorialRole } from '@/features/editorial/server/access';
import { editorial } from '@/features/editorial/server/editorial';

export default async function StudentContentPreviewPage({
  params,
}: {
  params: Promise<{ versionId: string }>;
}) {
  const [{ user, profile }, { versionId }] = await Promise.all([
    requireEditorialRole(['mentor']),
    params,
  ]);
  const material = await editorial.reviewVersion(versionId);
  if (!material) notFound();
  return (
    <AppShell
      identity={{
        displayName: profile?.display_name ?? 'Mentor',
        email: user.email ?? '',
      }}
    >
      <LearningContentPage
        itemId="preview"
        itemStatus="planned"
        material={material}
        preview
        reason="Este conteúdo foi selecionado para apoiar uma prioridade do plano de estudos."
      />
    </AppShell>
  );
}
