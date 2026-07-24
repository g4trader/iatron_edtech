import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

export const navigationItems = [
  { href: '/app', label: 'Jornada', icon: 'J' },
  { href: '/app/tutor', label: 'Mentores', icon: 'M' },
  { href: '/app/simulations', label: 'Simulados', icon: 'S' },
  { href: '/app/profile', label: 'Perfil', icon: 'P' },
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
            href={item.href as Route}
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
