import { notFound } from 'next/navigation';
import {
  assignSpecialtyOwner,
  setSpecialtyOwnerStatus,
} from '@/features/admin/actions';
import { admin } from '@/features/admin/server/admin';

const date = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(
    new Date(value),
  );

export default async function AdminSpecialtyPage({
  params,
}: {
  params: Promise<{ specialtyId: string }>;
}) {
  const { specialtyId } = await params;
  const [specialties, mentors, history] = await Promise.all([
    admin.specialties(),
    admin.mentors(),
    admin.specialtyOwnershipHistory(specialtyId),
  ]);
  const specialty = specialties.find(({ id }) => id === specialtyId);
  if (!specialty) notFound();
  const authorizedMentors = mentors.items.filter(
    ({ status }) => status === 'authorized',
  );
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:p-8">
      <header className="space-y-2">
        <p className="text-sm text-[var(--foreground-muted)]">
          Executive Console / Áreas médicas / {specialty.name}
        </p>
        <h1>{specialty.name}</h1>
        <p>
          Toda atribuição exige autorização verificável. A troca do responsável
          principal encerra o vínculo anterior sem apagar o histórico.
        </p>
      </header>

      <section className="state-card space-y-4">
        <h2>Registrar responsável</h2>
        {authorizedMentors.length ? (
          <form
            action={assignSpecialtyOwner}
            className="grid gap-4 md:grid-cols-2"
          >
            <input name="specialtyId" type="hidden" value={specialty.id} />
            <label>
              Mentor autorizado
              <select name="mentorId" required>
                {authorizedMentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.professionalName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Responsabilidade
              <select name="ownerRole" required>
                <option value="primary">Principal</option>
                <option value="co_owner">Co-owner</option>
              </select>
            </label>
            <label className="md:col-span-2">
              Evidência da autorização
              <input
                maxLength={240}
                minLength={3}
                name="authorizationReference"
                placeholder="Referência do aceite ou documento autorizado"
                required
              />
            </label>
            <button className="primary-button md:col-span-2" type="submit">
              Registrar responsabilidade
            </button>
          </form>
        ) : (
          <p>
            Nenhum mentor possui autorização confirmada. Conclua essa etapa
            antes de atribuir responsabilidade científica.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2>Responsáveis atuais</h2>
        {specialty.owners.length ? (
          specialty.owners.map((owner) => (
            <article className="state-card space-y-3" key={owner.id}>
              <h3>{owner.professionalName}</h3>
              <p>
                {owner.ownerRole === 'primary' ? 'Owner principal' : 'Co-owner'}{' '}
                · {owner.status === 'active' ? 'Ativo' : 'Indisponível'}
              </p>
              <form
                action={setSpecialtyOwnerStatus}
                className="grid gap-3 md:grid-cols-2"
              >
                <input name="specialtyId" type="hidden" value={specialty.id} />
                <input name="ownershipId" type="hidden" value={owner.id} />
                <label>
                  Novo estado
                  <select name="status" required>
                    <option value="temporarily_unavailable">
                      Indisponível temporariamente
                    </option>
                    <option value="active">Ativo</option>
                    <option value="inactive">Encerrar responsabilidade</option>
                  </select>
                </label>
                <label>
                  Indisponível até
                  <input name="unavailableUntil" type="datetime-local" />
                </label>
                <label className="md:col-span-2">
                  Motivo da transição
                  <input minLength={3} name="reason" required />
                </label>
                <button
                  className="secondary-button md:col-span-2"
                  type="submit"
                >
                  Registrar mudança
                </button>
              </form>
            </article>
          ))
        ) : (
          <article className="state-card">
            <h3>Aguardando responsável</h3>
            <p>
              A especialidade permanece visível e sem atribuição fictícia até
              que uma autorização real seja registrada.
            </p>
          </article>
        )}
      </section>

      <section className="state-card space-y-3">
        <h2>Histórico preservado</h2>
        {history.length ? (
          <ol className="space-y-3">
            {history.map((event) => (
              <li key={event.id}>
                <strong>{event.professionalName}</strong>
                <p>
                  {event.ownerRole === 'primary' ? 'Principal' : 'Co-owner'} ·{' '}
                  {event.status} · {date(event.recordedAt)}
                </p>
                {event.reason && <p>{event.reason}</p>}
              </li>
            ))}
          </ol>
        ) : (
          <p>As primeiras atribuições aparecerão aqui sem apagar registros.</p>
        )}
      </section>
    </main>
  );
}
