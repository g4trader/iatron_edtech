import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { PageContainer } from '@/components/layout/page-container';
import { createClient } from '@/lib/supabase/server';
import { safeReturnTo, withReturnTo } from '@/lib/safe-return-to';
import { loadExamCatalog } from '@/features/exams/catalog';
import { ExamTargetForm } from '@/features/exams/exam-target-form';

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const returnTo = safeReturnTo((await searchParams).returnTo);
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user)
    redirect(
      withReturnTo('/login', withReturnTo('/app/exams', returnTo)) as Route,
    );
  const [catalog, targets] = await Promise.all([
    loadExamCatalog()
      .then((editions) => ({ editions, failed: false }))
      .catch(() => ({ editions: [], failed: true })),
    client
      .from('student_target_exams')
      .select('exam_edition_id')
      .eq('user_id', user.id),
  ]);
  return (
    <PageContainer>
      <main className="exam-target-page">
        <header className="page-intro">
          <p className="eyebrow">Sua próxima etapa</p>
          <h1>Escolha sua prova de residência</h1>
          <p>
            Escolha uma ou mais provas do catálogo para orientar sua preparação.
            Alterar o objetivo não apaga diagnósticos nem planos anteriores.
          </p>
        </header>
        {catalog.failed || targets.error ? (
          <section role="alert">
            <h2>Não conseguimos carregar suas provas</h2>
            <p>Suas escolhas anteriores continuam salvas. Tente novamente.</p>
            <Link
              className="primary-button"
              href={withReturnTo('/app/exams', returnTo) as Route}
            >
              Tentar novamente
            </Link>
          </section>
        ) : (
          <ExamTargetForm
            editions={catalog.editions}
            initialTargets={(targets.data ?? []).map(
              (target) => target.exam_edition_id,
            )}
            returnTo={returnTo}
          />
        )}
      </main>
    </PageContainer>
  );
}
