# VAPI Stack - Warm Transfer Agent

[![Install](https://vapi.ai/button.svg)](https://vapi.ai/install?agent=warm_transfer_agent)

## Overview

This agent demonstrates VAPI's **warm transfer** capabilities by acting as an intelligent call routing assistant for VAPI Stack. The assistant, **Alex**, triages inbound calls, determines intent (Support vs. Billing), collects issue summaries, and performs warm transfers to the appropriate team with context. If no agent is available, it creates support tickets with verified customer information.

## Purpose

The agent showcases:
- **Call routing and triage**: Intelligent intent identification (Support vs. Billing)
- **Warm transfer**: Context-aware transfers with issue summaries passed to human operators
- **Transfer assistant**: AI-powered intermediary that speaks to operators before connecting customers
- **Ticket creation**: Fallback when transfers fail or agents unavailable
- **Structured data extraction**: Automatic capture of call details and customer information

## System Architecture

```
Caller → VAPI AI (Alex) → Intent Identification → Issue Summary → Warm Transfer Attempt →
  ├─ Success → Transfer to Human Agent (with context)
  └─ Failure → Ticket Collection → Structured Data Capture → Close
```


## Tools

### 1. `transfer_call_tool`

**Type**: Transfer call tool  
**Purpose**: Performs warm transfers to Support or Billing teams

**Configuration**:
- **Mode**: `warm-transfer-experimental`
- **SIP Verb**: `refer`
- **Two Destinations**:
  - **Billing**: `+15555555555` (when `<billing_issue_summary>`) < change to your number >
  - **Support**: `+15555555555` (when `<support_issue_summary>`) < change to your number >

**Transfer Assistant**:
- **Model**: GPT-4o
- **Role**: Speaks ONLY to the operator (never the customer)
- **Function**: Summarizes customer concern and confirms operator availability
- **Max Duration**: 120 seconds
- **Silence Timeout**: 30 seconds

**Transfer Flow**:
1. Transfer assistant contacts operator
2. Provides summary: *"Hi! I have a customer on the other line having issues with uh <issue_summary>. Would you be able to help us with this?"*
3. Waits for operator response
4. If operator accepts → Completes transfer using `transferSuccessful` tool
5. If operator declines → Cancels transfer using `transferCancel` tool

**Fallback Plan**:
- **Billing**: *"Unfortunately, there's no one available from our billing team right now. I can create a ticket so someone can follow up with you shortly."*
- **Support**: *"Unfortunately, there's no one available from our support team right now. I can create a ticket so someone can follow up with you shortly."*

**Audio**: Plays soothing sound (`https://desert-horse-9859.twil.io/assets/soothing-sound.mp3`) during transfer

### 2. `end_call_tool`

**Type**: End call tool  
**Purpose**: Terminates the conversation when appropriate

**Usage**:
- After successful warm transfer
- After ticket collection and confirmation
- After closing message

## Structured Data Extraction

The agent automatically extracts structured data from conversations using the **VAPI Stack** structured output.

### Schema

**Required Fields**:
- `issue_type` (string) - Type of issue given by customer (support or billing)
- `customer_name` (string) - Full name of the customer
- `issue_summary` (string) - Summary of the issue mentioned by customer
- `customer_email_raw` (string) - Raw spoken email of the customer
- `customer_email_confirmed` (string) - Spelled out email of the customer
- `customer_email_polished` (string) - Polished written email (e.g., "jonas@vapi.ai")

**Extraction Method**: Uses AI-powered structured output that analyzes the call transcript to automatically extract all required fields. The structured output is configured in `structured_outputs/VAPIStack_outputs.json` and referenced via `artifactPlan.structuredOutputIds`.

## Conversation Examples

### Example 1: Support Issue (Successful Warm Transfer)

**Alex**: "Hi, you've reached VAPI Stack. This is Alex, um, How may I help you?"

**Customer**: "Hi, I'm having trouble accessing my dashboard."

~log `<issue_type>` = support

**Alex**: "Got it. Could you briefly explain what's going on? I'll try to pop you through to uh someone who can help."

**Customer**: "Every time I log in, it just keeps loading and never finishes."

~log `<support_issue_summary>`

**Alex**: "Got it! I will now be transferring you over to the appropriate department."

*(Transfer assistant contacts support operator)*

**Transfer Assistant**: "Hi! I have a customer on the other line having issues with uh every time I log in, it just keeps loading and never finishes. Would you be able to help us with this?"

**Operator**: "Yes, I can help."

**Transfer Assistant**: "Great! I will now be connecting you with the customer."

*(Transfer completes)*

---

### Example 2: Billing Issue (Successful Warm Transfer)

**Alex**: "Hi, you've reached VAPI Stack. This is Alex, um, How may I help you?"

**Customer**: "Hi, can you help me with my invoice issue."

~log `<issue_type>` = billing

**Alex**: "Got it. Could you briefly explain what's going on? I'll try to pop you through to uh someone who can help."

**Customer**: "I see two identical charges on my statement."

~log `<billing_issue_summary>`

**Alex**: "Got it! I will now be transferring you over to the appropriate department."

*(Transfer assistant contacts billing operator)*

**Transfer Assistant**: "Hi! I have a customer on the other line having issues with uh I see two identical charges on my statement. Would you be able to help us with this?"

**Operator**: "Sure, I can help."

**Transfer Assistant**: "Great! I will now be connecting you with the customer."

*(Transfer completes)*

---

### Example 3: Unclear Issue → Clarified as Support

**Alex**: "Hi, you've reached VAPI Stack. This is Alex, um, How may I help you?"

**Customer**: "Uh, I'm not really sure, something isn't working right."

**Alex**: "No problem — uh would you say this is more of a support issue or a billing question?"

**Customer**: "It's a support issue."

~log `<issue_type>` = support

**Alex**: "Got it. Could you briefly explain what's going on? I'll try to pop you through to uh someone who can help."

**Customer**: "Our webhook stopped firing after yesterday."

~log `<support_issue_summary>`

*(Proceeds with transfer)*

---

### Example 4: Support Issue → Transfer Fails → Ticket Created

**Alex**: "Hi, you've reached VAPI Stack. This is Alex, um, How may I help you?"

**Customer**: "Hi, our API requests are failing."

~log `<issue_type>` = support

**Alex**: "Got it. Could you briefly explain what's going on? I'll try to pop you through to uh someone who can help."

**Customer**: "We keep getting 500 errors."

~log `<support_issue_summary>`

**Alex**: "Got it! I will now be transferring you over to the appropriate department."

*(Transfer attempt - no agent available)*

**Alex**: "Unfortunately, there's no one available from our support team right now. I can create a ticket so someone can follow up with you shortly."

**Alex**: "Great! may I have your full name, please?"

**Customer**: "Jordan Reyes."

~log `<customer_name>`

**Alex**: "And uh what's the best email address for updates on this?"

**Customer**: "jordan.reyes@acmeco.io"

~log `<customer_email_raw>`

**Alex**: "Just to make sure I've got it right, could you uh spell out that email for me?"

**Customer**: "J-O-R-D-A-N dot R-E-Y-E-S at A-C-M-E-C-O dot I-O."

~log `<customer_email_confirmed>`, `<customer_email_polished>`

**Alex**: "Perfect. I've logged your ticket report under Jordan Reyes. Our team will follow up with you by email. Is there anything else I can assist you with?"

**Customer**: "No, that's all."

~log `<ticket_created>`

**Alex**: "Thanks for your time today. We appreciate you reaching out, and uh someone will be in touch soon. Have a great rest of your day!"

*(Call ends)*


### Transfer Destinations

Both destinations use the same phone number (`+15555555555`) but are differentiated by:
- **Description**: "Use this destination when the customer has a billing-related issue" vs. "Use this destination when the customer has a support-related issue"
- **Transfer Assistant Prompt**: Different prompts for billing vs. support contexts

## Configuration Files

- `assistant.json`: Main agent configuration with system prompt
- `tools/transfer_call_tool.json`: Warm transfer tool with two destinations
- `tools/end_call_tool.json`: Call termination tool
- `structured_outputs/VAPIStack_outputs.json`: Structured output schema for automatic data extraction

## Important Notes

- The agent acts as a **triage and routing assistant**, not a problem solver
- Warm transfers include **context** (issue summary) passed to operators
- Transfer assistant speaks **only to operators**, never customers
- Email verification includes **spelling confirmation** to ensure accuracy
- Structured data extraction captures all conversation details automatically
- Background denoising is enabled for better audio quality
- Key terms in transcription help improve intent classification accuracy
- Transfer attempts have fallback plans when agents are unavailable
- All ticket information is captured as structured data for follow-up

## Use Cases

This agent is ideal for demonstrating:

1. **Call Routing**: Intelligent triage of Support vs. Billing issues
2. **Warm Transfers**: Context-aware transfers with issue summaries
3. **Transfer Assistant**: AI-powered intermediary for operator communication
4. **Ticket Creation**: Fallback when transfers fail
5. **Structured Data Capture**: Automatic extraction of call details and customer information
6. **Email Verification**: Spelling confirmation for accurate email capture

