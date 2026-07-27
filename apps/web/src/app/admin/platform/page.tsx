import { admin } from '@/features/admin/server/admin';

const actions: Record<string, string> = {
  user_invited: 'Convite enviado',
  user_enabled: 'Conta reativada',
  user_disabled: 'Conta desativada',
  access_reset_requested: 'Recuperação solicitada',
  user_roles_changed: 'Papéis alterados',
  student_detail_viewed: 'Progresso de aluno consultado',
};

export default async function AdminPlatformPage() {
  const [overview, operations, meta, audit] = await Promise.all([
    admin.overview(),
    admin.operations(),
    admin.meta(),
    admin.audit(),
  ]);
  const frontendSha =
    operations.frontendSha ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    'indisponível';
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-7 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Executive Console / Platform
        </p>
        <h1>Operação técnica</h1>
        <p>
          Saúde, versão e trilha administrativa ficam disponíveis aqui sem
          competir com a visão do negócio.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="state-card">
          <h2>Health</h2>
          <p>{overview.platform.health === 'ok' ? 'Operacional' : 'Atenção'}</p>
        </div>
        <div className="state-card">
          <h2>Ready</h2>
          <p>
            {overview.platform.ready === 'ready'
              ? 'Pronta para receber tráfego'
              : 'Indisponível'}
          </p>
        </div>
        <div className="state-card">
          <h2>Frontend</h2>
          <p>{frontendSha.slice(0, 12)}</p>
        </div>
        <div className="state-card">
          <h2>API</h2>
          <p>{meta.apiSha.slice(0, 12)}</p>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="state-card">
          <h2>Release atual</h2>
          <p>Ambiente: {meta.environment}</p>
          <p>Banco: {meta.schemaVersion}</p>
          <p>Revisão: {meta.cloudRunRevision ?? 'execução local'}</p>
          <p>
            Build:{' '}
            {new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
            }).format(new Date(meta.buildTimestamp))}
          </p>
        </div>
        <div className="state-card">
          <h2>Erros recentes</h2>
          <p>{operations.errors5xxLastHour} respostas 5xx na última hora</p>
          <p>
            {operations.lastIncident
              ? `Último código de suporte: ${operations.lastIncident.requestId.slice(0, 12)}`
              : 'Nenhum incidente registrado nesta instância.'}
          </p>
        </div>
      </section>
      <section className="state-card">
        <h2>Dependências</h2>
        <ul>
          {operations.dependencies.map((dependency) => (
            <li key={dependency.name}>
              {dependency.name}:{' '}
              {dependency.status === 'ok' ? 'operacional' : 'atenção recente'}
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3">
        <h2>Auditoria administrativa recente</h2>
        {audit.length === 0 ? (
          <div className="state-card">
            <h3>Nenhuma ação administrativa registrada</h3>
            <p>Convites e mudanças de acesso aparecerão aqui.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {audit.map((event) => (
              <li className="state-card" key={event.id}>
                <strong>{actions[event.action] ?? event.action}</strong>
                <p>
                  {new Intl.DateTimeFormat('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }).format(new Date(event.created_at))}
                </p>
                <small>Requisição {event.request_id.slice(0, 12)}</small>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
