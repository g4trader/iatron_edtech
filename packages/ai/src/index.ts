export interface AiRequestContext {
  requestId: string;
  studentId: string;
  promptVersion: string;
}

export interface AiGateway {
  stream(input: string, context: AiRequestContext): AsyncIterable<string>;
}
