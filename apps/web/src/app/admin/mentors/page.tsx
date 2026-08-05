import Link from 'next/link';
import { admin } from '@/features/admin/server/admin';

export default async function AdminMentorsPage() {
  const result = await admin.mentors();
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Executive Console / Mentores
        </p>
        <h1>Responsáveis pelas especialidades</h1>
        <p>
          Cada mentor aparece pelo trabalho sob sua responsabilidade, não apenas
          como uma conta de usuário.
        </p>
      </header>
      {result.items.length === 0 ? (
        <section className="state-card">
          <h2>Nenhum mentor atribuído</h2>
          <p>
            Convide um mentor e registre sua especialidade para acompanhar a
            responsabilidade editorial.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {result.items.map((mentor) => (
            <article className="state-card space-y-3" key={mentor.id}>
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {mentor.specialty ?? 'Especialidade ainda não atribuída'}
                </p>
                <h2>{mentor.professionalName}</h2>
                <p>
                  {mentor.areas.length
                    ? mentor.areas.join(' · ')
                    : 'Áreas ainda não registradas'}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt>Conteúdos</dt>
                  <dd>{mentor.assignedContents} atribuídos</dd>
                </div>
                <div>
                  <dt>Publicados</dt>
                  <dd>{mentor.publishedContents}</dd>
                </div>
                <div>
                  <dt>Na fila</dt>
                  <dd>{mentor.pendingReviews}</dd>
                </div>
                <div>
                  <dt>Solicitações</dt>
                  <dd>{mentor.studentRequests}</dd>
                </div>
              </dl>
              <Link
                className="secondary-button self-start"
                href={`/admin/mentors/${mentor.id}`}
              >
                Ver responsabilidade completa
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
