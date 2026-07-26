import Link from 'next/link';
import { admin } from '@/features/admin/server/admin';

const percent = (value: number | null) =>
  value === null
    ? 'Ainda sem base'
    : new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        maximumFractionDigits: 0,
      }).format(value);

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="state-card">
      <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
      <strong className="text-3xl">{value}</strong>
      {detail && <p className="text-sm">{detail}</p>}
    </div>
  );
}

export default async function AdminHome() {
  const overview = await admin.overview();
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Operação do Iatron · atualização em{' '}
          {new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
          }).format(new Date(overview.generatedAt))}
        </p>
        <h1 className="text-3xl font-semibold">Como está o Iatron hoje</h1>
        <p>
          Uma leitura objetiva dos estudantes, mentores, conteúdo e saúde da
          plataforma. Todos os números abaixo vêm do ambiente atual.
        </p>
      </header>

      <section className="space-y-4" aria-labelledby="students-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="students-title">Alunos</h2>
            <p>Entrada, atividade e avanço na jornada de preparação.</p>
          </div>
          <Link className="secondary-button" href="/admin/students">
            Acompanhar alunos
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Cadastrados" value={overview.students.registered} />
          <Metric
            detail="Acessaram nos últimos 30 dias"
            label="Ativos"
            value={overview.students.activeLast30Days}
          />
          <Metric
            label="Diagnósticos concluídos"
            value={overview.students.diagnosticsCompleted}
          />
          <Metric
            detail="Atividades planejadas que foram concluídas"
            label="Conclusão do plano"
            value={percent(overview.students.completionRate)}
          />
        </div>
        <p className="text-sm text-[var(--foreground-muted)]">
          {overview.students.newToday} novos hoje ·{' '}
          {overview.students.diagnosticsInProgress} diagnósticos em andamento ·{' '}
          {overview.students.activePlans} planos ativos ·{' '}
          {overview.students.inactive} sem acesso recente
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="mentors-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="mentors-title">Mentores</h2>
            <p>Responsabilidade médica e carga atual por especialidade.</p>
          </div>
          <Link className="secondary-button" href="/admin/mentors">
            Ver responsabilidades
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Mentores ativos" value={overview.mentors.active} />
          <Metric
            label="Aguardando revisão"
            value={overview.mentors.awaitingReview}
          />
          <Metric
            label="Solicitações de estudantes"
            value={overview.mentors.pendingRequests}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="state-card space-y-3">
          <h2>Conteúdo editorial</h2>
          <p>
            {overview.editorial.published} publicados ·{' '}
            {overview.editorial.drafts} rascunhos ·{' '}
            {overview.editorial.inReview} em revisão
          </p>
          <p>
            {overview.editorial.readyToPublish} prontos para publicação ·{' '}
            {overview.editorial.pendingReferences} referências pendentes
          </p>
          <Link href="/editorial">Abrir workspace editorial</Link>
        </div>
        <div className="state-card space-y-3">
          <h2>Produção com apoio de IA</h2>
          <p>
            {overview.ai.drafts} rascunhos · {overview.ai.awaitingReview}{' '}
            aguardando revisão · {overview.ai.approved} aprovados ·{' '}
            {overview.ai.rejected} rejeitados
          </p>
          <p>
            {overview.ai.usage.available
              ? `${overview.ai.usage.value ?? 0} tokens registrados em trabalhos editoriais`
              : overview.ai.usage.note}
          </p>
        </div>
      </section>

      <section
        className="state-card space-y-3"
        aria-labelledby="platform-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="platform-title">Plataforma</h2>
            <p>
              Health: operacional · Ready: pronta · versão{' '}
              {overview.platform.buildSha.slice(0, 7)} · banco{' '}
              {overview.platform.migrationBaseline}
            </p>
          </div>
          <Link className="secondary-button" href="/admin/platform">
            Ver operação técnica
          </Link>
        </div>
      </section>
    </main>
  );
}
