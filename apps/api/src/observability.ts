import { randomUUID } from 'node:crypto';
import type { FastifyError, FastifyRequest } from 'fastify';
import { safeUserIdentifier } from './auth.js';

export const errorCodes = [
  'AUTHENTICATION_ERROR',
  'AUTHORIZATION_ERROR',
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'DEPENDENCY_TIMEOUT',
  'DEPENDENCY_UNAVAILABLE',
  'DATABASE_ERROR',
  'AI_PROVIDER_ERROR',
  'EMAIL_PROVIDER_ERROR',
  'INTERNAL_ERROR',
] as const;
export type ErrorCode = (typeof errorCodes)[number];

const requestIdPattern = /^[A-Za-z0-9][A-Za-z0-9_-]{7,63}$/;
export const requestId = (candidate?: string) =>
  candidate && requestIdPattern.test(candidate) ? candidate : randomUUID();

const sensitiveKey =
  /authorization|cookie|password|passwd|token|jwt|secret|service.?role|api.?key|connection.?string|recovery|prompt|answer|content/i;
const sensitiveValue =
  /bearer\s+\S+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.|postgres(?:ql)?:\/\/|(?:sk|re)_[A-Za-z0-9_-]{16,}/i;

export function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 5) return '[REDACTED]';
  if (typeof value === 'string')
    return sensitiveValue.test(value) ? '[REDACTED]' : value.slice(0, 500);
  if (Array.isArray(value))
    return value.slice(0, 25).map((item) => sanitize(item, depth + 1));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitiveKey.test(key) ? '[REDACTED]' : sanitize(item, depth + 1),
      ]),
    );
  return value;
}

export interface ClassifiedError {
  code: ErrorCode;
  status: number;
  retryable: boolean;
  message: string;
}

export function classifyError(error: unknown): ClassifiedError {
  const named = error as { name?: string; code?: string; status?: number };
  if (named.name === 'ZodError' || named.code === 'FST_ERR_VALIDATION')
    return {
      code: 'VALIDATION_ERROR',
      status: 400,
      retryable: false,
      message: 'Dados de entrada inválidos.',
    };
  if (named.status === 429)
    return {
      code: 'RATE_LIMITED',
      status: 429,
      retryable: true,
      message: 'Muitas tentativas em sequência. Aguarde um momento.',
    };
  if (named.name === 'AbortError' || named.name === 'TimeoutError')
    return {
      code: 'DEPENDENCY_TIMEOUT',
      status: 504,
      retryable: true,
      message: 'Um serviço necessário demorou para responder.',
    };
  return {
    code: 'INTERNAL_ERROR',
    status: 500,
    retryable: false,
    message: 'Erro interno do servidor.',
  };
}

export interface OperationalError {
  requestId: string;
  route: string;
  errorCode: string;
  occurredAt: string;
}

export interface DependencyState {
  name: 'supabase' | 'openai' | 'email';
  status: 'ok' | 'degraded';
  lastFailureAt: string | null;
}

export class OperationalState {
  private errors: OperationalError[] = [];
  private dependencies = new Map<DependencyState['name'], string>();
  private frontendSha: string | null = null;

  recordResponse(input: {
    requestId: string;
    route: string;
    statusCode: number;
    errorCode?: string;
    frontendSha?: string;
  }) {
    if (input.frontendSha?.match(/^[a-f0-9]{7,40}$/i))
      this.frontendSha = input.frontendSha;
    if (input.statusCode < 500) return;
    this.errors.unshift({
      requestId: input.requestId,
      route: input.route,
      errorCode: input.errorCode ?? 'INTERNAL_ERROR',
      occurredAt: new Date().toISOString(),
    });
    this.errors = this.errors.slice(0, 25);
  }

  dependencyFailure(name: DependencyState['name']) {
    this.dependencies.set(name, new Date().toISOString());
  }

  snapshot() {
    const since = Date.now() - 60 * 60 * 1000;
    return {
      generatedAt: new Date().toISOString(),
      frontendSha: this.frontendSha,
      errors5xxLastHour: this.errors.filter(
        ({ occurredAt }) => new Date(occurredAt).getTime() >= since,
      ).length,
      recentErrors: this.errors.slice(0, 10),
      dependencies: (['supabase', 'openai', 'email'] as const).map((name) => ({
        name,
        status: this.dependencies.has(name) ? 'degraded' : 'ok',
        lastFailureAt: this.dependencies.get(name) ?? null,
      })),
      lastIncident: this.errors[0] ?? null,
    };
  }
}

export const safeErrorLog = (
  error: FastifyError | unknown,
  request: FastifyRequest,
  classification: ClassifiedError,
) => ({
  event: 'request_failed',
  request_id: request.id,
  route: request.routeOptions.url,
  method: request.method,
  actor_id: request.auth?.userId
    ? safeUserIdentifier(request.auth.userId)
    : undefined,
  frontend_sha:
    typeof request.headers['x-frontend-sha'] === 'string' &&
    /^[a-f0-9]{7,40}$/i.test(request.headers['x-frontend-sha'])
      ? request.headers['x-frontend-sha']
      : undefined,
  api_sha: process.env.BUILD_SHA ?? 'local',
  error_code: classification.code,
  error_class: error instanceof Error ? error.constructor.name : 'UnknownError',
  retryable: classification.retryable,
});
