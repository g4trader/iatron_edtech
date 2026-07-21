'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { QuestionViewModel } from '@iatron/contracts';
import { demoAssessment } from '../mocks/demo-assessment';
import { AssessmentProgress, QuestionCard } from './question-card';

interface AssessmentState {
  index: number;
  status: 'active' | 'paused' | 'complete';
  answers: Record<string, QuestionViewModel>;
}
type AssessmentAction =
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'answer'; question: QuestionViewModel }
  | { type: 'complete' };

function assessmentReducer(
  state: AssessmentState,
  action: AssessmentAction,
): AssessmentState {
  switch (action.type) {
    case 'pause':
      return { ...state, status: 'paused' };
    case 'resume':
      return { ...state, status: 'active' };
    case 'next':
      return {
        ...state,
        index: Math.min(state.index + 1, demoAssessment.questions.length - 1),
      };
    case 'previous':
      return { ...state, index: Math.max(state.index - 1, 0) };
    case 'answer':
      return {
        ...state,
        answers: { ...state.answers, [action.question.id]: action.question },
      };
    case 'complete':
      return { ...state, status: 'complete' };
  }
}

export function AssessmentTopBar({
  status,
  onPause,
}: {
  status: AssessmentState['status'];
  onPause: () => void;
}) {
  return (
    <div className="assessment-topbar">
      <div>
        <p>Conteúdo fictício</p>
        <h2>{demoAssessment.title}</h2>
      </div>
      <div className="assessment-time" aria-label="Tempo visual restante">
        28:14
      </div>
      {status !== 'complete' && (
        <button className="secondary-button" onClick={onPause} type="button">
          {status === 'paused' ? 'Retomar' : 'Pausar'}
        </button>
      )}
    </div>
  );
}

export function AssessmentPausedCard({ onResume }: { onResume: () => void }) {
  return (
    <section className="paused-card">
      <span aria-hidden="true">Ⅱ</span>
      <h2>Avaliação pausada</h2>
      <p>
        Suas respostas demonstrativas permanecem neste dispositivo enquanto a
        página estiver aberta.
      </p>
      <button className="primary-button" onClick={onResume} type="button">
        Retomar avaliação
      </button>
    </section>
  );
}

function FinishAssessmentDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onCancel]);
  return (
    <div className="dialog-layer">
      <div
        aria-describedby="finish-description"
        aria-labelledby="finish-title"
        aria-modal="true"
        className="confirm-dialog"
        role="dialog"
      >
        <h2 id="finish-title">Finalizar demonstração?</h2>
        <p id="finish-description">
          Você não poderá alterar as respostas depois de finalizar.
        </p>
        <div>
          <button
            className="secondary-button"
            onClick={onCancel}
            ref={cancelRef}
            type="button"
          >
            Continuar revisando
          </button>
          <button className="primary-button" onClick={onConfirm} type="button">
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}

export function AssessmentShell() {
  const [state, dispatch] = useReducer(assessmentReducer, {
    index: 0,
    status: 'active',
    answers: {},
  });
  const [showFinish, setShowFinish] = useState(false);
  const baseQuestion = demoAssessment.questions[state.index];
  const question = useMemo(
    () => baseQuestion && (state.answers[baseQuestion.id] ?? baseQuestion),
    [baseQuestion, state.answers],
  );
  if (state.status === 'complete')
    return (
      <main className="assessment-page">
        <section className="completion-card">
          <p>Demonstração concluída</p>
          <h1>Avaliação finalizada</h1>
          <p>Nenhuma correção ou métrica pedagógica real foi calculada.</p>
        </section>
      </main>
    );
  return (
    <main className="assessment-page">
      <AssessmentTopBar
        onPause={() =>
          dispatch({ type: state.status === 'paused' ? 'resume' : 'pause' })
        }
        status={state.status}
      />
      {state.status === 'paused' ? (
        <AssessmentPausedCard onResume={() => dispatch({ type: 'resume' })} />
      ) : (
        question && (
          <>
            <AssessmentProgress
              current={state.index + 1}
              total={demoAssessment.questions.length}
            />
            <QuestionCard
              key={question.id}
              onConfirmed={(answered) =>
                dispatch({ type: 'answer', question: answered })
              }
              question={{ ...question, total: demoAssessment.questions.length }}
            />
            <div className="assessment-navigation">
              <button
                className="secondary-button"
                disabled={state.index === 0}
                onClick={() => dispatch({ type: 'previous' })}
                type="button"
              >
                Anterior
              </button>
              {state.index === demoAssessment.questions.length - 1 ? (
                <button
                  className="primary-button"
                  onClick={() => setShowFinish(true)}
                  type="button"
                >
                  Finalizar avaliação
                </button>
              ) : (
                <button
                  className="primary-button"
                  onClick={() => dispatch({ type: 'next' })}
                  type="button"
                >
                  Próxima
                </button>
              )}
            </div>
          </>
        )
      )}
      {showFinish && (
        <FinishAssessmentDialog
          onCancel={() => setShowFinish(false)}
          onConfirm={() => dispatch({ type: 'complete' })}
        />
      )}
    </main>
  );
}
