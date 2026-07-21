import type {
  ChatTransport,
  ChatTransportEvent,
  SendMessageInput,
} from '@iatron/contracts';

export interface MockChatTransportOptions {
  delayMs?: number;
  fail?: boolean;
  reconnect?: boolean;
}

const responseChunks = [
  'Vamos organizar isso em uma sequência curta. ',
  'Primeiro, identifique o conceito central; ',
  'depois, pratique com uma questão demonstrativa.',
];

export class MockChatTransport implements ChatTransport {
  private readonly cancelled = new Set<string>();
  private readonly delayMs: number;
  private readonly fail: boolean;
  private readonly reconnect: boolean;

  constructor(options: MockChatTransportOptions = {}) {
    this.delayMs = options.delayMs ?? 80;
    this.fail = options.fail ?? false;
    this.reconnect = options.reconnect ?? false;
  }

  async *sendMessage(
    input: SendMessageInput,
  ): AsyncIterable<ChatTransportEvent> {
    yield { type: 'start', requestId: input.requestId };

    if (this.reconnect) {
      await this.wait();
      yield { type: 'reconnecting', requestId: input.requestId };
    }

    for (const delta of responseChunks) {
      await this.wait();
      if (this.cancelled.has(input.requestId)) return;
      yield { type: 'text-delta', requestId: input.requestId, delta };
    }

    if (this.fail) {
      yield {
        type: 'error',
        requestId: input.requestId,
        message: 'A simulação encontrou um erro. Tente novamente.',
      };
      return;
    }

    yield { type: 'complete', requestId: input.requestId };
  }

  async cancel(requestId: string): Promise<void> {
    this.cancelled.add(requestId);
  }

  private async wait(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }
}
