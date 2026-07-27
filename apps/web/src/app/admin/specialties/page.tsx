import Link from 'next/link';
import type { Route } from 'next';
import { admin } from '@/features/admin/server/admin';

const ownershipLabel = {
  active: 'Responsabilidade ativa',
  temporarily_unavailable: 'Responsável temporariamente indisponível',
  pending_assignment: 'Aguardando responsável',
} as const;

export default async function AdminSpecialtiesPage() {
  const specialties = await admin.specialties();
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:p-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--foreground-muted)]">
          Executive Console / Áreas médicas
        </p>
        <h1>Responsabilidade científica</h1>
        <p>
          Acompanhe quem responde por cada especialidade e registre transições
          com autorização e histórico preservados.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {specialties.map((specialty) => {
          const primary = specialty.owners.find(
            ({ ownerRole }) => ownerRole === 'primary',
          );
          return (
            <article className="state-card space-y-3" key={specialty.id}>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {ownershipLabel[specialty.ownershipStatus]}
                </p>
                <h2>{specialty.name}</h2>
                <p>
                  {primary
                    ? `Responsável principal: ${primary.professionalName}`
                    : 'Nenhum responsável principal foi confirmado.'}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt>Conteúdos publicados</dt>
                  <dd>{specialty.contents.total}</dd>
                </div>
                <div>
                  <dt>Pendências</dt>
                  <dd>
                    {specialty.contents.pending + specialty.references.pending}
                  </dd>
                </div>
                <div>
                  <dt>Questões</dt>
                  <dd>{specialty.questions}</dd>
                </div>
                <div>
                  <dt>Lacunas</dt>
                  <dd>{specialty.gaps.length}</dd>
                </div>
              </dl>
              <Link
                className="primary-button inline-flex"
                href={`/admin/specialties/${specialty.id}` as Route}
              >
                Gerenciar responsabilidade
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
