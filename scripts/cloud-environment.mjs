import { URL } from 'node:url';

const projectRefPattern = /^[a-z]{20}$/;

export function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variável obrigatória ausente: ${name}`);
  return value;
}

export function assertStagingTarget({ destructive = false } = {}) {
  const projectRef = requiredEnvironment('SUPABASE_STAGING_PROJECT_ID');
  const approvedRef = requiredEnvironment(
    'SUPABASE_APPROVED_STAGING_PROJECT_ID',
  );
  const productionRef = process.env.SUPABASE_PRODUCTION_PROJECT_ID?.trim();

  if (!projectRefPattern.test(projectRef) || projectRef !== approvedRef) {
    throw new Error(
      'Project ref não corresponde ao staging explicitamente aprovado.',
    );
  }
  if (productionRef && projectRef === productionRef) {
    throw new Error(
      'Operação de staging recusada: destino corresponde à produção.',
    );
  }
  if (destructive && process.env.E2E_ALLOW_DESTRUCTIVE_TESTS !== '1') {
    throw new Error(
      'Operação destrutiva recusada sem E2E_ALLOW_DESTRUCTIVE_TESTS=1.',
    );
  }
  return projectRef;
}

export function assertSupabaseUrlMatches(urlValue, projectRef) {
  const url = new URL(urlValue);
  if (
    url.protocol !== 'https:' ||
    url.hostname !== `${projectRef}.supabase.co`
  ) {
    throw new Error(
      'URL Supabase não corresponde ao projeto staging aprovado.',
    );
  }
}
