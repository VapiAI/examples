import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { VapiClient } from '@vapi-ai/server-sdk';
import { buildReviewChat } from './review-chat.mjs';

// Synthetic IDs for offline tests only. No credential, case or chat is created.
const fixture = {
  webhookUrl: 'https://automation.example.invalid/webhook/case-review',
  credentialId: '11111111-1111-4111-8111-111111111111',
  caseRef: 'CASE-104',
  reviewId: '22222222-2222-4222-8222-222222222222',
  input: 'Please ask a human to review my case.',
};
const workflow = JSON.parse(readFileSync(new URL('./tools/n8n_workflow.json', import.meta.url)));
const prepare = new Function('$input', workflow.nodes.find(node => node.name === 'Prepare review event').parameters.jsCode);
const normalize = review => prepare({ all: () => [{ json: { review } }] })[0].json;

test('official SDK serializes one text chat request; fetch is intercepted', async () => {
  const requests = [];
  const expected = buildReviewChat(fixture);
  const client = new VapiClient({
    token: 'offline-placeholder-not-a-credential',
    baseUrl: 'https://vapi.example.invalid',
    fetch: async (input, init) => {
      const request = new Request(input, init);
      assert.equal(request.url, 'https://vapi.example.invalid/chat');
      assert.equal(request.method, 'POST');
      requests.push(await request.json());
      return Response.json({ output: [{ role: 'assistant', content: 'Synthetic response; no review was sent.' }] });
    },
  });
  await client.chats.create(expected);
  assert.deepEqual(requests, [expected]);
  assert.equal(expected.assistant.model.tools[0].type, 'apiRequest');
  assert.equal(expected.assistant.model.tools[0].credentialId, fixture.credentialId);
  assert.equal('voice' in expected.assistant, false);
  assert.equal('transcriber' in expected.assistant, false);
});

test('case identity is static; chat input and owner destinations are not tool arguments', () => {
  const chat = buildReviewChat(fixture);
  const tool = chat.assistant.model.tools[0];
  assert.deepEqual(tool.body.properties, {});
  const body = Object.fromEntries(tool.parameters.map(({ key, value }) => [key, value]));
  assert.deepEqual(body, { case_ref: fixture.caseRef, review_id: fixture.reviewId });
  assert.equal(JSON.stringify(body).includes(fixture.input), false);
  assert.equal('headers' in tool, false);
  assert.equal('thread_id' in body, false);
  assert.deepEqual(normalize(body), {
    event_key: JSON.stringify(['vapi-review-v1', fixture.caseRef, fixture.reviewId]),
    content: 'Vapi text chat requested a human review for case CASE-104.',
  });
});

test('the supplied bridge rejects additional fields and preserves a stable retry key', () => {
  const body = { case_ref: fixture.caseRef, review_id: fixture.reviewId };
  assert.deepEqual(normalize(body), normalize({ ...body, review_id: fixture.reviewId.toUpperCase() }));
  for (const invalid of [{ ...body, transcript: fixture.input }, { ...body, thread_id: 'other-owner' },
    { case_ref: fixture.caseRef }, { ...body, case_ref: '{{chat.case}}' }]) {
    assert.throws(() => normalize(invalid));
  }
});

test('invalid configuration is refused before the SDK could send it', () => {
  for (const invalid of [{ webhookUrl: 'http://automation.example.invalid/webhook/review' },
    { webhookUrl: 'https://automation.example.invalid/webhook-test/review' },
    { webhookUrl: 'https://a:b@automation.example.invalid/webhook/review' },
    { webhookUrl: fixture.webhookUrl + '?secret=value' },
    { credentialId: 'raw-secret' }, { reviewId: '{{chat.id}}' }, { caseRef: 'case/104' }, { input: ' ' }]) {
    assert.throws(() => buildReviewChat({ ...fixture, ...invalid }));
  }
});

test('bridge is inactive, credential-free and uses authenticated ingress plus owner OAuth', () => {
  assert.equal(workflow.active, false);
  assert.deepEqual(workflow.pinData, {});
  assert.equal(workflow.nodes.find(n => n.type === 'n8n-nodes-base.webhook').parameters.authentication, 'headerAuth');
  for (const node of workflow.nodes) assert.equal(node.credentials, undefined);
  const mcp = workflow.nodes.filter(n => n.type === '@n8n/n8n-nodes-langchain.mcpClient');
  assert.equal(mcp.length, 2);
  assert.ok(mcp.every(n => n.parameters.endpointUrl === 'https://api.telbox.ai/mcp'));
  assert.ok(mcp.every(n => n.parameters.authentication === 'mcpOAuth2Api'));
});
