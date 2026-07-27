import { editorial } from '@/features/editorial/server/editorial';

export default async function EditorialSpecialtiesPage() {
  const specialties = await editorial.managedSpecialties();
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:p-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--foreground-muted)]">
          Workspace Editorial / Responsabilidades
        </p>
        <h1>Responsabilidade por área</h1>
        <p>
          Consulte o responsável ativo antes de encaminhar uma revisão. A equipe
          editorial organiza o fluxo, mas não assume a decisão científica.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {specialties.map((specialty) => {
          const primary = specialty.owners.find(
            ({ ownerRole }) => ownerRole === 'primary',
          );
          return (
            <article className="state-card space-y-3" key={specialty.id}>
              <h2>{specialty.name}</h2>
              <p>
                {primary
                  ? `${primary.professionalName} · ${
                      primary.status === 'active'
                        ? 'disponível'
                        : 'temporariamente indisponível'
                    }`
                  : 'Aguardando responsável científico'}
              </p>
              <p>
                {specialty.contents.pending} conteúdos e{' '}
                {specialty.references.pending} referências aguardam atenção.
              </p>
              {!primary && (
                <p>
                  Não encaminhe a revisão sem uma exceção autorizada e
                  justificada.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
