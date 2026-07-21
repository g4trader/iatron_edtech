import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { readEnvironment } from './config/environment.js';
import { verifyToken } from './auth.js';

const environment = readEnvironment({ NODE_ENV: 'test' });
let privateKey: CryptoKey;
let keySet: ReturnType<typeof createLocalJWKSet>;

beforeAll(async () => {
  const pair = await generateKeyPair('ES256', { extractable: true });
  privateKey = pair.privateKey;
  keySet = createLocalJWKSet({
    keys: [
      { ...(await exportJWK(pair.publicKey)), kid: 'current', alg: 'ES256' },
    ],
  });
});

function signToken(
  claims: {
    issuer?: string;
    audience?: string;
    expiration?: string | number;
  } = {},
) {
  const token = new SignJWT({ email: 'student@example.test' })
    .setProtectedHeader({ alg: 'ES256', kid: 'current' })
    .setSubject('student-a')
    .setIssuer(claims.issuer ?? environment.SUPABASE_JWT_ISSUER)
    .setAudience(claims.audience ?? environment.SUPABASE_JWT_AUDIENCE)
    .setIssuedAt();
  return token.setExpirationTime(claims.expiration ?? '5m').sign(privateKey);
}

describe('verifyToken', () => {
  it('accepts a valid signed token', async () => {
    await expect(
      verifyToken(await signToken(), keySet, environment),
    ).resolves.toMatchObject({ sub: 'student-a' });
  });

  it.each([
    ['issuer', { issuer: 'https://another-environment.invalid/auth/v1' }],
    ['audience', { audience: 'another-audience' }],
    ['expiration', { expiration: 0 }],
  ])('rejects an invalid %s', async (_name, claims) => {
    await expect(
      verifyToken(await signToken(claims), keySet, environment),
    ).rejects.toThrow();
  });

  it('rejects an unknown key id and invalid signature', async () => {
    const unknownKid = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: 'unknown' })
      .setSubject('student-a')
      .setIssuer(environment.SUPABASE_JWT_ISSUER)
      .setAudience(environment.SUPABASE_JWT_AUDIENCE)
      .setExpirationTime('5m')
      .sign(privateKey);
    await expect(
      verifyToken(unknownKid, keySet, environment),
    ).rejects.toThrow();

    const otherPair = await generateKeyPair('ES256');
    const invalidSignature = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: 'current' })
      .setSubject('student-a')
      .setIssuer(environment.SUPABASE_JWT_ISSUER)
      .setAudience(environment.SUPABASE_JWT_AUDIENCE)
      .setExpirationTime('5m')
      .sign(otherPair.privateKey);
    await expect(
      verifyToken(invalidSignature, keySet, environment),
    ).rejects.toThrow();
  });

  it('rejects an unexpected algorithm', async () => {
    const secret = crypto.getRandomValues(new Uint8Array(32));
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('student-a')
      .setIssuer(environment.SUPABASE_JWT_ISSUER)
      .setAudience(environment.SUPABASE_JWT_AUDIENCE)
      .setExpirationTime('5m')
      .sign(secret);
    await expect(verifyToken(token, keySet, environment)).rejects.toThrow();
  });
});
