import type { ReactNode } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { AcademicNavigation } from './academic-navigation';

export function CatalogPage({
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
        <p className="eyebrow">Conteúdo para sua preparação</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </section>
      <AcademicNavigation />
      <section className="mt-6 grid gap-4">{children}</section>
    </PageContainer>
  );
}

export function CatalogCard({
  title,
  code,
  children,
}: {
  title: string;
  code?: string | null;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {code && (
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          {code}
        </p>
      )}
      <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      <div className="mt-2 grid gap-2 text-sm text-slate-600">{children}</div>
    </article>
  );
}
