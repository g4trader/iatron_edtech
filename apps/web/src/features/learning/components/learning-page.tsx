import Link from 'next/link';
import type { ReactNode } from 'react';
import { PageContainer } from '@/components/layout/page-container';

const items = [
  ['Mastery', '/app/learning/mastery'],
  ['Evidências', '/app/learning/evidence'],
  ['Gaps', '/app/learning/gaps'],
  ['Timeline', '/app/learning/timeline'],
  ['Agenda', '/app/learning/schedule'],
] as const;

export function LearningPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <PageContainer>
      <section className="page-intro">
        <p className="eyebrow">Learning Engine determinístico</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </section>
      <nav aria-label="Motor pedagógico" className="flex flex-wrap gap-2">
        {items.map(([label, href]) => (
          <Link
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm"
            href={href}
            key={href}
          >
            {label}
          </Link>
        ))}
      </nav>
      <section className="mt-6 grid gap-4">{children}</section>
    </PageContainer>
  );
}

export function LearningCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          {eyebrow}
        </p>
      )}
      <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      <div className="mt-2 grid gap-2 text-sm text-slate-600">{children}</div>
    </article>
  );
}

export function EmptyLearningState() {
  return (
    <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
      Ainda não há eventos suficientes para esta visão.
    </p>
  );
}
