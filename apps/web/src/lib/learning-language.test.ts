import { describe, expect, it } from 'vitest';
import {
  activityReason,
  difficultyLabel,
  learningActivityLabel,
  learningStage,
  measurementClarity,
  questionSelectionReason,
  studyPriority,
} from './learning-language';

const forbiddenTerms =
  /\b(learning engine|learning gap engine|scheduler|assessment engine|event store|timeline event|question attempt|algorithm version|mastery|confidence|coverage|evidence)\b/i;

describe('linguagem humana da aprendizagem', () => {
  it('transforma medições em orientação compreensível', () => {
    const messages = [
      learningStage(0.31),
      measurementClarity(0.4),
      studyPriority(0.72),
      difficultyLabel(4),
    ];

    expect(messages).toContain(
      'Você ainda está consolidando este conteúdo.',
    );
    expect(messages.join(' ')).not.toMatch(forbiddenTerms);
  });

  it('traduz todos os motivos conhecidos do plano', () => {
    const reasonCodes = [
      'gap_priority',
      'low_mastery',
      'low_confidence',
      'negative_trend',
      'forgotten',
      'unmeasured',
      'target_exam_relevance',
      'exam_proximity',
      'previously_deferred',
      'previously_skipped',
      'recently_completed',
    ];

    const messages = reasonCodes.map(activityReason);
    expect(messages).toHaveLength(reasonCodes.length);
    expect(messages.join(' ')).not.toMatch(forbiddenTerms);
  });

  it('não deixa motivos e eventos internos chegarem à tela', () => {
    expect(questionSelectionReason('confirmação de baixa confiança')).toBe(
      'Uma nova resposta ajudará a tornar seu resultado mais preciso.',
    );
    expect(learningActivityLabel('QuestionAnswered')).toBe(
      'Questão respondida',
    );
    expect(learningActivityLabel('internal_event')).toBe(
      'Evolução registrada',
    );
  });
});
