import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canonicalQuestionHash,
  loadAmrigsPayload,
  validateAmrigsPayload,
} from './import-amrigs-content.mjs';

const fixture = new URL(
  '../content/amrigs/validation-batch.json',
  import.meta.url,
);

test('loads the AMRIGS authorial validation batch', () => {
  const payload = loadAmrigsPayload(fixture);
  assert.equal(payload.boardCode, 'AMRIGS');
  assert.equal(payload.questions.length, 2);
  assert.match(payload.questions[0].canonicalHash, /^[a-f0-9]{64}$/);
});

test('canonical hash ignores whitespace and option input order', () => {
  const base = loadAmrigsPayload(fixture).questions[0];
  const changed = {
    ...base,
    stem: `  ${base.stem}  `,
    options: [...base.options].reverse(),
  };
  assert.equal(canonicalQuestionHash(base), canonicalQuestionHash(changed));
});

test('rejects another board and duplicate content', () => {
  const payload = loadAmrigsPayload(fixture);
  assert.throws(
    () => validateAmrigsPayload({ ...payload, boardCode: 'AMP' }),
    /Only the AMRIGS pilot/,
  );
  assert.throws(
    () =>
      validateAmrigsPayload({
        ...payload,
        questions: [
          payload.questions[0],
          { ...payload.questions[0], sourceKey: 'AMRIGS:MVP:DUPLICATE' },
        ],
      }),
    /Duplicate canonical content/,
  );
});

test('rejects content that pretends to be reviewed or published', () => {
  const payload = loadAmrigsPayload(fixture);
  assert.throws(
    () =>
      validateAmrigsPayload({
        ...payload,
        questions: [{ ...payload.questions[0], editorialStatus: 'published' }],
      }),
    /must remain draft/,
  );
});
