import { describe, expect, it } from 'vitest';
import { curriculumParams, parseCurriculumSearch } from './catalog';
describe('curriculum navigation', () => {
  it('preserves filters and changes only pagination', () => {
    const query = parseCurriculumSearch({
      search: 'bronquiolite',
      missing: 'questions',
      status: 'pending_review',
    });
    expect(curriculumParams(query, { page: 2 }).get('search')).toBe(
      'bronquiolite',
    );
    expect(curriculumParams(query, { page: 2 }).get('missing')).toBe(
      'questions',
    );
    expect(curriculumParams(query, { page: 2 }).get('page')).toBe('2');
  });
  it('removes previous subarea when changing specialty', () => {
    const query = parseCurriculumSearch({
      areaId: '50000000-0000-4000-8000-000000000001',
    });
    expect(curriculumParams(query, { areaId: undefined }).has('areaId')).toBe(
      false,
    );
  });
  it('recovers invalid external query parameters safely', () => {
    expect(
      parseCurriculumSearch({ page: '-1', specialtyId: 'invalid' }).page,
    ).toBe(1);
  });
});
