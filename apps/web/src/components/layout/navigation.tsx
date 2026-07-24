import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const navigationItems = [
  { href: '/app', label: 'Início', icon: 'I' },
  { href: '/app/assessment/start', label: 'Diagnóstico', icon: 'D' },
  { href: '/app/plan', label: 'Meu plano', icon: 'P' },
  { href: '/app/tutor', label: 'Mentores', icon: 'M' },
  { href: '/app/simulations', label: 'Simulados', icon: 'S' },
  { href: '/app/learning', label: 'Meu progresso', icon: 'E' },
  { href: '/app/academic', label: 'Conteúdos', icon: 'C' },
] as const;

export function NavigationLinks({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação principal" className="sidebar-nav">
      {navigationItems.map((item) => {
        const active =
          item.href === '/app'
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            aria-current={active ? 'page' : undefined}
            className="sidebar-link"
            data-active={active}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
          >
            <span aria-hidden="true" className="nav-icon">
              {item.icon}
            </span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
