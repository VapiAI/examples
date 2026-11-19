const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

// Arguments must come from the application's authorized case record/configuration,
// never from the chat model or an unauthenticated user's request body.
export function buildReviewTool({ webhookUrl, credentialId, caseRef, reviewId }) {
  const url = new URL(webhookUrl);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      !url.pathname.startsWith('/webhook/') || url.pathname.endsWith('/')) {
    throw new Error('Use the published HTTPS production webhook URL from n8n.');
  }
  if (typeof credentialId !== 'string' || !uuid.test(credentialId)) throw new Error('Supply a saved Vapi credential ID.');
  if (typeof reviewId !== 'string' || !uuid.test(reviewId)) throw new Error('Supply the persistent review UUID from your case record.');
  if (typeof caseRef !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,39}$/.test(caseRef)) throw new Error('Supply a short case reference.');
  return {
    type: 'apiRequest',
    name: 'request_case_review',
    method: 'POST',
    url: url.href,
    credentialId,
    description: 'Request receiving-owner approval of a notification about this support case.',
    body: { type: 'object', properties: {} },
    parameters: [
      { key: 'case_ref', value: caseRef },
      { key: 'review_id', value: reviewId.toLowerCase() },
    ],
  };
}
