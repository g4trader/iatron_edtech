'use client';

import type { ChatMessagePart } from '@iatron/contracts';
import { QuestionCard } from '@/features/assessments/components/question-card';
import {
  GapSummaryCard,
  ReferenceList,
  SimulationResultCard,
  StudyPlanCard,
} from '@/features/learning/components/learning-cards';

export function ToolExecutionCard({
  tool,
}: {
  tool: Extract<ChatMessagePart, { type: 'tool-status' }>['tool'];
}) {
  return (
    <div className="tool-card" data-status={tool.status}>
      <span className="status-dot" />
      <div>
        <strong>{tool.label}</strong>
        {tool.detail && <p>{tool.detail}</p>}
      </div>
      <span>
        {tool.status === 'running'
          ? 'Em andamento'
          : tool.status === 'complete'
            ? 'Concluído'
            : 'Erro'}
      </span>
    </div>
  );
}

export function MessagePart({ part }: { part: ChatMessagePart }) {
  switch (part.type) {
    case 'text':
      return <p className="message-text">{part.text}</p>;
    case 'question':
      return <QuestionCard compact question={part.question} />;
    case 'tool-status':
      return <ToolExecutionCard tool={part.tool} />;
    case 'gap-summary':
      return <GapSummaryCard data={part.data} />;
    case 'study-plan':
      return <StudyPlanCard data={part.data} />;
    case 'simulation-result':
      return <SimulationResultCard data={part.data} />;
    case 'references':
      return <ReferenceList items={part.items} />;
  }
}
