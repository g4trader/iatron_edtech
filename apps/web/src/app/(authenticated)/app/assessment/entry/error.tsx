'use client';
export default function DiagnosticEntryError({ reset }: { reset: () => void }) {
  return (
    <main className="catalog-page">
      <h1>Não conseguimos consultar seu diagnóstico agora</h1>
      <p role="alert">
        Tente novamente para verificar suas respostas salvas antes de começar
        uma nova avaliação.
      </p>
      <button className="primary-button" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
