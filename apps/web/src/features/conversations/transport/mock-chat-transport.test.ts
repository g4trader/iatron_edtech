import { describe, expect, it } from 'vitest';
import { MockChatTransport } from './mock-chat-transport';

async function collect(transport: MockChatTransport) {
  const events = [];
  for await (const event of transport.sendMessage({
    requestId: 'r1',
    conversationId: 'c1',
    text: 'Olá',
  }))
    events.push(event);
  return events;
}

describe('MockChatTransport', () => {
  it('emite streaming e conclusão', async () => {
    const events = await collect(new MockChatTransport({ delayMs: 0 }));
    expect(events.some((event) => event.type === 'text-delta')).toBe(true);
    expect(events.at(-1)?.type).toBe('complete');
  });

  it('emite erro configurável', async () => {
    const events = await collect(
      new MockChatTransport({ delayMs: 0, fail: true }),
    );
    expect(events.at(-1)?.type).toBe('error');
  });

  it('cancela uma solicitação', async () => {
    const transport = new MockChatTransport({ delayMs: 0 });
    await transport.cancel('r1');
    const events = await collect(transport);
    expect(events).toHaveLength(1);
  });
});
