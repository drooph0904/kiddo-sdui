import { test } from 'node:test';
import assert from 'node:assert';
import { generatePayload } from './generate.ts';

const valid = JSON.stringify({
  theme: { primary: '#e11', background: '#fff', surface: '#fff', text: '#111', accent: '#f90' },
  tree: { type: 'Column', children: [{ type: 'Banner', title: 'Diwali Sale' }] },
});

test('returns a validated payload from a good model response', async () => {
  const p = await generatePayload('diwali sale', { callModel: async () => valid });
  assert.equal(p.tree.type, 'Column');
});

test('retries once then throws on persistently invalid output', async () => {
  let calls = 0;
  await assert.rejects(() =>
    generatePayload('x', { callModel: async () => { calls++; return '{"bad":true}'; } }),
  );
  assert.equal(calls, 2);
});
