import {
  createTutorConversationSchema,
  sendTutorMessageSchema,
  uuidSchema,
} from '@iatron/contracts';
import {
  evaluateTutorInput,
  TUTOR_PROMPT_VERSION,
  TUTOR_SYSTEM_PROMPT,
  tutorSafetyIdentifier,
  type AiGateway,
  type AiUsage,
} from '@iatron/ai';
import type { FastifyInstance } from 'fastify';
import type { ApiEnvironment } from './config/environment.js';
import type { TutorRepository } from './tutor-repository.js';

const activeRequests = new Map<string, AbortController>();
let consecutiveFailures = 0;
let circuitOpenedAt = 0;

function sse(reply: { raw: NodeJS.WritableStream }, event: string, data: unknown) {
  reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function registerTutorRoutes(
  app: FastifyInstance,
  options: {
    environment: ApiEnvironment;
    repositoryFactory: (token: string) => TutorRepository;
    gateway: AiGateway;
    clock?: () => number;
  },
) {
  const now = options.clock ?? Date.now;
  app.post('/tutor/conversations', async (request, reply) => {
    const body = createTutorConversationSchema.parse(request.body);
    const id = await options.repositoryFactory(request.auth.accessToken).create(
      body.mode, body.originType, body.originId,
    );
    return reply.status(201).send({ id });
  });
  app.get('/tutor/conversations', async (request) =>
    options.repositoryFactory(request.auth.accessToken).list());
  app.get('/tutor/conversations/:id', async (request, reply) => {
    const id = uuidSchema.parse((request.params as { id: string }).id);
    const repository = options.repositoryFactory(request.auth.accessToken);
    const conversation = await repository.get(id);
    if (!conversation) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Conversa não encontrada.', requestId: request.id } });
    return { ...conversation, messages: await repository.messages(id) };
  });
  app.get('/tutor/conversations/:id/messages', async (request) => {
    const id = uuidSchema.parse((request.params as { id: string }).id);
    return options.repositoryFactory(request.auth.accessToken).messages(id);
  });
  app.patch('/tutor/conversations/:id/archive', async (request, reply) => {
    const id = uuidSchema.parse((request.params as { id: string }).id);
    await options.repositoryFactory(request.auth.accessToken).archive(id);
    return reply.status(204).send();
  });
  app.post('/tutor/generations/:requestId/cancel', async (request, reply) => {
    const requestId = uuidSchema.parse((request.params as { requestId: string }).requestId);
    activeRequests.get(requestId)?.abort();
    return reply.status(202).send({ cancelled: true });
  });
  app.post('/tutor/conversations/:id/messages', async (request, reply) => {
    const conversationId = uuidSchema.parse((request.params as { id: string }).id);
    const body = sendTutorMessageSchema.parse(request.body);
    const guardrail = evaluateTutorInput(body.text);
    if (!guardrail.allowed)
      return reply.status(422).send({ error: { code: guardrail.code, message: guardrail.message, requestId: request.id } });
    if (circuitOpenedAt && now() - circuitOpenedAt < 30_000)
      return reply.status(503).send({ error: { code: 'AI_CIRCUIT_OPEN', message: 'Tutor temporariamente indisponível.', requestId: request.id } });

    const repository = options.repositoryFactory(request.auth.accessToken);
    const conversation = await repository.get(conversationId);
    if (!conversation)
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Conversa não encontrada.', requestId: request.id } });
    const history = await repository.messages(conversationId, 12);
    const context = await repository.context(conversation);
    await repository.begin(conversationId, body.requestId, body.text, options.environment.OPENAI_MODEL, TUTOR_PROMPT_VERSION);

    const controller = new AbortController();
    activeRequests.set(body.requestId, controller);
    reply.raw.on('close', () => {
      if (!reply.raw.writableEnded) controller.abort();
    });
    reply.hijack();
    reply.raw.setHeader('content-type', 'text/event-stream; charset=utf-8');
    reply.raw.setHeader('cache-control', 'no-cache, no-transform');
    reply.raw.setHeader('connection', 'keep-alive');
    sse(reply, 'start', { requestId: body.requestId });
    context.references.forEach((reference) => sse(reply, 'source', reference));

    const startedAt = now();
    let content = '';
    let responseId: string | null = null;
    let usage: AiUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    let status: 'complete' | 'partial' | 'failed' | 'cancelled' = 'complete';
    let errorCode: string | null = null;
    try {
      const messages = [
        ...history
          .filter((message) => message.status === 'complete')
          .map((message) => ({ role: message.role, content: message.content })),
        { role: 'user' as const, content: body.text },
        { role: 'user' as const, content: `CONTEXTO CONFIÁVEL DO SISTEMA:\n${context.text}` },
      ];
      for await (const event of options.gateway.stream({
        instructions: TUTOR_SYSTEM_PROMPT,
        messages,
        maxOutputTokens: options.environment.OPENAI_MAX_OUTPUT_TOKENS,
        safetyIdentifier: tutorSafetyIdentifier(request.auth.userId),
        signal: controller.signal,
      })) {
        if (event.type === 'delta') {
          content += event.delta;
          sse(reply, 'text-delta', { requestId: body.requestId, delta: event.delta });
        } else if (event.type === 'completed') {
          responseId = event.responseId;
          usage = event.usage;
        } else {
          status = 'partial';
          errorCode = 'OUTPUT_INCOMPLETE';
        }
      }
      consecutiveFailures = 0;
    } catch (error) {
      if (controller.signal.aborted) {
        status = 'cancelled';
        errorCode = 'CANCELLED';
      } else {
        status = content ? 'partial' : 'failed';
        errorCode = 'AI_UPSTREAM_ERROR';
        consecutiveFailures += 1;
        if (consecutiveFailures >= 3) circuitOpenedAt = now();
        request.log.error({ err: error, event: 'tutor_generation_failed', requestId: body.requestId }, 'tutor_generation_failed');
      }
    } finally {
      activeRequests.delete(body.requestId);
      await repository.finish({
        requestId: body.requestId, content, status, responseId, ...usage,
        latencyMs: now() - startedAt, errorCode, references: context.references,
      });
      sse(reply, status === 'complete' ? 'complete' : 'error', {
        requestId: body.requestId,
        status,
        message: status === 'cancelled' ? 'Geração cancelada.' : status === 'failed' ? 'Não foi possível gerar a resposta.' : undefined,
      });
      reply.raw.end();
    }
  });
}
