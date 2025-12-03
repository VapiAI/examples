/**
 * Code example for the get_instructions tool.
 */

const INTENT_SUPPORTED_SERVICE_REQUEST = `
  Option A (you know the caller's name):
  1. Say "I understand. I am going to get you to a specialist to assist you. Can I get the best number to reach you back at?"
  2. <wait for response>
  3. **Silently** call transfer_to_live_agent tool.
  
  Option B (you DON'T know the caller's name):
  1. Say "I understand. I am going to get you to a specialist to assist you. Can I get your name?"
  2. Say "What's the best number to reach you back at?"
  3. <wait for response>
  4. **Silently** call transfer_to_live_agent tool.
`;

const INTENT_NOT_SUPPORTED_SERVICE_REQUEST = `
  1. Detect service type (infer it from what the customer said) and check the "Partner companies" list for a relevant partner brand.
  2. If a partner exists in "Partner companies":
     - Inform: "It sounds like you're calling about <serviceType>. Our partner company, <partnerCompanyName>, specializes in that. I can help you with that now."
     - If they ask for contact info: provide clearly but continue the conversation.
     - Ask "Can I get your name?" <wait for response>
     - Ask "Can you tell me more about the [service type] issue you're experiencing?" <wait for response>
     - Acknowledge briefly.
     - Silently call transfer_to_live_agent to the partner company (do not speak before calling).
  3. If no partner company exists but a global option is available in the "Global company list":
     - Inform professionally and provide the number clearly.
     - Ask: "Is there anything else I can assist with, perhaps related to our services?" <wait for response>
     - Close: "Thank you for calling. Have a great day!"
     - **CRITICAL**: Wait for the closing message to be fully spoken BEFORE calling the end_call_tool.
  4. If neither partner company nor global company exists:
     - Explain the limitation politely.
     - Ask if there is anything else you can help with (related to our services).
     - Close: "Thank you for calling. Have a great day!"
`;

const INTENT_REQUEST_SPECIFIC_PERSON = `
  1. Ask for the specific contact they need to reach if they did not mention their name. <wait for response>
  2. Fast‑path for dispatch/tech: If the caller identifies as a technician/vendor or asks for “dispatch,” skip probing and proceed to step 4.
  3. Ask about the nature of their call to verify legitimacy (skip if dispatch/tech fast‑path triggered). <wait for response>
  4. Ask "Can I get your name?" <wait for response>
  5. Silently call transfer_to_live_agent tool to the appropriate team (do not speak before calling).
`;

const INTENT_LOOKING_FOR_A_JOB = `
  1. If name is unknown: "Sure, can I get your name?" <wait for response>
  2. Offer to take information: "If you'd like, I can take your information and pass it to our hiring team."
  3. Phone number (confirm once):
     - If a caller ID number is available: "Is <customer.number> the best phone number to reach you at?"
     - Otherwise: "What's the best phone number to reach you at?" <wait for response>
  4. Acknowledge: "Thanks, [First Name]. I've submitted your information to our hiring team. They'll reach out if there's a match. You can also check current openings at [replace with full company website].
  6. Say goodbye and then call end_call_tool.  **Important** Say goodbye before calling the end_call_tool
`;

const INTENT_WRONG_NUMBER = `
  1. Confirm they understand who "Company" is and what we do. <wait for response>
  2. Offer help with "Trades handled" needs if applicable. <wait for response>
  3. If they do want help with "Trades handled" silently reassess the customer's intent and use the get_instructions tool.
  4. If not, ask "Is there anything else I can assist with?" <wait for response>
  5. If not anything else we can help with: "Thank you for calling "Company". If you have future needs related to "Trades handled", please feel free to give us a call at "Vendor phone". Have a good day!"
`;

const INTENT_REPORT_DRIVER = `
  1. Acknowledge: "I appreciate you bringing this to our attention. Let me gather a few details so I can file this report right away." <wait for response>
  2. Only ask the following questions **exactly as written** and sequentially:
     - "Can you tell me what happened?" <wait for response>
     - "Where did this occur?" <wait for response>
     - "When did this happen? Was it today?" <wait for response>
     - "Did you happen to see a truck number or any identifying information on the vehicle?" <wait for response>
  3. If name unknown: "Can I get your name?" <wait for response>
  4. Optional if not provided: "And what's the best callback number to reach you?" <wait for response>
  5. Acknowledge and confirm filing: "Thanks for providing those details, <firstName>. I’ve documented this and submitted it to our safety team for review."
  6. Reassure next steps: "If they need anything else, they’ll reach out using the number provided."
  7. Close: "Thank you again for reporting this. Is there anything else I can help with today?" <wait for response>
  8. If no further assistance is needed, say: "We appreciate your help keeping our roads safe. Goodbye!"
  9. After you say that last message in step 8, run the end_call_tool.
`;

const INTENT_TELEMARKETER = `
  1. If you are uncertain they are a telemarketer, verify briefly: "Who specifically are you trying to reach?" or "Are you currently working with someone here?" <wait for response>
  2. Owner request disambiguation (ask this if they say they want the owner/manager or a specific leader):
     - "What do you need to speak with the owner about — service for your home or business, billing, feedback about a recent visit, or a business/marketing offer?" <wait for response>
     - If the response indicates service needs, scheduling, emergency, billing, warranty, estimate/quote, or feedback about a recent visit → silently reassess the customer's intent and use the get_instructions tool.
     - If the response indicates reaching a specific internal contact for operations, HR, accounting, supplies, or an existing vendor relationship → silently reassess the customer's intent and use the get_instructions tool.
     - If the response indicates sales/marketing/partnership/demo/advertising/leads/saving money, or remains vague after one follow‑up → treat as Telemarketer and proceed below.
  3. If vague answers or indicators persist, proceed as telemarketer and collect minimal info:
     - "Can I get your name?" <wait for response>
     - "And what's the best number to reach you?" <wait for response>
  4. Close: "Thank you for calling. I made a note of your call and I will forward it on. Good bye!" 
  5. After you say that last message in step 4, run the end_call_tool.
`;

const INTENT_OTHER = `
  1. Ask: "Can I get your name please?" <wait for response>
  2. Kindly tell the user that you cannot help with that. Ask them if they would like to be transferred to a customer support agent.
  3. If yes, **Silently** call transfer_to_live_agent tool.
  4. If no, politely end the call.
`;

export default async function (req: Request): Promise<Response> {
  const reqBody = await req.json();

  const intent = reqBody.intent;

  let result = "";

  switch (intent) {
    case "supported_service_request":
      result = INTENT_SUPPORTED_SERVICE_REQUEST;
      break;
    case "not_supported_service_request":
      result = INTENT_NOT_SUPPORTED_SERVICE_REQUEST;
      break;
    case "request_specific_person":
      result = INTENT_REQUEST_SPECIFIC_PERSON;
      break;
    case "looking_for_a_job":
      result = INTENT_LOOKING_FOR_A_JOB;
      break;
    case "wrong_number":
      result = INTENT_WRONG_NUMBER;
      break;
    case "report_driver":
      result = INTENT_REPORT_DRIVER;
      break;
    case "telemarketer":
      result = INTENT_TELEMARKETER;
      break;
    case "other":
      result = INTENT_OTHER;
      break;
    default:
      result = "No instructions found";
      break;
  }

  return Response.json({ instructions: result });
}