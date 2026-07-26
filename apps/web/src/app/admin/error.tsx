'use client';

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="experience-page mx-auto w-full max-w-6xl px-4 py-8 sm:p-8">
      <div className="state-card">
        <h1>Não conseguimos carregar a operação agora</h1>
        <p>Nenhum dado foi alterado. Tente novamente em alguns instantes.</p>
        <button className="primary-button" onClick={reset} type="button">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
