import { notFound } from 'next/navigation';
import { editorial } from '@/features/editorial/server/editorial';

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(
        new Date(value),
      )
    : 'Ainda sem atualização registrada';

export default async function MentorSpecialtyDashboard({
  params,
}: {
  params: Promise<{ specialtyId: string }>;
}) {
  const { specialtyId } = await params;
  const specialty = await editorial.specialty(specialtyId);
  if (!specialty) notFound();
  const pending = specialty.contents.pending + specialty.references.pending;
  const currentMentor = specialty.owners[0];
  const nextPriority = specialty.gaps[0];
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:p-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--foreground-muted)]">
          Mentoria médica / Especialidades / {specialty.name}
        </p>
        <h1>{specialty.name}</h1>
        <p>
          Este é o retrato científico da especialidade. Use as pendências para
          decidir o que precisa de revisão primeiro.
        </p>
        <p>
          <strong>Seu papel:</strong>{' '}
          {currentMentor?.ownerRole === 'primary'
            ? 'Responsável científico principal'
            : 'Co-owner científico'}
        </p>
      </header>

      <section className="state-card space-y-2" aria-labelledby="next-priority">
        <h2 id="next-priority">Próxima prioridade</h2>
        {nextPriority ? (
          <>
            <h3>{nextPriority.title}</h3>
            <p>{nextPriority.reason}</p>
            <p>{nextPriority.nextAction}</p>
          </>
        ) : (
          <p>
            Nenhuma lacuna determinística foi encontrada com os dados atuais.
            Continue acompanhando novas revisões e referências.
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Conteúdos', specialty.contents.total],
          ['Questões', specialty.questions],
          ['Competências', specialty.competencies],
          ['Pendências', pending],
          ['Referências', specialty.references.total],
          ['Vídeos', specialty.videos],
          ['Blueprints', specialty.blueprints],
          ['Última atualização', date(specialty.lastScientificUpdateAt)],
        ].map(([label, value]) => (
          <article className="state-card" key={label}>
            <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
            <strong className="text-2xl">{value}</strong>
          </article>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="state-card space-y-3">
          <h2>Conhecimento sob responsabilidade</h2>
          <p>
            Áreas: {specialty.areas.join(', ') || 'ainda não relacionadas'}.
          </p>
          <h3>Competências</h3>
          {specialty.competencyNames.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {specialty.competencyNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : (
            <p>
              As competências aparecerão quando a taxonomia desta especialidade
              estiver relacionada.
            </p>
          )}
        </section>
        <section className="state-card space-y-3">
          <h2>Base científica</h2>
          <h3>Referências</h3>
          {specialty.referenceNames.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {specialty.referenceNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma referência foi vinculada a esta especialidade ainda.</p>
          )}
          <p>
            Blueprints relacionados:{' '}
            {specialty.blueprintVersions.join(', ') || 'nenhum'}.
          </p>
        </section>
      </div>

      <section className="state-card space-y-3">
        <h2>Cobertura por competência</h2>
        <p>
          O critério considera conteúdo publicado, questão elegível e referência
          verificada. Ele não representa uma nota de qualidade.
        </p>
        {specialty.coverage.length ? (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Competência</th>
                  <th>Conteúdos</th>
                  <th>Questões</th>
                  <th>Referências</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {specialty.coverage.map((item) => (
                  <tr key={item.competencyId}>
                    <td>{item.competencyName}</td>
                    <td>{item.publishedContents}</td>
                    <td>{item.eligibleQuestions}</td>
                    <td>{item.validReferences}</td>
                    <td>
                      {item.status === 'covered'
                        ? 'Coberta'
                        : item.status === 'needs_update'
                          ? 'Precisa de atualização'
                          : item.status === 'uncovered'
                            ? 'Sem cobertura'
                            : 'Cobertura parcial'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Cobertura ainda não mensurável com segurança.</p>
        )}
      </section>

      <section className="state-card space-y-3">
        <h2>Lacunas de conhecimento</h2>
        {specialty.gaps.length ? (
          <ol className="space-y-3">
            {specialty.gaps.map((gap) => (
              <li key={gap.key}>
                <strong>{gap.title}</strong>
                <p>{gap.reason}</p>
                <p>{gap.nextAction}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p>
            Não há lacunas detectáveis com os dados disponíveis. Novos itens
            aparecerão aqui quando houver uma ação concreta.
          </p>
        )}
      </section>

      <section className="state-card space-y-3">
        <h2>Histórico científico recente</h2>
        {specialty.recentReviews.length ? (
          <ol className="space-y-3">
            {specialty.recentReviews.map((review) => (
              <li key={review.id}>
                <strong>{review.title}</strong>
                <p>
                  {review.mentorName} · {date(review.reviewedAt)} ·{' '}
                  {review.decision === 'approved'
                    ? 'Aprovado'
                    : review.decision === 'changes_requested'
                      ? 'Ajustes solicitados'
                      : 'Não aprovado'}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p>
            A primeira revisão concluída aparecerá aqui com responsável e data.
          </p>
        )}
      </section>

      <aside className="state-card">
        <h2>Como interpretar estes dados</h2>
        <ul className="list-disc space-y-1 pl-5">
          {specialty.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
