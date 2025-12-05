# RAG Intent Transfer Starter

This repo is a minimal reference for building a Vapi assistant that routes callers by intent and augments its replies with Retrieval-Augmented Generation (RAG) instructions. The sample materials assume a roofing and exterior services company that cooperates with partner brands and maintains global contact numbers, but you can swap in any trade so long as the variable schema stays the same. Use these templates to stand up an assistant quickly, then replace the example data with your production values.

<a href="https://dashboard.vapi.ai/import?id=multi_intent_handler">
<img height="35" src="https://auth.vapi.ai/storage/v1/object/public/files/import-to-vapi.svg" alt="Import to Vapi"/>
</a>

## Project Contents

- `assistant.json` - Full assistant configuration including the system prompt. It defines Alex (the Customer Handler), outlines conversation style, lists supported intents, and describes the workflow for calling `get_instructions` after the intent is known.
- `assistant_request.json` - Sample payload that shows how to populate variables such as company metadata when creating or updating the assistant through Vapi's API.
- `tools/get_instructions.ts` - A TypeScript handler that returns step-by-step guidance for each intent. Deploy it as an HTTP endpoint (ValTown for rapid prototyping, AWS Lambda/API Gateway for production, or any HTTPS host).
- `tools/get_instructions.json` - Tool definition for the `get_instructions` API request tool.
- `tools/general/transfer_call.json` - Tool definition for call transfers.
- `tools/general/end_call.json` - Tool definition for ending calls.

## Respond to `assistant_request` Webhooks

Each phone number or assistant in Vapi can point to a **Server URL**. Whenever someone dials that number (or triggers the assistant), Vapi sends a POST request to that URL with the event type `assistant_request`. Your endpoint must reply with the full assistant configuration for that call.

- `assistant_request.json` in this repo mirrors the JSON object your endpoint should return. It sets the company profile (Summit Roofing), trade focus (`["Roofing"]`), partner companies (`partnerCompanyList`), and global providers (`globalCompanyList`).

## How the Assistant Works

1. Intent discovery - The prompt compels Alex to greet the caller, ask how it can help, and narrow the request to one of the supported intents (`supported_service_request`, `request_specific_person`, etc.). It limits the assistant to one clarifying question at a time and enforces guardrails (no tool chatter, no filler, safety policies).
2. RAG-style instruction fetch - As soon as the intent is identified, Alex silently calls the `get_instructions` API tool. That tool posts `{ "intent": "<value>" }` to your hosted copy of `tools/get_instructions.ts`. The endpoint responds with intent-specific directions that effectively stream fresh policy text into the conversation.
3. Action execution - The returned instructions tell Alex what to say, what questions to ask, and when to call helper tools such as `transfer_to_live_agent` or `end_call_tool`. Because these steps live outside the static prompt, you can iterate on procedures without redeploying the assistant.

## Step 1: Publish the Instruction Tool Endpoint

The file `tools/get_instructions.ts` exports a handler that maps intents to scripts. Deploy it somewhere Vapi can reach:

- ValTown (fast dev loop)  
  1. Create a new HTTP Val.  
  2. Paste the contents of `tools/get_instructions.ts`.  
  3. Make the Val public or attach an auth token you can send via headers.  
  4. Note the HTTPS URL; this is the endpoint your Vapi tool will call.

- AWS Lambda + API Gateway (production)  
  1. Bundle `tools/get_instructions.ts` with a lightweight adapter (for example the `@vercel/node` or `aws-lambda` runtime).  
  2. Deploy the Lambda and create an HTTP API Gateway route (POST `/instructions`).  
  3. Configure any auth and capture the invoke URL plus headers.

Whatever host you choose, the endpoint contract is simple:

```
POST /instructions
Content-Type: application/json
{ "intent": "supported_service_request" }
```

Response:

```
{ "instructions": "<multi-line workflow text>" }
```

Feel free to replace the static switch statement with a true RAG pipeline (vector store, knowledge base, etc.). As long as the request and response schema stay the same, the assistant logic does not change.

## Step 2: Create the API Request Tool in Vapi

1. In the Vapi dashboard, open Tools → Add Tool → API Request.  
2. Name it `get_instructions` (this must match the tool name referenced in the prompt).  
3. Set the method to POST and point the URL to the endpoint you just deployed.  
4. Under Request Body, send `{"intent":"{{toolInput.intent}}"}` so the assistant can pass the detected intent.  
5. If your endpoint needs auth, add a header (for example `Authorization: Bearer <token>`).  
6. In Response Mapping, surface the `instructions` string so the model can inject it into the conversation.

## Step 3: Build the Assistant in Vapi

1. Create a new Voice Assistant or import the configuration from `assistant.json`.  
2. The system prompt is already included in `assistant.json`. If creating manually, copy the prompt from the `model.messages` field.  
3. Fill the template variables (company name, DNIS, trades, etc.) either inline or via the API using `assistant_request.json` as a reference.  
4. Add the `get_instructions` API request tool you configured in Step 2.  
5. (Optional) Add any other tools you plan to expose (CRM lookup, appointment booking, etc.).

Once deployed, the assistant automatically:

- Greets callers with the provided message.
- Asks intent-discovery questions until one of the supported intents is selected.
- Calls `get_instructions(intent="<value>")` without narrating the tool call.
- Reads the returned script and follows it verbatim, ensuring consistent handling across intents while still benefiting from RAG-updated procedures.

## Step 4: Enable Call Transfers

Many intents culminate in a live transfer. Vapi supports multiple patterns, so pick the one that matches your telephony stack:

- Built-in Transfer Tool - Add Vapi's native Transfer Call tool, set the destination phone number or SIP address, and name it `transfer_to_live_agent`. The assistant will call it silently whenever the instructions tell it to escalate.
- Custom API-triggered Transfer - If you need to originate transfers through an external system (for example Dialpad, Amazon Connect, or Five9), create another API Request tool that hits your backend. That backend can dial out, drop the caller into a queue, or notify an on-call agent. Return a success status to Vapi once the bridge is established.
- Workflow-based Routing - Create a Vapi workflow that listens for the `transfer_to_live_agent` tool call and then invokes a serverless function or automation (Zapier, Make, etc.) to alert a human while leaving the caller on hold.

Regardless of the approach, make sure the tool:

1. Requires the caller's name before firing (the prompt already enforces this).  
2. Accepts any metadata you need (call reason, callback number).  
3. Confirms back to Vapi so the assistant knows whether to stay on the line, announce a failure, or end the call.

## Putting It All Together

1. Deploy `tools/get_instructions.ts` and obtain its HTTPS URL.  
2. Register the `get_instructions` API tool (see `tools/get_instructions.json`) and point it to that URL.  
3. Configure transfer tooling (see `tools/general/transfer_call.json` and `tools/general/end_call.json`).  
4. Create the assistant using `assistant.json` and your company metadata.  
5. Test each intent path to confirm Alex identifies the intent, calls the instruction tool, follows the returned script, and transfers or ends the call per the workflow.

With this setup, updates to call handling are as easy as editing the instruction endpoint or swapping in a richer RAG knowledge base, no prompt redeploy required.


