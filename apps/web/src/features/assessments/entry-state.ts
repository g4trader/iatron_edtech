import type { AssessmentSummary } from '@iatron/contracts';

/** Selects navigation only; diagnostic decisions remain in the backend. */
export function selectAssessmentEntry(items: AssessmentSummary[]) {
  const newest = [...items].sort(
    (a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt),
  );
  const completed =
    newest.find(
      (item) => item.status === 'completed' && item.completedAt !== null,
    ) ?? null;
  const open =
    newest.find(
      (item) =>
        ['active', 'paused'].includes(item.status) && item.completedAt === null,
    ) ?? null;
  const current = open;
  return { current, completed };
}

export type DiagnosticActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | {
      status: 'success';
      destination: string;
      event?: 'diagnostic_started' | 'diagnostic_completed';
    };
