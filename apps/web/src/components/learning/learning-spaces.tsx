'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export const learningSpaces = [
  {
    label: 'Meu diagnóstico',
    href: '/app/assessment/entry',
    prefix: '/app/assessment',
    description: 'Conheça seu ponto de partida e reveja seus resultados.',
  },
  {
    label: 'Minha trilha',
    href: '/app/plan',
    prefix: '/app/plan',
    description: 'Acesse suas atividades e os motivos de cada recomendação.',
  },
  {
    label: 'Minha evolução',
    href: '/app/learning/mastery',
    prefix: '/app/learning',
    description: 'Acompanhe domínio, prioridades e evidências registradas.',
  },
] as const;
export function LearningSpaces({ overview = false }: { overview?: boolean }) {
  const path = usePathname();
  return (
    <nav
      aria-label="Ambientes de aprendizagem"
      className={`learning-spaces ${overview ? 'learning-spaces-overview' : ''}`}
    >
      {learningSpaces.map((space) => (
        <Link
          key={space.href}
          href={space.href}
          aria-current={path?.startsWith(space.prefix) ? 'page' : undefined}
        >
          <strong>{space.label}</strong>
          {overview && <span>{space.description}</span>}
        </Link>
      ))}
    </nav>
  );
}
