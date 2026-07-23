import Link from 'next/link';
import type { ReactNode } from 'react';
import type { StudyPlanItem } from '@iatron/contracts';
import { executePlanItem } from '../actions';

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
    <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-sm text-[var(--color-text-muted)]">
          Plano adaptativo · study-plan-v1
        </p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p>{description}</p>
      </header>
      <nav className="flex flex-wrap gap-4 text-sm">
        <Link href="/app/plan">Atual</Link>
        <Link href="/app/plan/today">Hoje</Link>
        <Link href="/app/plan/week">Semana</Link>
        <Link href="/app/plan/history">Histórico</Link>
        <Link href="/app/plan/unallocated">Não alocados</Link>
      </nav>
      {children}
    </main>
  );
}

const typeLabel: Record<StudyPlanItem['itemType'], string> = {
  competency_study: 'Estudo de competência',
  review: 'Revisão',
  question_practice: 'Resolução de questões',
  gap_reinforcement: 'Reforço de gap',
  complementary_diagnosis: 'Diagnóstico complementar',
};

export function PlanItemCard({ item }: { item: StudyPlanItem }) {
  return (
    <article className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
      <div>
        <p className="text-sm text-[var(--color-text-muted)]">
          {typeLabel[item.itemType]} · prioridade{' '}
          {Math.round(item.priority * 100)}%
        </p>
        <h2 className="font-semibold">
          {item.competencyCode} · {item.competencyName}
        </h2>
        <p>
          {item.estimatedMinutes} min · {item.plannedDate ?? 'não alocado'} ·{' '}
          {item.status}
        </p>
      </div>
      <ul className="list-disc pl-5 text-sm">
        {item.reasons.map((reason) => (
          <li key={reason.code}>{reason.detail}</li>
        ))}
      </ul>
      {['planned', 'in_progress'].includes(item.status) && (
        <div className="flex flex-wrap gap-2">
          {item.status === 'planned' && (
            <form action={executePlanItem}>
              <input name="itemId" type="hidden" value={item.id} />
              <input name="action" type="hidden" value="start" />
              <button className="rounded border px-3 py-2">Iniciar</button>
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
            <button className="rounded border px-3 py-2">Concluir</button>
          </form>
          <form action={executePlanItem}>
            <input name="itemId" type="hidden" value={item.id} />
            <input name="action" type="hidden" value="defer" />
            <input
              name="reason"
              type="hidden"
              value="Reagendado pelo estudante"
            />
            <button className="rounded border px-3 py-2">Adiar</button>
          </form>
          <form action={executePlanItem}>
            <input name="itemId" type="hidden" value={item.id} />
            <input name="action" type="hidden" value="skip" />
            <input
              name="reason"
              type="hidden"
              value="Item pulado pelo estudante"
            />
            <button className="rounded border px-3 py-2">Pular</button>
          </form>
        </div>
      )}
    </article>
  );
}
