import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { LearningContentVersion } from '@iatron/contracts';
import { MentorReviewSeal } from './learning-content-page';

const material = (
  input: Partial<LearningContentVersion>,
): LearningContentVersion => ({
  id: crypto.randomUUID(),
  contentId: crypto.randomUUID(),
  canonicalKey: 'demo.sepsis',
  slug: 'demo-sepsis',
  versionNumber: 3,
  schemaVersion: 1,
  language: 'pt-BR',
  title: 'Choque séptico',
  subtitle: null,
  estimatedMinutes: 20,
  objectives: [],
  summary: 'Resumo',
  sections: [],
  keyPoints: [],
  clinicalReasoning: null,
  examApplication: null,
  commonMistakes: [],
  quickReview: [],
  conclusion: null,
  video: null,
  editorialStatus: 'ai_draft',
  aiAssisted: true,
  aiModel: 'gpt-5.6-sol',
  promptVersion: 'editorial-mvp-v1',
  isSynthetic: true,
  contentHash: 'a'.repeat(64),
  publishedAt: null,
  reviewedAt: null,
  specialtyId: null,
  competencyId: null,
  assignedMentorId: null,
  mentorName: null,
  mentorSpecialty: null,
  specialtyName: null,
  themeName: null,
  competencyName: null,
  editorName: null,
  provenance: {},
  reviewId: null,
  reviewDecision: null,
  reviewRequested: false,
  requestCount: 0,
  references: [],
  ...input,
});

describe('MentorReviewSeal', () => {
  it('never displays the seal for an AI draft', () => {
    render(<MentorReviewSeal material={material({})} />);
    expect(screen.queryByText('✓ Revisado pelo Mentor')).toBeNull();
    expect(screen.getByText('Material em revisão médica')).toBeTruthy();
  });

  it('displays mentor, version and date only for the exact published review', () => {
    render(
      <MentorReviewSeal
        material={material({
          editorialStatus: 'published',
          reviewDecision: 'approved',
          reviewId: crypto.randomUUID(),
          mentorName: 'Mentor E2E',
          mentorSpecialty: 'Clínica Médica',
          reviewedAt: '2026-07-25T12:00:00.000Z',
        })}
      />,
    );
    expect(screen.getByText('✓ Revisado pelo Mentor')).toBeTruthy();
    expect(screen.getByText(/Mentor E2E · Clínica Médica/)).toBeTruthy();
    expect(screen.getByText(/Versão 3/)).toBeTruthy();
  });
});
