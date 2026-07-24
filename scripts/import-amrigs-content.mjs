import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

const requiredText = (value, field) => {
  if (typeof value !== 'string' || value.trim().length === 0)
    throw new Error(`${field} is required`);
  return value.trim();
};

export const canonicalQuestionHash = (question) => {
  const canonical = JSON.stringify({
    stem: requiredText(question.stem, 'stem')
      .normalize('NFKC')
      .replaceAll(/\s+/g, ' ')
      .toLocaleLowerCase('pt-BR'),
    options: [...question.options]
      .sort((left, right) => left.position - right.position)
      .map((option) => ({
        label: requiredText(option.label, 'option.label').toUpperCase(),
        content: requiredText(option.content, 'option.content')
          .normalize('NFKC')
          .replaceAll(/\s+/g, ' ')
          .toLocaleLowerCase('pt-BR'),
      })),
  });
  return createHash('sha256').update(canonical).digest('hex');
};

export const validateAmrigsPayload = (input) => {
  if (input?.boardCode !== 'AMRIGS')
    throw new Error('Only the AMRIGS pilot is supported');
  if (input.sourceKind !== 'authorial_validation')
    throw new Error(
      'This MVP accepts only authorial validation content while licensing is pending',
    );
  requiredText(input.importKey, 'importKey');
  requiredText(input.createdBy, 'createdBy');
  requiredText(input.examEditionId, 'examEditionId');
  if (!Array.isArray(input.questions) || input.questions.length < 1)
    throw new Error('At least one question is required');
  if (input.questions.length > 20)
    throw new Error('The MVP is limited to 20 validation questions per batch');

  const sourceKeys = new Set();
  const hashes = new Set();
  const questions = input.questions.map((question, index) => {
    const sourceKey = requiredText(question.sourceKey, 'sourceKey');
    if (!sourceKey.startsWith('AMRIGS:MVP:'))
      throw new Error('sourceKey must use the AMRIGS:MVP namespace');
    if (sourceKeys.has(sourceKey))
      throw new Error(`Duplicate sourceKey at question ${index + 1}`);
    sourceKeys.add(sourceKey);
    if (question.editorialStatus !== 'draft')
      throw new Error('Validation content must remain draft');
    if (!Array.isArray(question.options) || question.options.length < 2)
      throw new Error('Each question needs at least two options');
    if (
      question.options.filter((option) => option.isCorrect === true).length !==
      1
    )
      throw new Error('Each question must have exactly one correct option');
    if (
      new Set(question.options.map((option) => option.position)).size !==
      question.options.length
    )
      throw new Error('Option positions must be unique');
    if (
      !Array.isArray(question.competencyCodes) ||
      question.competencyCodes.length < 1
    )
      throw new Error('Each question needs at least one competency');
    const provenance = question.provenance;
    for (const field of [
      'origin',
      'sourceTitle',
      'rightsHolder',
      'legalBasis',
      'externalIdentifier',
      'obtainedOn',
      'authorshipKind',
      'responsibleParty',
    ])
      requiredText(provenance?.[field], `provenance.${field}`);
    if (provenance.authorshipKind !== 'editorial_non_homologated')
      throw new Error('Validation fixtures must be editorial non-homologated');
    const canonicalHash = canonicalQuestionHash(question);
    if (hashes.has(canonicalHash))
      throw new Error(`Duplicate canonical content at question ${index + 1}`);
    hashes.add(canonicalHash);
    return { ...question, canonicalHash };
  });
  return { ...input, questions };
};

export const loadAmrigsPayload = (file) =>
  validateAmrigsPayload(JSON.parse(readFileSync(file, 'utf8')));

function importPayload(file) {
  const databaseUrl = process.env.CONTENT_DATABASE_URL;
  if (!databaseUrl) throw new Error('CONTENT_DATABASE_URL is required');
  const parsed = new URL(databaseUrl);
  const allowed =
    parsed.hostname === '127.0.0.1' ||
    parsed.hostname === 'localhost' ||
    parsed.hostname.endsWith('.supabase.co') ||
    parsed.hostname.endsWith('.pooler.supabase.com');
  if (!allowed) throw new Error('Database host is not an approved target');
  const payload = loadAmrigsPayload(file);
  const result = spawnSync(
    'psql',
    [
      databaseUrl,
      '-v',
      'ON_ERROR_STOP=1',
      '-v',
      `payload=${JSON.stringify(payload)}`,
      '-c',
      "select public.import_amrigs_content(:'payload'::jsonb) as batch_id;",
    ],
    { cwd: root, encoding: 'utf8', stdio: 'inherit' },
  );
  if (result.status !== 0)
    throw new Error(`AMRIGS import failed with status ${result.status ?? -1}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = resolve(
    root,
    process.argv[2] ?? 'content/amrigs/validation-batch.json',
  );
  importPayload(file);
}
