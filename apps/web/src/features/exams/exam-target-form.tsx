'use client';
import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';
import type { Route } from 'next';
import { safeReturnTo, withReturnTo } from '@/lib/safe-return-to';
import { ExamSelector, type Edition } from './exam-selector';
import { saveExamTargets } from './actions';

export function ExamTargetForm({
  editions,
  initialTargets,
  returnTo,
}: {
  editions: Edition[];
  initialTargets: string[];
  returnTo: string;
}) {
  const [targets, setTargets] = useState(initialTargets);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const notice = useRef<HTMLDivElement>(null);
  const destination = safeReturnTo(returnTo);
  const unavailable = initialTargets.filter(
    (id) => !editions.some((edition) => edition.id === id),
  );
  function save() {
    if (busy.current) return;
    busy.current = true;
    startTransition(async () => {
      setError('');
      try {
        const result = await saveExamTargets(targets);
        if (result.requiresLogin) {
          window.location.assign(
            withReturnTo('/login', withReturnTo('/app/exams', destination)),
          );
          return;
        }
        if (!result.ok) {
          setError(
            result.message ?? 'Não foi possível salvar. Tente novamente.',
          );
          return;
        }
        setSaved(true);
        requestAnimationFrame(() => notice.current?.focus());
        if (destination.startsWith('/app/assessment/'))
          window.location.assign(destination);
      } catch {
        setError(
          'A conexão foi interrompida. Sua seleção foi mantida; tente novamente.',
        );
      } finally {
        busy.current = false;
      }
    });
  }
  if (saved)
    return (
      <div ref={notice} tabIndex={-1} className="onboarding-step" role="status">
        <h2>Provas salvas</h2>
        <p>
          Sua preparação foi atualizada. Os diagnósticos e estudos anteriores
          foram preservados.
        </p>
        <Link className="primary-button" href={destination as Route}>
          Continuar minha preparação
        </Link>
      </div>
    );
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      aria-busy={pending}
    >
      <fieldset disabled={pending} className="exam-target-fields">
        <legend className="sr-only">Escolha da prova</legend>
        <ExamSelector
          editions={editions}
          targets={targets}
          setTargets={setTargets}
        />
        {unavailable.length > 0 && (
          <div role="status">
            <p>
              Uma escolha anterior não está mais disponível no catálogo. Seus
              estudos permanecem salvos.
            </p>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setTargets((current) =>
                  current.filter((id) => !unavailable.includes(id)),
                )
              }
            >
              Remover escolhas indisponíveis
            </button>
          </div>
        )}
      </fieldset>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="onboarding-actions">
        <Link className="secondary-button" href="/app">
          Voltar à preparação
        </Link>
        <button
          className="primary-button"
          type="submit"
          disabled={pending || editions.length === 0}
        >
          {pending ? 'Salvando provas…' : 'Confirmar escolha'}
        </button>
      </div>
    </form>
  );
}
