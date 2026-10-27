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
        <h1>Não conseguimos confirmar sua resposta agora</h1>
        <p>
          Confira seu diagnóstico salvo antes de continuar. A conexão pode ter
          sido interrompida após o envio.
        </p>
        <div className="state-action flex flex-wrap gap-2">
          <button className="primary-button" onClick={reset} type="button">
            Tentar novamente
          </button>
          <Link
            className="secondary-button inline-flex"
            href="/app/assessment/entry"
          >
            Conferir meu diagnóstico salvo
          </Link>
        </div>
      </section>
    </main>
  );
}
