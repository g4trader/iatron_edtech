import Link from 'next/link';
import type { Route } from 'next';
import type {
  CompetencyWorkspace,
  MedicalSpecialtyDashboard,
} from '@iatron/contracts';

const coverageLabel = {
  covered: 'Cobertura completa',
  partially_covered: 'Cobertura parcial',
  uncovered: 'Ainda sem cobertura',
  needs_update: 'Precisa de atualização',
  insufficient_data: 'Dados insuficientes',
} as const;

export function CompetencyIndex({
  specialties,
  scope,
}: {
  specialties: MedicalSpecialtyDashboard[];
  scope: 'review' | 'editorial' | 'admin';
}) {
  const competencies = specialties.flatMap((specialty) =>
    specialty.coverage.map((item) => ({ ...item, specialty: specialty.name })),
  );
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:p-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--foreground-muted)]">
          Conhecimento médico / Competências
        </p>
        <h1>Competências</h1>
        <p>
          Cada competência reúne o que o Iatron mede, ensina e exige para a
          preparação do estudante.
        </p>
      </header>
      {competencies.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {competencies.map((item) => (
            <li
              className="state-card space-y-2"
              key={`${item.specialty}-${item.competencyId}`}
            >
              <p className="text-sm text-[var(--foreground-muted)]">
                {item.specialty}
              </p>
              <h2 className="text-xl">
                <Link
                  href={`/${scope}/competencies/${item.competencyId}` as Route}
                >
                  {item.competencyName}
                </Link>
              </h2>
              <p>{coverageLabel[item.status]}</p>
              <p className="text-sm">
                {item.publishedContents} conteúdo(s) · {item.eligibleQuestions}{' '}
                questão(ões) · {item.validReferences} referência(s)
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <section className="state-card">
          <h2>A taxonomia ainda está sendo relacionada</h2>
          <p>
            As competências aparecerão aqui quando forem vinculadas às
            especialidades sob responsabilidade deste workspace.
          </p>
        </section>
      )}
    </main>
  );
}

const ResourceList = ({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: CompetencyWorkspace['contents'];
}) => (
  <section className="state-card space-y-3">
    <h2>{title}</h2>
    {items.length ? (
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            <p className="text-sm text-[var(--foreground-muted)]">
              {item.detail ?? item.status}
            </p>
            {item.href?.startsWith('http') ? (
              <a href={item.href} rel="noreferrer" target="_blank">
                Consultar fonte
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    ) : (
      <p>{empty}</p>
    )}
  </section>
);

export function CompetencyDetail({
  competency,
}: {
  competency: CompetencyWorkspace;
}) {
  const ownerNames = competency.specialties.flatMap((specialty) =>
    specialty.owners.map((owner) => `${owner.name} · ${specialty.name}`),
  );
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:p-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--foreground-muted)]">
          {competency.hierarchy.area} / {competency.hierarchy.theme} /{' '}
          {competency.hierarchy.subtheme}
        </p>
        <h1>{competency.name}</h1>
        <p>{competency.description}</p>
      </header>

      <section className="state-card space-y-3">
        <h2>O que esta competência representa</h2>
        {competency.objectives.length ? (
          <ul className="list-disc space-y-1 pl-5">
            {competency.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        ) : (
          <p>Os objetivos pedagógicos ainda precisam ser detalhados.</p>
        )}
        <p>
          <strong>Responsabilidade científica:</strong>{' '}
          {ownerNames.join(', ') || 'mentor owner ainda não atribuído'}
        </p>
      </section>

      <section className="state-card space-y-3">
        <h2>Cobertura da competência</h2>
        <p>{coverageLabel[competency.coverage.status]}</p>
        <ul className="grid gap-2 sm:grid-cols-3">
          <li>{competency.coverage.publishedContents} conteúdo(s)</li>
          <li>{competency.coverage.eligibleQuestions} questão(ões)</li>
          <li>{competency.coverage.validReferences} referência(s)</li>
          <li>{competency.coverage.videos} vídeo(s)</li>
          <li>{competency.coverage.activeBlueprints} blueprint(s) ativo(s)</li>
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ResourceList
          title="Conteúdos relacionados"
          empty="Ainda não há conteúdo publicado para ensinar esta competência."
          items={competency.contents}
        />
        <ResourceList
          title="Questões relacionadas"
          empty="Ainda não há questão elegível para medir esta competência."
          items={competency.questions}
        />
        <ResourceList
          title="Referências"
          empty="Ainda não há referência científica validada."
          items={competency.references}
        />
        <ResourceList
          title="Vídeos"
          empty="Ainda não há vídeo publicado para esta competência."
          items={competency.videos}
        />
        <ResourceList
          title="Blueprints"
          empty="Esta competência ainda não participa de um blueprint ativo."
          items={competency.blueprints}
        />
      </div>

      <section className="state-card space-y-3">
        <h2>Como aparece na jornada do estudante</h2>
        <dl className="space-y-3">
          <div>
            <dt className="font-semibold">Diagnóstico</dt>
            <dd>{competency.learningUse.diagnostic}</dd>
          </div>
          <div>
            <dt className="font-semibold">Plano</dt>
            <dd>{competency.learningUse.plan}</dd>
          </div>
          <div>
            <dt className="font-semibold">Tutor</dt>
            <dd>{competency.learningUse.tutor}</dd>
          </div>
        </dl>
      </section>

      <section className="state-card space-y-3">
        <h2>Lacunas editoriais</h2>
        {competency.gaps.length ? (
          <ul className="space-y-3">
            {competency.gaps.map((gap) => (
              <li key={gap.reason}>
                <strong>{gap.reason}</strong>
                <p>{gap.nextAction}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Não há pendências estruturais detectáveis com os dados atuais.</p>
        )}
      </section>
      <aside className="state-card">
        <h2>Como interpretar</h2>
        <ul className="list-disc space-y-1 pl-5">
          {competency.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
