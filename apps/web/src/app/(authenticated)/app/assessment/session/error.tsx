'use client';

import Link from 'next/link';

export default function AssessmentSessionError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <main className="page-shell">
      <section aria-live="assertive" className="state-card error-state">
        <h1>Não conseguimos registrar esta resposta agora</h1>
        <p>
          A confirmação não foi concluída. Tente novamente ou volte para sua
          jornada.
        </p>
        <div className="state-action flex flex-wrap gap-2">
          <button className="primary-button" onClick={reset} type="button">
            Tentar novamente
          </button>
          <Link className="secondary-button inline-flex" href="/app">
            Voltar para minha jornada
          </Link>
        </div>
      </section>
    </main>
  );
}
