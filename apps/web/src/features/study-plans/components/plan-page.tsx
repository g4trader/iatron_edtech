import Link from 'next/link';
import type { ReactNode } from 'react';
import type { StudyPlanItem } from '@iatron/contracts';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';
import { askTutorAboutPlanItem, executePlanItem } from '../actions';

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
  return (
    <article className="min-w-0 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <p className="text-sm text-[var(--foreground-muted)]">
          {typeLabel[item.itemType]} · importância{' '}
          {Math.round(item.priority * 100)}%
        </p>
        <h2 className="font-semibold">
          {item.competencyCode} · {item.competencyName}
        </h2>
        <p>
          {item.estimatedMinutes} min · {item.plannedDate ?? 'a reorganizar'} ·{' '}
          {statusLabel[item.status]}
        </p>
      </div>
      <ul className="list-disc pl-5 text-sm">
        {item.reasons.map((reason) => (
          <li key={reason.code}>{reason.detail}</li>
        ))}
      </ul>
      <form action={askTutorAboutPlanItem}>
        <input name="itemId" type="hidden" value={item.id} />
        <ActionSubmitButton
          pendingLabel="Abrindo explicação…"
          variant="secondary"
        >
          Pedir explicação ao tutor
        </ActionSubmitButton>
      </form>
      {['planned', 'in_progress'].includes(item.status) && (
        <div className="flex flex-wrap gap-2">
          {item.status === 'planned' && (
            <form action={executePlanItem}>
              <input name="itemId" type="hidden" value={item.id} />
              <input name="action" type="hidden" value="start" />
              <ActionSubmitButton pendingLabel="Iniciando…" variant="secondary">
                Iniciar atividade
              </ActionSubmitButton>
            </form>
          )}
          <form action={executePlanItem}>
            <input name="itemId" type="hidden" value={item.id} />
            <input name="action" type="hidden" value="complete" />
            <input
              name="actualMinutes"
              type="hidden"
              value={item.estimatedMinutes}
            />
            <ActionSubmitButton
              pendingLabel="Salvando conclusão…"
              variant="secondary"
            >
              Concluir atividade
            </ActionSubmitButton>
          </form>
          <form action={executePlanItem}>
            <input name="itemId" type="hidden" value={item.id} />
            <input name="action" type="hidden" value="defer" />
            <input
              name="reason"
              type="hidden"
              value="Reagendado pelo estudante"
            />
            <ActionSubmitButton
              pendingLabel="Reorganizando…"
              variant="secondary"
            >
              Fazer depois
            </ActionSubmitButton>
          </form>
          <form action={executePlanItem}>
            <input name="itemId" type="hidden" value={item.id} />
            <input name="action" type="hidden" value="skip" />
            <input
              name="reason"
              type="hidden"
              value="Item pulado pelo estudante"
            />
            <ActionSubmitButton
              pendingLabel="Atualizando plano…"
              variant="secondary"
            >
              Remover de hoje
            </ActionSubmitButton>
          </form>
        </div>
      )}
    </article>
  );
}
