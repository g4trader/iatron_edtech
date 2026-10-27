'use client';
import { useActionState, useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { emitAcquisitionEvent } from '@/features/acquisition/events';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';
import {
  beginAcquisitionDiagnostic,
  resumeAcquisitionDiagnostic,
  finishAcquisitionDiagnostic,
} from './entry-actions';

export function DiagnosticEntryForm({
  kind = 'start',
  assessmentId,
  children,
  className,
}: {
  kind?: 'start' | 'resume' | 'finish';
  assessmentId?: string;
  children?: ReactNode;
  className?: string;
}) {
  const action =
    kind === 'start'
      ? beginAcquisitionDiagnostic
      : kind === 'resume'
        ? resumeAcquisitionDiagnostic
        : finishAcquisitionDiagnostic;
  const [state, formAction] = useActionState(action, { status: 'idle' });
  const handled = useRef(new Set<string>());
  const router = useRouter();
  useEffect(() => {
    if (state.status !== 'success') return;
    const signature = JSON.stringify([state.event ?? null, state.destination]);
    if (handled.current.has(signature)) return;
    handled.current.add(signature);
    if (state.event) emitAcquisitionEvent({ name: state.event });
    router.push(state.destination as Route);
  }, [state, router]);
  return (
    <form action={formAction} className={className}>
      {assessmentId && (
        <input type="hidden" name="assessmentId" value={assessmentId} />
      )}
      {children}
      {state.status === 'error' && (
        <div role="alert" className="state-card error-state">
          <p>{state.message}</p>
          <a className="secondary-button" href="/app/assessment/entry">
            Conferir meu diagnóstico salvo
          </a>
        </div>
      )}
      <ActionSubmitButton
        pendingLabel={
          kind === 'finish'
            ? 'Preparando seu resultado…'
            : 'Preparando seu diagnóstico…'
        }
      >
        {kind === 'start'
          ? 'Começar meu diagnóstico'
          : kind === 'resume'
            ? 'Retomar de onde parei'
            : 'Ver meu resultado'}
      </ActionSubmitButton>
    </form>
  );
}
