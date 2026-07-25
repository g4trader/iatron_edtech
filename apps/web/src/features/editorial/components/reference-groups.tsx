import type { LearningContentReference } from '@iatron/contracts';

const groups = [
  { key: 'verified', title: 'Verificadas' },
  { key: 'pending_verification', title: 'Pendentes' },
  { key: 'rejected', title: 'Rejeitadas' },
  { key: 'suggested_by_ai', title: 'Sugeridas pela IA' },
] as const;

export function ReferenceGroups({
  references,
}: {
  references: LearningContentReference[];
}) {
  return (
    <section className="space-y-4" aria-labelledby="references-title">
      <h2 id="references-title">Referências</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(({ key, title }) => {
          const items = references.filter(
            ({ verificationStatus }) => verificationStatus === key,
          );
          return (
            <section className="state-card" key={key}>
              <h3>{title}</h3>
              {items.length ? (
                <ul className="mt-2 space-y-2">
                  {items.map((reference) => (
                    <li key={reference.id}>
                      <strong>{reference.title}</strong>
                      {reference.authorsOrOrganization && (
                        <p className="text-sm">
                          {reference.authorsOrOrganization}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--foreground-muted)]">
                  Nenhuma referência neste estado.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
