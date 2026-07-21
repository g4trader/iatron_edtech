'use client';

const titleByPath: Record<string, string> = {
  '/app': 'Visão geral',
  '/app/plan': 'Meu plano',
  '/app/simulations': 'Simulados',
  '/app/performance': 'Desempenho',
  '/app/assessment/demo': 'Avaliação demonstrativa',
};

export function AppHeader({
  pathname,
  onOpenMenu,
}: {
  pathname: string;
  onOpenMenu: () => void;
}) {
  const title = pathname.startsWith('/app/chat/')
    ? 'Conversa de estudo'
    : (titleByPath[pathname] ?? 'Iatron');
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
        <p>Ambiente de demonstração</p>
        <h1>{title}</h1>
      </div>
      <button aria-label="Mais opções" className="icon-button" type="button">
        •••
      </button>
    </header>
  );
}
