import { getAuthState } from '@/lib/auth';

export default async function MentorProfilePage() {
  const { user, profile } = await getAuthState();
  return (
    <main className="experience-page mx-auto w-full max-w-3xl space-y-5 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">Perfil</p>
        <h1>{profile?.display_name ?? 'Mentor'}</h1>
        <p>
          Seus dados profissionais e sua autorização definem quais conteúdos
          podem ser atribuídos para revisão.
        </p>
      </header>
      <section className="state-card">
        <h2>Acesso profissional</h2>
        <p>{user?.email}</p>
        <p>Perfil autorizado para revisão médica no Iatron.</p>
      </section>
    </main>
  );
}
