const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} não configurada.`);
  return value;
};

const webUrl = required('E2E_WEB_BASE_URL');
const apiUrl = required('E2E_API_BASE_URL').replace(/\/$/, '');
const expectedSha = required('EXPECTED_BUILD_SHA');
const expectedMigration = required('EXPECTED_MIGRATION_BASELINE');

async function inspect() {
  const [web, api] = await Promise.all([
    fetch(new URL('/login', webUrl), { redirect: 'follow' }),
    fetch(`${apiUrl}/health`),
  ]);
  if (!web.ok || !api.ok)
    throw new Error(`Ambiente indisponível: web=${web.status} api=${api.status}`);
  const health = await api.json();
  return {
    webSha: web.headers.get('x-iatron-build-sha'),
    webContract: web.headers.get('x-iatron-contract-version'),
    apiSha: health.buildSha,
    apiContract: health.contractVersion,
    migration: health.migrationBaseline,
  };
}

let last;
for (let attempt = 0; attempt < 40; attempt += 1) {
  last = await inspect();
  if (
    last.webSha === expectedSha &&
    last.apiSha === expectedSha &&
    last.webContract === 'journey-v1' &&
    last.apiContract === 'journey-v1' &&
    last.migration === expectedMigration
  ) {
    console.log(`Staging alinhado no commit ${expectedSha}.`);
    process.exit(0);
  }
  await new Promise((resolve) => setTimeout(resolve, 15_000));
}

throw new Error(`Staging incompatível: ${JSON.stringify(last)}`);
