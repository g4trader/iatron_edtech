import { describe, expect, it } from 'vitest';
import {
  contentDisplayTitle,
  editorialStatusLabel,
} from '@/features/editorial/presentation';

describe('editorial presentation', () => {
  it('removes a trailing UUID without changing the readable title', () => {
    expect(
      contentDisplayTitle(
        'Ressuscitação inicial do choque séptico 7c586f0b-94bc-473f-acce-475951291ea5',
      ),
    ).toBe('Ressuscitação inicial do choque séptico');
  });

  it('preserves titles that do not contain a technical suffix', () => {
    expect(contentDisplayTitle('Ressuscitação inicial do choque séptico')).toBe(
      'Ressuscitação inicial do choque séptico',
    );
  });

  it('translates workflow states and does not expose unknown values', () => {
    expect(editorialStatusLabel('mentor_approved')).toBe(
      'Revisão médica concluída',
    );
    expect(editorialStatusLabel('internal_future_state')).toBe(
      'Situação registrada',
    );
  });
});
