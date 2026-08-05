import {
  inviteUser,
  resetUserAccess,
  setUserStatus,
  updateUserRoles,
} from '@/features/admin/actions';
import { admin } from '@/features/admin/server/admin';

const roles = [
  ['student', 'Aluno'],
  ['mentor', 'Mentor'],
  ['editor', 'Editor'],
  ['admin', 'Administrador'],
] as const;

export default async function AdminUsersPage() {
  const result = await admin.users();
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-7 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Executive Console / Acessos
        </p>
        <h1>Usuários e permissões</h1>
        <p>
          Convites, bloqueios e mudanças de papel são registrados na auditoria.
          Senhas e links de recuperação nunca aparecem aqui.
        </p>
      </header>
      <section className="state-card space-y-4">
        <div>
          <h2>Convidar uma pessoa</h2>
          <p>
            O convite é enviado por e-mail. Atribuir o papel Administrador exige
            permissão elevada.
          </p>
        </div>
        <form action={inviteUser} className="grid gap-3 sm:grid-cols-3">
          <label>
            Nome
            <input className="form-control" name="displayName" required />
          </label>
          <label>
            E-mail
            <input
              className="form-control"
              name="email"
              required
              type="email"
            />
          </label>
          <label>
            Papel inicial
            <select className="form-control" name="role">
              <option value="mentor">Mentor</option>
              <option value="editor">Editor</option>
              <option value="admin">
                Administrador com autorização elevada
              </option>
            </select>
          </label>
          <button className="primary-button sm:col-span-3" type="submit">
            Enviar convite seguro
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2>{result.total} contas no ambiente</h2>
        {result.items.map((user) => (
          <article className="state-card space-y-4" key={user.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3>{user.displayName}</h3>
                <p>{user.email}</p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {user.status === 'active'
                    ? 'Conta ativa'
                    : 'Conta desativada'}
                  {' · '}
                  {user.roles.join(', ') || 'sem papel'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={setUserStatus}>
                  <input name="id" type="hidden" value={user.id} />
                  <input
                    name="action"
                    type="hidden"
                    value={user.status === 'active' ? 'disable' : 'enable'}
                  />
                  <button className="secondary-button" type="submit">
                    {user.status === 'active' ? 'Desativar' : 'Reativar'}
                  </button>
                </form>
                <form action={resetUserAccess}>
                  <input name="id" type="hidden" value={user.id} />
                  <button className="secondary-button" type="submit">
                    Enviar recuperação
                  </button>
                </form>
              </div>
            </div>
            <form action={updateUserRoles} className="space-y-3">
              <input name="id" type="hidden" value={user.id} />
              <fieldset>
                <legend className="font-semibold">Papéis desta conta</legend>
                <div className="flex flex-wrap gap-4">
                  {roles.map(([value, label]) => (
                    <label className="check-option" key={value}>
                      <input
                        defaultChecked={user.roles.includes(value)}
                        name="roles"
                        type="checkbox"
                        value={value}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="check-option">
                <input name="confirmed" required type="checkbox" value="true" />
                Confirmo que revisei esta mudança de acesso.
              </label>
              <button className="secondary-button" type="submit">
                Atualizar papéis
              </button>
            </form>
          </article>
        ))}
      </section>
    </main>
  );
}
