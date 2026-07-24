export type MentorSpecialty =
  | 'pediatrics'
  | 'internal_medicine'
  | 'surgery'
  | 'gynecology_obstetrics';

export interface Mentor {
  id: MentorSpecialty;
  name: string;
  displayName: string;
  specialty: string;
  initials: string;
  description: string;
}

export const mentors: readonly Mentor[] = [
  {
    id: 'pediatrics',
    name: 'Aristóteles',
    displayName: 'Dr. Aristóteles',
    specialty: 'Pediatria',
    initials: 'AR',
    description: 'Referência da experiência de Pediatria no Iatron.',
  },
  {
    id: 'internal_medicine',
    name: 'Lucas',
    displayName: 'Dr. Lucas',
    specialty: 'Clínica Médica',
    initials: 'LU',
    description: 'Referência da experiência de Clínica Médica no Iatron.',
  },
  {
    id: 'surgery',
    name: 'Guilherme Peterson',
    displayName: 'Dr. Guilherme Peterson',
    specialty: 'Cirurgia Geral',
    initials: 'GP',
    description: 'Referência da experiência de Cirurgia Geral no Iatron.',
  },
  {
    id: 'gynecology_obstetrics',
    name: 'Fernanda Grosbelli',
    displayName: 'Dra. Fernanda Grosbelli',
    specialty: 'Ginecologia e Obstetrícia',
    initials: 'FG',
    description:
      'Referência da experiência de Ginecologia e Obstetrícia no Iatron.',
  },
] as const;

export const defaultMentor: Mentor = mentors[1]!;

const specialtyPatterns: Record<MentorSpecialty, RegExp> = {
  pediatrics: /\b(PED|PEDI|NEON|PUER|CRIAN|ADOLESC|PEDIATR|NEONAT)\w*/i,
  internal_medicine:
    /\b(CL[IÍ]N|CARD|PNEU|NEFR|ENDO|GASTR|HEMAT|INFECT|REUM|NEURO|DERM|EMERG|CHOQUE|SEPSE|MEDICINA INTERNA)\w*/i,
  surgery: /\b(CIR|SURG|TRAUMA|OPERAT|PR[EÉ]-?OPERAT|P[OÓ]S-?OPERAT)\w*/i,
  gynecology_obstetrics:
    /\b(GO|GINE|GINECO|OBST|GESTA|PARTO|PUERP[EÉ]R|MATERNO)\w*/i,
};

export function mentorForCompetency(input: {
  competencyCode?: string | null;
  competencyName?: string | null;
}) {
  const searchable = `${input.competencyCode ?? ''} ${input.competencyName ?? ''}`;
  return (
    mentors.find((mentor) => specialtyPatterns[mentor.id].test(searchable)) ??
    defaultMentor
  );
}

export function dominantMentor(
  items: ReadonlyArray<{
    competencyCode?: string | null;
    competencyName?: string | null;
  }>,
) {
  if (items.length === 0) return defaultMentor;
  const counts = new Map<MentorSpecialty, number>(
    mentors.map(({ id }) => [id, 0]),
  );
  for (const item of items) {
    const mentor = mentorForCompetency(item);
    counts.set(mentor.id, (counts.get(mentor.id) ?? 0) + 1);
  }
  return mentors.reduce((winner, mentor) =>
    (counts.get(mentor.id) ?? 0) > (counts.get(winner.id) ?? 0)
      ? mentor
      : winner,
  );
}
