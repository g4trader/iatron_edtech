import Link from 'next/link';
import type { Route } from 'next';
import type { ReactNode } from 'react';
import type { StudyPlanItem } from '@iatron/contracts';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';
import { activityReason, studyPriority } from '@/lib/learning-language';
import { MentorRecommendation } from '@/features/mentors/components/mentor';
import { mentorForCompetency } from '@/features/mentors/mentors';
import { askTutorAboutPlanItem } from '../actions';

export function PlanPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="experience-page mx-auto w-full max-w-5xl min-w-0 space-y-6 px-4 py-6 sm:p-6">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Seu plano de estudos
        </p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p>{description}</p>
      </header>
      <nav
        aria-label="Navegação do plano"
        className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-[var(--primary)]"
      >
        <Link href="/app/plan">Visão geral</Link>
        <Link href="/app/plan/today">Hoje</Link>
        <Link href="/app/plan/week">Semana</Link>
        <Link href="/app/plan/history">Histórico</Link>
        <Link href="/app/plan/unallocated">Para reorganizar</Link>
      </nav>
      {children}
    </main>
  );
}

const typeLabel: Record<StudyPlanItem['itemType'], string> = {
  competency_study: 'Estudo direcionado',
  review: 'Revisão',
  question_practice: 'Resolução de questões',
  gap_reinforcement: 'Reforço de prioridade',
  complementary_diagnosis: 'Medição complementar',
};
const statusLabel: Record<StudyPlanItem['status'], string> = {
  planned: 'planejada',
  in_progress: 'em andamento',
  completed: 'concluída',
  deferred: 'adiada',
  skipped: 'ignorada',
  unallocated: 'para reorganizar',
};

export function PlanItemCard({ item }: { item: StudyPlanItem }) {
  const mentor = mentorForCompetency(item);
  return (
    <article className="min-w-0 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <p className="text-sm text-[var(--foreground-muted)]">
          {typeLabel[item.itemType]} · {studyPriority(item.priority)}
        </p>
        <h2 className="font-semibold">{item.competencyName}</h2>
        <p>
          {item.estimatedMinutes} min · {item.plannedDate ?? 'a reorganizar'} ·{' '}
          {statusLabel[item.status]}
        </p>
      </div>
      <MentorRecommendation mentor={mentor}>
        <strong>Como esta atividade ajuda sua prova</strong>
        <ul className="list-disc pl-5 text-sm">
          {item.reasons.map((reason) => (
            <li key={reason.code}>{activityReason(reason.code)}</li>
          ))}
        </ul>
      </MentorRecommendation>
      <form action={askTutorAboutPlanItem}>
        <input name="itemId" type="hidden" value={item.id} />
        <ActionSubmitButton
          pendingLabel="Abrindo explicação…"
          variant="secondary"
        >
          Pedir explicação a {mentor.displayName}
        </ActionSubmitButton>
      </form>
      {['planned', 'in_progress'].includes(item.status) && (
        <Link
          className="primary-button inline-flex"
          href={`/app/plan/items/${item.id}` as Route}
        >
          {item.status === 'planned'
            ? 'Iniciar atividade'
            : 'Continuar atividade'}
        </Link>
      )}
    </article>
  );
}
