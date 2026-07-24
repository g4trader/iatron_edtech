'use client';

const titleByPath: Record<string, string> = {
  '/app': 'Visão geral',
  '/app/plan': 'Meu plano',
  '/app/simulations': 'Simulados',
  '/app/performance': 'Meu progresso',
  '/app/assessment/demo': 'Diagnóstico',
};
const titleByPrefix = [
  ['/app/assessment', 'Diagnóstico'],
  ['/app/learning', 'Meu progresso'],
  ['/app/academic', 'Conteúdos'],
  ['/app/tutor', 'Mentores'],
] as const;

export function AppHeader({
  pathname,
  onOpenMenu,
}: {
  pathname: string;
  onOpenMenu: () => void;
}) {
  const title =
    titleByPath[pathname] ??
    titleByPrefix.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    (pathname.startsWith('/app/chat/') ? 'Conversa de estudo' : 'Iatron');
  return (
    <header className="app-header">
      <button
        aria-label="Abrir menu"
        className="icon-button mobile-menu-button"
        onClick={onOpenMenu}
        type="button"
      >
        ☰
      </button>
      <div>
        <p>Sua preparação</p>
        <h1>{title}</h1>
      </div>
      <span aria-hidden="true" className="header-action-spacer" />
    </header>
  );
}
