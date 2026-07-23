import Link from 'next/link';
import type { ReactNode } from 'react';

export function AssessmentPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-4xl min-w-0 space-y-6 px-4 py-6 sm:p-6">
      <header>
        <p className="text-sm font-semibold text-[var(--foreground-muted)]">
          Diagnóstico adaptativo · assessment-v1
        </p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p>{description}</p>
      </header>
      <nav
        aria-label="Navegação do diagnóstico"
        className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[var(--primary)]"
      >
        <Link href="/app/assessment/start">Iniciar</Link>
        <Link href="/app/assessment/history">Histórico</Link>
        <Link href="/app/assessment/coverage">Cobertura</Link>
      </nav>
      {children}
    </main>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
