import Link from 'next/link';
import { admin } from '@/features/admin/server/admin';

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(
        new Date(value),
      )
    : 'Ainda não acessou';

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ['search', 'status', 'sort', 'page'])
    if (typeof params[key] === 'string') query.set(key, params[key]);
  const result = await admin.students(`?${query.toString()}`);
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Executive Console / Alunos
        </p>
        <h1>Jornada dos alunos</h1>
        <p>
          Acompanhe avanço e necessidade de suporte sem acessar respostas ou
          conversas privadas.
        </p>
      </header>
      <form className="state-card grid gap-3 sm:grid-cols-4" method="get">
        <label className="sm:col-span-2">
          Buscar por nome ou e-mail mascarado
          <input
            className="form-control"
            defaultValue={
              typeof params.search === 'string' ? params.search : ''
            }
            name="search"
          />
        </label>
        <label>
          Situação
          <select
            className="form-control"
            defaultValue={
              typeof params.status === 'string' ? params.status : ''
            }
            name="status"
          >
            <option value="">Todas</option>
            <option value="active">Ativas</option>
            <option value="disabled">Desativadas</option>
          </select>
        </label>
        <label>
          Ordenar
          <select
            className="form-control"
            defaultValue={
              typeof params.sort === 'string' ? params.sort : 'lastAccess'
            }
            name="sort"
          >
            <option value="lastAccess">Último acesso</option>
            <option value="created">Cadastro</option>
            <option value="name">Nome</option>
          </select>
        </label>
        <button className="primary-button sm:col-span-4" type="submit">
          Atualizar lista
        </button>
      </form>
      <p>{result.total} alunos encontrados</p>
      {result.items.length === 0 ? (
        <section className="state-card">
          <h2>Nenhum aluno neste recorte</h2>
          <p>Ajuste os filtros para consultar outro grupo.</p>
        </section>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {result.items.map((student) => (
              <article className="state-card space-y-2" key={student.id}>
                <div>
                  <strong>{student.displayName}</strong>
                  <small className="block">{student.emailMasked}</small>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt>Jornada</dt>
                    <dd>{student.onboardingStatus}</dd>
                  </div>
                  <div>
                    <dt>Diagnóstico</dt>
                    <dd>{student.diagnosticStatus ?? 'Ainda não iniciado'}</dd>
                  </div>
                  <div>
                    <dt>Plano</dt>
                    <dd>{student.planStatus ?? 'Ainda não criado'}</dd>
                  </div>
                  <div>
                    <dt>Último acesso</dt>
                    <dd>{date(student.lastAccessAt)}</dd>
                  </div>
                </dl>
                <Link href={`/admin/students/${student.id}`}>
                  Ver progresso
                </Link>
              </article>
            ))}
          </div>
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Jornada</th>
                  <th>Diagnóstico</th>
                  <th>Plano</th>
                  <th>Último acesso</th>
                  <th>
                    <span className="sr-only">Ação</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.displayName}</strong>
                      <small className="block">{student.emailMasked}</small>
                    </td>
                    <td>{student.onboardingStatus}</td>
                    <td>{student.diagnosticStatus ?? 'Ainda não iniciado'}</td>
                    <td>{student.planStatus ?? 'Ainda não criado'}</td>
                    <td>{date(student.lastAccessAt)}</td>
                    <td>
                      <Link href={`/admin/students/${student.id}`}>
                        Ver progresso
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
