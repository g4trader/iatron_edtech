import { admin } from '@/features/admin/server/admin';

const metric = (
  value: number | null,
  available: boolean,
  note: string | null,
) => (available ? String(value ?? 0) : (note ?? 'Dados ainda não disponíveis'));

export default async function AdminMentorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const mentor = await admin.mentor((await params).id);
  return (
    <main className="experience-page mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Mentores / Responsabilidade
        </p>
        <h1>{mentor.professionalName}</h1>
        <p>
          Responsável por{' '}
          {mentor.specialty ?? 'especialidade ainda não definida'}. Status
          atual: {mentor.status}.
        </p>
      </header>
      <section className="state-card">
        <h2>Áreas sob responsabilidade</h2>
        <p>
          {mentor.areas.length
            ? mentor.areas.join(' · ')
            : 'As áreas ainda não foram relacionadas a esta especialidade.'}
        </p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="state-card">
          <h2>Conteúdo</h2>
          <p>{mentor.assignedContents} atribuídos</p>
          <p>{mentor.publishedContents} publicados</p>
        </div>
        <div className="state-card">
          <h2>Revisões</h2>
          <p>{mentor.pendingReviews} aguardando decisão</p>
          <p>{mentor.completedReviews} concluídas</p>
        </div>
        <div className="state-card">
          <h2>Solicitações</h2>
          <p>{mentor.studentRequests} pedidos de estudantes</p>
        </div>
        <div className="state-card">
          <h2>Vídeos</h2>
          <p>
            {metric(
              mentor.videos.value,
              mentor.videos.available,
              mentor.videos.note,
            )}
          </p>
        </div>
        <div className="state-card">
          <h2>Questões</h2>
          <p>
            {metric(
              mentor.questions.value,
              mentor.questions.available,
              mentor.questions.note,
            )}
          </p>
        </div>
        <div className="state-card">
          <h2>Tempo médio de revisão</h2>
          <p>
            {metric(
              mentor.averageReviewMinutes.value,
              mentor.averageReviewMinutes.available,
              mentor.averageReviewMinutes.note,
            )}
          </p>
        </div>
      </section>
    </main>
  );
}
