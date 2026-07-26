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
  const [overview, audit] = await Promise.all([
    admin.overview(),
    admin.audit(),
  ]);
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
          <p>Operacional</p>
        </div>
        <div className="state-card">
          <h2>Ready</h2>
          <p>Pronta para receber tráfego</p>
        </div>
        <div className="state-card">
          <h2>Versão</h2>
          <p>{overview.platform.buildSha.slice(0, 12)}</p>
        </div>
        <div className="state-card">
          <h2>Banco</h2>
          <p>{overview.platform.migrationBaseline}</p>
        </div>
      </section>
      <section className="state-card">
        <h2>Indicadores ainda não disponíveis</h2>
        <p>
          Falhas agregadas e latência média dependem de uma fonte consolidada de
          telemetria. Nenhum número foi estimado para preencher esta tela.
        </p>
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
