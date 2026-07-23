import Link from 'next/link';

const items = [
  ['Especialidades', '/app/academic/specialties'],
  ['Áreas', '/app/academic/areas'],
  ['Temas', '/app/academic/themes'],
  ['Competências', '/app/academic/competencies'],
  ['Provas', '/app/academic/exams'],
  ['Fontes médicas', '/app/academic/guidelines'],
] as const;

export function AcademicNavigation() {
  return (
    <nav aria-label="Explorar conteúdos" className="flex flex-wrap gap-2">
      {items.map(([label, href]) => (
        <Link
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm"
          href={href}
          key={href}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
