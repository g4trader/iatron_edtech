import { describe, expect, it } from 'vitest';
import { confidenceLevel, diagnosticCoverage, selectNextQuestion } from './assessment-engine.js';

const candidate = (id: string, competencyId: string, difficulty: number, theme: string) => ({ questionVersionId: id, competencyIds: [competencyId], difficulty, themeIds: [theme] });
describe('adaptive assessment engine', () => {
  it('prioritizes unmeasured competencies reproducibly', () => {
    const input = { candidates: [candidate('b', 'known', 3, 'used'), candidate('a', 'new', 2, 'new')], mastery: [{ competencyId:'known', competencyCode:'K', competencyName:'Known', mastery:.6, confidence:.8, evidenceCount:5, trend:'stable' as const, lastEvidenceAt:'2026-07-20T00:00:00Z', algorithmVersion:'mastery-v1' }], attemptedQuestionIds: [], usedThemeIds: ['used'] };
    expect(selectNextQuestion(input)?.candidate.questionVersionId).toBe('a');
    expect(selectNextQuestion(input)).toEqual(selectNextQuestion(input));
  });
  it('never repeats attempted questions', () => {
    expect(selectNextQuestion({ candidates:[candidate('a','new',2,'t')], mastery:[], attemptedQuestionIds:['a'], usedThemeIds:[] })).toBeNull();
  });
  it('combines quantity, recency, consistency and diversity for confidence', () => {
    expect(confidenceLevel({ evidenceCount:5, lastEvidenceAt:'2026-07-22T00:00:00Z', correctness:[true,true,true,true], distinctQuestionCount:3 }, new Date('2026-07-23T00:00:00Z')).level).toBe('high');
    expect(confidenceLevel({ evidenceCount:1, lastEvidenceAt:null, correctness:[true], distinctQuestionCount:1 }, new Date('2026-07-23T00:00:00Z')).level).toBe('low');
  });
  it('calculates competency coverage rather than global score', () => {
    expect(diagnosticCoverage(['a','b','c'], ['a','c'])).toBe(0.66667);
  });
});
