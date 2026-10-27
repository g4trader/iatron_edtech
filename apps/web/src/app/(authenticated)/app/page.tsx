import Link from 'next/link';
import { LearningSpaces } from '@/components/learning/learning-spaces';
import { PageContainer } from '@/components/layout/page-container';
import { getAuthState } from '@/lib/auth';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import { assessmentHistory } from '@/features/assessments/server/adaptive-assessment';
import { JourneyTimeline } from '@/features/journey/components/journey-timeline';
import { resolveJourneyState } from '@/features/journey/journey-state';
import { createClient } from '@/lib/supabase/server';
import { loadExamCatalog } from '@/features/exams/catalog';

export default async function AppHomePage() {
  const { user, profile } = await getAuthState();
  const client = await createClient();
  const bypass = isAuthBypassEnabled(process.env);
  const results = await Promise.allSettled([
    bypass ? null : studyPlans.current(),
    bypass ? [] : assessmentHistory(),
    bypass ? [] : loadExamCatalog(),
    bypass || !user
      ? { data: [], error: null }
      : client
          .from('student_target_exams')
          .select('exam_edition_id')
          .eq('user_id', user.id),
  ] as const);
  const [planResult, historyResult, catalogResult, targetsResult] = results;
  const failed =
    results.some((result) => result.status === 'rejected') ||
    (targetsResult.status === 'fulfilled' && targetsResult.value.error);
  if (failed)
    return (
      <PageContainer>
        <main className="journey-home">
          <h1>Minha preparação</h1>
          <section role="alert">
            <h2>Não conseguimos atualizar sua preparação</h2>
            <p>
              Seus estudos continuam salvos. Tente novamente para ver seu
              progresso e o próximo passo.
            </p>
            <Link className="primary-button" href="/app">
              Tentar novamente
            </Link>
          </section>
        </main>
      </PageContainer>
    );
  const targets =
    targetsResult.status === 'fulfilled'
      ? (targetsResult.value.data ?? [])
      : [];
  const catalog =
    catalogResult.status === 'fulfilled' ? catalogResult.value : [];
  const names = targets.map((target) => {
    const edition = catalog.find(
      (edition) => edition.id === target.exam_edition_id,
    );
    return edition
      ? `${edition.programName} · ${edition.edition ?? edition.year}`
      : 'Prova selecionada fora do catálogo atual';
  });
  const journey = resolveJourneyState({
    profileComplete: profile?.onboarding_status === 'completed',
    hasTargetExam: targets.length > 0,
    assessments:
      historyResult.status === 'fulfilled' ? historyResult.value : [],
    currentPlan: planResult.status === 'fulfilled' ? planResult.value : null,
  });
  const rawName = profile?.display_name?.trim().split(/\s+/)[0];
  const firstName =
    rawName && !/^(student|estudante|teste|test)$/i.test(rawName)
      ? rawName
      : null;
  return (
    <PageContainer>
      <main className="journey-home">
        <header className="journey-hero">
          <div>
            <h1>Minha preparação</h1>
            <p>Continue de onde parou.</p>
          </div>
          <div className="journey-goal">
            <span>
              {firstName ? `Olá, ${firstName}` : 'Olá, bom ter você por aqui'}
            </span>
            <p>
              <strong>Objetivo:</strong>{' '}
              {names.length
                ? names.join('; ')
                : 'Escolher sua prova de residência'}
            </p>
            {names.length > 0 && <Link href="/app/exams">Alterar provas</Link>}
          </div>
        </header>
        <JourneyTimeline steps={journey.steps} />
        <section
          aria-labelledby="journey-next-title"
          className="journey-next-step"
        >
          <div className="journey-next-copy">
            <p className="eyebrow">Próxima ação</p>
            <h2 id="journey-next-title">{journey.mission.title}</h2>
            <p className="journey-reason">{journey.mission.reason}</p>
            {journey.mission.activity && (
              <p className="journey-time">
                Cerca de {journey.mission.activity.estimatedMinutes} minutos
              </p>
            )}
          </div>
          <Link
            className="primary-button journey-primary-action"
            href={journey.mission.href}
          >
            {journey.mission.label}
          </Link>
        </section>
        <section
          className="learning-environments"
          aria-label="Sua experiência de aprendizagem"
        >
          <h2>Seus ambientes de aprendizagem</h2>
          <LearningSpaces overview />
        </section>
        <aside className="journey-context">
          <h2>O que acontece depois?</h2>
          <p>
            {!targets.length
              ? 'Após confirmar sua prova, você poderá iniciar ou retomar o diagnóstico. Suas escolhas ficam salvas para o próximo acesso.'
              : 'As respostas e atividades confirmadas atualizam sua preparação. O diagnóstico mostra seu ponto de partida e orienta a trilha de estudos.'}
          </p>
          <Link href="/app/tutor">Conhecer os mentores e suas áreas</Link>
        </aside>
      </main>
    </PageContainer>
  );
}
