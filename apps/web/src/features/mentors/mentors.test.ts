import { describe, expect, it } from 'vitest';
import {
  defaultMentor,
  dominantMentor,
  mentorForCompetency,
} from './mentors';

describe('seleção de mentor', () => {
  it.each([
    ['PED.NEO.001', 'Reanimação neonatal', 'Aristóteles'],
    ['CARD.001', 'Síndrome coronariana', 'Lucas'],
    ['CIR.TRAUMA.001', 'Trauma abdominal', 'Guilherme Peterson'],
    ['GO.OBST.001', 'Assistência ao parto', 'Fernanda Grosbelli'],
  ])('relaciona %s ao mentor correto', (competencyCode, competencyName, name) => {
    expect(mentorForCompetency({ competencyCode, competencyName }).name).toBe(
      name,
    );
  });

  it('escolhe o mentor da especialidade predominante de forma reproduzível', () => {
    expect(
      dominantMentor([
        { competencyCode: 'GO.001', competencyName: 'Pré-natal' },
        { competencyCode: 'OBST.002', competencyName: 'Parto' },
        { competencyCode: 'CARD.001', competencyName: 'Arritmia' },
      ]).name,
    ).toBe('Fernanda Grosbelli');
  });

  it('usa um anfitrião estável quando ainda não existe plano', () => {
    expect(dominantMentor([])).toBe(defaultMentor);
  });
});
