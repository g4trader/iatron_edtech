'use client';

import type { ConfidenceLevel, QuestionViewModel } from '@iatron/contracts';
import { useState } from 'react';

export function QuestionStem({ question }: { question: QuestionViewModel }) {
  return (
    <div className="question-stem">
      <div className="eyebrow-row">
        <span>
          Questão {question.number} de {question.total}
        </span>
        <span>{question.area}</span>
      </div>
      {question.clinicalContext && (
        <p className="clinical-context">{question.clinicalContext}</p>
      )}
      <h2>{question.stem}</h2>
    </div>
  );
}

export function AnswerOption({
  option,
  selected,
  disabled,
  onSelect,
}: {
  option: QuestionViewModel['options'][number];
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className="answer-option"
      data-selected={selected}
      data-disabled={disabled}
    >
      <input
        checked={selected}
        disabled={disabled}
        name="answer"
        onChange={onSelect}
        type="radio"
        value={option.id}
      />
      <span className="option-label">{option.label}</span>
      <span>{option.text}</span>
    </label>
  );
}

export function ConfidenceSelector({
  value,
  disabled,
  onChange,
}: {
  value?: ConfidenceLevel;
  disabled: boolean;
  onChange: (value: ConfidenceLevel) => void;
}) {
  return (
    <fieldset className="confidence-selector" disabled={disabled}>
      <legend>Quão confiante você está?</legend>
      {(['low', 'medium', 'high'] as const).map((level) => (
        <label key={level}>
          <input
            checked={value === level}
            name="confidence"
            onChange={() => onChange(level)}
            type="radio"
          />
          <span>{{ low: 'Baixa', medium: 'Média', high: 'Alta' }[level]}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function MarkedForReviewButton({
  marked,
  disabled,
  onToggle,
}: {
  marked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-pressed={marked}
      className="review-button"
      disabled={disabled}
      onClick={onToggle}
      type="button"
    >
      {marked ? '★ Marcada para revisão' : '☆ Marcar para revisão'}
    </button>
  );
}

export function AssessmentProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="assessment-progress">
      <div>
        <span>Progresso</span>
        <strong>
          {current}/{total}
        </strong>
      </div>
      <progress
        aria-label="Progresso da avaliação"
        max={total}
        value={current}
      />
    </div>
  );
}

export function QuestionCard({
  question,
  onConfirmed,
  compact = false,
}: {
  question: QuestionViewModel;
  onConfirmed?: (question: QuestionViewModel) => void;
  compact?: boolean;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState(
    question.selectedOptionId,
  );
  const [confidence, setConfidence] = useState<ConfidenceLevel | undefined>(
    question.confidence,
  );
  const [marked, setMarked] = useState(question.markedForReview);
  const [confirmed, setConfirmed] = useState(
    question.status === 'answered' || question.readOnly,
  );
  const disabled = Boolean(
    confirmed || question.readOnly || question.status === 'paused',
  );
  const confirm = () => {
    if (!selectedOptionId || !confidence) return;
    setConfirmed(true);
    onConfirmed?.({
      ...question,
      selectedOptionId,
      confidence,
      markedForReview: marked,
      status: 'answered',
    });
  };
  return (
    <article className="question-card" data-compact={compact}>
      <QuestionStem question={question} />
      <div className="answer-list">
        {question.options.map((option) => (
          <AnswerOption
            disabled={disabled}
            key={option.id}
            onSelect={() => setSelectedOptionId(option.id)}
            option={option}
            selected={selectedOptionId === option.id}
          />
        ))}
      </div>
      <ConfidenceSelector
        disabled={disabled}
        onChange={setConfidence}
        value={confidence}
      />
      <div className="question-actions">
        <MarkedForReviewButton
          disabled={Boolean(question.readOnly)}
          marked={marked}
          onToggle={() => setMarked((value) => !value)}
        />
        <button
          className="primary-button"
          disabled={disabled || !selectedOptionId || !confidence}
          onClick={confirm}
          type="button"
        >
          {confirmed ? 'Resposta confirmada' : 'Confirmar resposta'}
        </button>
      </div>
      {confirmed && (
        <p aria-live="polite" className="confirmation-note">
          Resposta registrada apenas nesta demonstração. O gabarito não é
          exibido.
        </p>
      )}
    </article>
  );
}
