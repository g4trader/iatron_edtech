import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { LearningContentVersion } from '@iatron/contracts';
import { VersionComparison, diffWords } from './version-comparison';

const version = (
  input: Partial<LearningContentVersion> = {},
): LearningContentVersion => ({
  id: crypto.randomUUID(),
  contentId: crypto.randomUUID(),
  canonicalKey: 'demo.sepsis',
  slug: 'demo-sepsis',
  versionNumber: 2,
  schemaVersion: 1,
  language: 'pt-BR',
  title: 'Choque séptico',
  subtitle: null,
  estimatedMinutes: 20,
  objectives: ['Reconhecer instabilidade'],
  summary: 'Inicie cristaloide.',
  sections: [{ heading: 'Conduta', body: 'Avalie perfusão.' }],
  keyPoints: [],
  clinicalReasoning: null,
  examApplication: null,
  commonMistakes: [],
  quickReview: [],
  conclusion: null,
  video: null,
  editorialStatus: 'awaiting_mentor_review',
  aiAssisted: false,
  aiModel: null,
  promptVersion: null,
  isSynthetic: true,
  contentHash: 'a'.repeat(64),
  publishedAt: null,
  reviewedAt: null,
  specialtyId: null,
  competencyId: null,
  assignedMentorId: null,
  mentorName: null,
  mentorSpecialty: null,
  specialtyName: 'Clínica Médica',
  themeName: 'Emergências',
  competencyName: 'Reconhecer choque',
  editorName: 'Editor',
  provenance: {},
  reviewId: null,
  reviewDecision: null,
  reviewRequested: false,
  requestCount: 0,
  references: [],
  ...input,
});

describe('VersionComparison', () => {
  it('identifies additions and removals deterministically', () => {
    expect(diffWords('volume inicial', 'volume balanceado inicial')).toEqual(
      expect.arrayContaining([
        { kind: 'added', value: 'balanceado' },
        { kind: 'same', value: 'inicial' },
      ]),
    );
  });

  it('explains when this is the first version', () => {
    render(<VersionComparison current={version()} previous={null} />);
    expect(screen.getByText('Primeira versão publicada.')).toBeTruthy();
  });

  it('renders an accessible explanation of highlighted changes', () => {
    render(
      <VersionComparison
        current={version({ summary: 'Inicie cristaloide balanceado.' })}
        previous={version({
          id: crypto.randomUUID(),
          versionNumber: 1,
          summary: 'Inicie cristaloide.',
        })}
      />,
    );
    expect(screen.getByText(/Verde indica adição/)).toBeTruthy();
    expect(screen.getByText('balanceado.')).toBeTruthy();
  });
});
