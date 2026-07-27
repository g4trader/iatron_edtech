import Link from 'next/link';
import type { Route } from 'next';
import { editorial } from '@/features/editorial/server/editorial';

export default async function MentorSpecialtiesPage() {
  const specialties = await editorial.specialties();
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:p-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--foreground-muted)]">
          Mentoria médica / Especialidades
        </p>
        <h1>Suas especialidades</h1>
        <p>
          Cada área reúne o conhecimento científico sob sua responsabilidade:
          conteúdos, questões, referências e revisões.
        </p>
      </header>
      {specialties.length === 0 ? (
        <section className="state-card" aria-labelledby="specialty-empty-title">
          <h2 id="specialty-empty-title">
            Nenhuma responsabilidade oficial registrada
          </h2>
          <p>
            Uma especialidade aparecerá aqui depois que a autorização de
            ownership for registrada pela equipe editorial.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {specialties.map((specialty) => (
            <article className="state-card space-y-4" key={specialty.id}>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {specialty.areas.join(' · ') || 'Áreas em organização'}
                </p>
                <h2>{specialty.name}</h2>
                <p>
                  Responsável científico:{' '}
                  {specialty.owners
                    .map(({ professionalName }) => professionalName)
                    .join(', ')}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt>Conteúdos</dt>
                  <dd>{specialty.contents.total}</dd>
                </div>
                <div>
                  <dt>Questões</dt>
                  <dd>{specialty.questions}</dd>
                </div>
                <div>
                  <dt>Competências</dt>
                  <dd>{specialty.competencies}</dd>
                </div>
                <div>
                  <dt>Pendências</dt>
                  <dd>
                    {specialty.contents.pending + specialty.references.pending}
                  </dd>
                </div>
              </dl>
              <Link
                className="primary-button inline-flex"
                href={`/review/specialties/${specialty.id}` as Route}
              >
                Abrir especialidade
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
