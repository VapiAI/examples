import { readFileSync } from 'node:fs';
import { buildReviewTool } from './tools/request_case_review.mjs';

const template = JSON.parse(readFileSync(new URL('./assistant.json', import.meta.url), 'utf8'));

export function buildReviewChat({ input, ...caseConfig }) {
  if (typeof input !== 'string' || !input.trim()) throw new Error('Supply a chat message.');
  const assistant = structuredClone(template);
  assistant.model.tools = [buildReviewTool(caseConfig)];
  return { input, assistant };
}
