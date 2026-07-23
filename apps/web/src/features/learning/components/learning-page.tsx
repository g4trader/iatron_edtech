import Link from 'next/link';
import type { ReactNode } from 'react';
import { PageContainer } from '@/components/layout/page-container';

const items = [
  ['Meu domínio', '/app/learning/mastery'],
  ['Como aprendemos', '/app/learning/evidence'],
  ['Prioridades', '/app/learning/gaps'],
  ['Minha evolução', '/app/learning/timeline'],
  ['Próximos estudos', '/app/learning/schedule'],
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
        <p className="eyebrow">Seu progresso</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </section>
      <nav aria-label="Acompanhar aprendizado" className="flex flex-wrap gap-2">
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

export function EmptyLearningState({
  title = 'Seu progresso aparecerá aqui',
  description = 'Conclua seu primeiro diagnóstico para identificarmos seus pontos fortes e suas prioridades de estudo.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="state-card empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="primary-button inline-flex" href="/app/assessment/start">
        Fazer meu diagnóstico
      </Link>
    </section>
  );
}

export function learningReasonLabel(reason: string) {
  return (
    {
      critical: 'domínio ainda baixo',
      forgotten: 'precisa de revisão',
      low_evidence: 'precisamos conhecer melhor seu nível',
    }[reason] ?? reason.replaceAll('_', ' ')
  );
}

export function learningTrendLabel(trend: string) {
  return (
    {
      improving: 'em evolução',
      declining: 'precisa de atenção',
      stable: 'estável',
    }[trend] ?? trend
  );
}
