# Human review from a text chat

This example connects a Vapi text-chat assistant to a receiving owner's Telbox
Notes to Self through an authenticated n8n workflow. A support agent can request
review of the current case without forwarding the transcript or letting the model
choose a destination. The owner approves the proposed notification before it is sent.

The pattern is **application-owned identity → API Request tool → renewable user-OAuth
bridge → owner approval**. There is no call, TTS, phone-number or recording configuration.

## Files

- `assistant.json`: base assistant prompt/model. Importing it alone does not connect an account.
- `tools/request_case_review.mjs`: builds an API Request tool with your saved Vapi credential ID and trusted case identifiers.
- `review-chat.mjs`: adds that tool to an inline assistant for `chats.create`.
- `tools/n8n_workflow.json`: importable, inactive bridge without credentials.
- `review-chat.test.mjs`: offline SDK serialization and bridge-contract checks.

The n8n workflow is copied from Telbox's public
[Vapi preview package](https://github.com/TelboxAI/telbox-connectors/releases/download/v0.1.0-preview.1/vapi.zip).
Its `linked-case-review.json` SHA256 is
`38590f2e2dc298f3a947d635617d19c2703b49d915e9106ef526c3e5d79ecd36`.

## Set up the receiving owner

You need a Vapi account, an n8n instance with an HTTPS production webhook, a
Telbox account with Notes to Self, and an approved Telbox OAuth client. Keep the
Vapi API key and your owner-to-webhook mapping on your application server.

1. Import `tools/n8n_workflow.json` into a new workflow. On **Receive Vapi case
   review**, create a Header Auth credential: name `Authorization`, value
   `Bearer <your random webhook secret>`. Each owner needs a separate workflow,
   production webhook path and secret; the imported path is a template.
2. On **Find my Telbox inbox**, select **Connect to**, disable **Register Client
   Automatically**, and configure the MCP OAuth2 credential:

   | Setting | Value |
   | --- | --- |
   | Grant type | PKCE |
   | Authorization URL | `https://api.telbox.ai/v1/oauth/authorize` |
   | Access token URL | `https://api.telbox.ai/v1/oauth/token` |
   | Scope | `messages:write` |
   | Client authentication | Header |
   | Resource URL | `https://api.telbox.ai/mcp` |

   Use your approved client credentials and register the **exact HTTPS OAuth
   Redirect URL displayed by n8n**. Complete normal owner consent, then select
   the same credential on **Request Telbox message approval**. Never guess a callback.
3. Publish the workflow and copy its **Production URL**, not `/webhook-test/`.
   Create a saved bearer credential in Vapi for the webhook secret and retain its
   real credential ID. Do not put tokens in URLs, prompts or committed JSON.
4. Your application must authorize the current user for both the case and receiving
   owner. Resolve the webhook, credential ID and case reference from that trusted
   mapping. Persist one review UUID and reuse it for retries of that logical review.

Vapi's native MCP OAuth supports client credentials, not browser-user authorization.
The API Request bridge is intentional: n8n retains Telbox's user authorization-code
grant, PKCE, resource binding and refresh lifecycle. Vapi holds only the webhook
credential. Client credentials are not a substitute for the owner's consent.

## Start a text chat

```sh
cd assistants/telbox_text_review
npm ci
npm test
```

In your authenticated backend, use actual trusted records. This code starts a
hosted Vapi text chat and may incur usage:

```js
import { VapiClient } from '@vapi-ai/server-sdk';
import { buildReviewChat } from './review-chat.mjs';

const client = new VapiClient({ token: process.env.VAPI_API_KEY });
const chat = await client.chats.create(buildReviewChat({
  webhookUrl: ownerMapping.productionWebhookUrl,
  credentialId: ownerMapping.vapiCredentialId,
  caseRef: authorizedCase.reference,
  reviewId: persistedReview.id,
  input: 'Please ask a human to review my case.',
}));
console.log(chat.output);
```

`ownerMapping`, `authorizedCase` and `persistedReview` are records your application
must resolve and authorize, not Vapi globals or model-generated values. No real
credential or resource IDs are provided here.

Vapi's `parameters` are static body fields merged after model-generated values.
This tool exposes no model-generated body properties. Only `case_ref` and
`review_id` go to n8n; chat input still goes to Vapi. The bridge discovers the
connected owner's inbox and constructs the short notification itself.

## Review and reconcile

A proposal first reports `pending_approval`. The owner opens Telbox → Tasks →
Automations → Waiting for you, reviews the exact message, and approves or rejects
it. After approval, verify the case reference appears once in Notes to Self.
Proposal creation, server execution, device acknowledgement and physical-phone
rendering are separate outcomes. Approving the message does not resolve or approve
the business decision described by the case.

For `telbox_inbox_unavailable`, inspect the owner's connection and inbox setup;
the bridge stopped before requesting a message. For `review_outcome_unknown`,
reconcile the existing review before retrying with the original review ID.
Prompts are not authorization or idempotency controls: those depend on the
application's owner mapping and Telbox's grant-bound implementation.

To disconnect, disable the workflow, revoke the owner's Telbox grant and remove
the Vapi webhook credential. Deleting an assistant alone does not revoke OAuth.

## Validation limits

`npm test` runs the official `@vapi-ai/server-sdk@3.0.0` with intercepted fetch. It
checks the serialized `POST /chat`, static identifiers, invalid configuration,
and the included n8n validation code. It makes zero external requests and creates
no assistant, chat or credential. It does not prove hosted tool selection/execution.

The bridge was separately exercised in a private n8n/Telbox fixture with synthetic
owner records. Its driver forwarded serialized tool parameters; it was not a
hosted Vapi conversation. Concurrent retries, lost receipts and grant refresh/
revocation were checked there. This does not establish production tenant isolation,
customer deployment or physical iPhone rendering. Qualify those with the intended
account before relying on the integration. No marketplace listing is claimed.

References: [inline text chat](https://docs.vapi.ai/chat/non-streaming),
[API Request configuration](https://docs.vapi.ai/tools/api-request/configuration),
and [MCP authentication limits](https://docs.vapi.ai/tools/mcp/configure).
