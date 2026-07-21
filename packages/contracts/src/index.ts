import { z } from 'zod';

export const serviceStatusSchema = z.object({
  status: z.enum(['ok', 'ready']),
  service: z.string().min(1),
  timestamp: z.iso.datetime(),
});

export type ServiceStatus = z.infer<typeof serviceStatusSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export type ChatRole = 'user' | 'assistant' | 'system';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface AnswerOptionViewModel {
  id: string;
  label: string;
  text: string;
}

export interface QuestionViewModel {
  id: string;
  number: number;
  total: number;
  area: string;
  stem: string;
  clinicalContext?: string;
  options: AnswerOptionViewModel[];
  selectedOptionId?: string;
  confidence?: ConfidenceLevel;
  markedForReview: boolean;
  status: 'unanswered' | 'answered' | 'paused';
  readOnly?: boolean;
}

export interface ToolStatusViewModel {
  id: string;
  label: string;
  status: 'running' | 'complete' | 'error';
  detail?: string;
}

export interface GapSummaryViewModel {
  id: string;
  area: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  mastery: number;
}

export interface StudySessionViewModel {
  id: string;
  title: string;
  durationMinutes: number;
  status: 'pending' | 'active' | 'complete';
}

export interface StudyPlanViewModel {
  title: string;
  progress: number;
  sessions: StudySessionViewModel[];
}

export interface SimulationResultViewModel {
  title: string;
  answered: number;
  total: number;
  label: string;
}

export interface ReferenceViewModel {
  id: string;
  title: string;
  source: string;
  version: string;
  reviewStatus: 'reviewed' | 'demonstration';
}

export type ChatMessagePart =
  | { type: 'text'; text: string }
  | { type: 'question'; question: QuestionViewModel }
  | { type: 'tool-status'; tool: ToolStatusViewModel }
  | { type: 'gap-summary'; data: GapSummaryViewModel }
  | { type: 'study-plan'; data: StudyPlanViewModel }
  | { type: 'simulation-result'; data: SimulationResultViewModel }
  | { type: 'references'; items: ReferenceViewModel[] };

export interface ChatMessage {
  id: string;
  role: ChatRole;
  createdAt: string;
  parts: ChatMessagePart[];
  status?: 'complete' | 'streaming' | 'error';
}

export interface SendMessageInput {
  requestId: string;
  conversationId: string;
  text: string;
}

export type ChatTransportEvent =
  | { type: 'start'; requestId: string }
  | { type: 'text-delta'; requestId: string; delta: string }
  | { type: 'part'; requestId: string; part: ChatMessagePart }
  | { type: 'complete'; requestId: string }
  | { type: 'error'; requestId: string; message: string }
  | { type: 'reconnecting'; requestId: string };

export interface ChatTransport {
  sendMessage(input: SendMessageInput): AsyncIterable<ChatTransportEvent>;
  cancel(requestId: string): Promise<void>;
}
