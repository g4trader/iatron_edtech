import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ApiEnvironment } from './config/environment.js';

export interface AuthContext {
  userId: string;
  email?: string;
  accessToken: string;
}
export type TokenVerifier = (token: string) => Promise<JWTPayload>;

declare module 'fastify' {
  interface FastifyRequest {
    auth: AuthContext;
  }
}

export function createTokenVerifier(
  environment: ApiEnvironment,
): TokenVerifier {
  const jwks = createRemoteJWKSet(
    new URL(`${environment.SUPABASE_JWT_ISSUER}/.well-known/jwks.json`),
  );
  return async (token) => {
    const result = await jwtVerify(token, jwks, {
      issuer: environment.SUPABASE_JWT_ISSUER,
      audience: environment.SUPABASE_JWT_AUDIENCE,
    });
    return result.payload;
  };
}

export function createAuthenticate(verifier: TokenVerifier) {
  return async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const authorization = request.headers.authorization;
    const match = authorization?.match(/^Bearer ([^\s]+)$/);
    const token = match?.[1];
    if (!token) {
      return reply
        .status(401)
        .send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Autenticação necessária.',
            requestId: request.id,
          },
        });
    }
    try {
      const payload = await verifier(token);
      if (!payload.sub) throw new Error('Token without subject');
      request.auth = {
        userId: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
        accessToken: token,
      };
    } catch {
      request.log.warn(
        { event: 'auth_token_rejected' },
        'authentication_failed',
      );
      return reply
        .status(401)
        .send({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Sessão inválida ou expirada.',
            requestId: request.id,
          },
        });
    }
  };
}
