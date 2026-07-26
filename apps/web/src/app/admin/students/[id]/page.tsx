import { admin } from '@/features/admin/server/admin';

const label = (value: string | null) => value ?? 'Ainda não disponível';
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Ainda não disponível';

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const student = await admin.student((await params).id);
  return (
    <main className="experience-page mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Alunos / Progresso individual
        </p>
        <h1>{student.displayName}</h1>
        <p>
          Uma visão de suporte da jornada. Respostas e conversas privadas não
          são exibidas.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="state-card">
          <h2>Primeiros passos</h2>
          <p>
            {student.onboardingStatus} · etapa {student.onboardingStep} de 4
          </p>
        </div>
        <div className="state-card">
          <h2>Prova-alvo</h2>
          <p>{label(student.targetExam)}</p>
        </div>
        <div className="state-card">
          <h2>Último acesso</h2>
          <p>{date(student.lastAccessAt)}</p>
        </div>
        <div className="state-card">
          <h2>Diagnóstico</h2>
          <p>{label(student.diagnosticStatus)}</p>
          <p>
            Cobertura:{' '}
            {student.diagnosticCoverage === null
              ? 'ainda não disponível'
              : `${Math.round(student.diagnosticCoverage * 100)}%`}
          </p>
        </div>
        <div className="state-card">
          <h2>Plano de estudos</h2>
          <p>{label(student.planStatus)}</p>
          <p>
            {student.planItemsCompleted} de {student.planItemsTotal} atividades
            concluídas
          </p>
        </div>
        <div className="state-card">
          <h2>Estudo registrado</h2>
          <p>{student.studyMinutes} minutos concluídos</p>
          <p>{student.learningEvents} acontecimentos na jornada</p>
        </div>
      </section>
    </main>
  );
}
