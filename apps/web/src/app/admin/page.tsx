export default function AdminHome() {
  return (
    <main className="experience-page mx-auto w-full max-w-6xl space-y-7 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">
          Administração da plataforma
        </p>
        <h1 className="text-3xl font-semibold">Console administrativo</h1>
        <p>
          Este ambiente é reservado a segurança, acesso e operação da
          plataforma. O trabalho editorial acontece em um workspace separado.
        </p>
      </header>
      <section className="state-card">
        <h2>Administração isolada</h2>
        <p>
          Nenhuma fila, rascunho ou ação de publicação é exibida aqui. Os
          módulos administrativos serão disponibilizados somente quando
          estiverem prontos e protegidos pelo mesmo controle de acesso.
        </p>
      </section>
    </main>
  );
}
