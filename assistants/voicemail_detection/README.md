# Voicemail Detection Assistant

An outbound calling assistant that detects voicemail systems and handles live contacts appropriately.

<a href="https://dashboard.vapi.ai/import?=voicemail_detection">
<img height="35" src="https://auth.vapi.ai/storage/v1/object/public/files/import-to-vapi.svg" alt="Import to Vapi"/>
</a>

## Overview

This assistant monitors uses transcriptions to distinguish between voicemail systems and live humans. When voicemail is detected, it uses the `leave_voicemail` tool to deliver a pre-recorded message. For live contacts, it delivers a brief message and handles responses professionally.

## How It Works

1. **Voicemail Detection** — The assistant uses transcriptions to detect common voicemail phrases (e.g., "Please leave a message after the beep", "Your call has been forwarded to voicemail") and triggers the `leave_voicemail` tool when confident.

2. **Live Person Handling** — When a human answers, the assistant delivers the message and responds to acknowledgments or questions briefly before ending the call.

3. **Tool-Based Voicemail** — Uses Vapi's `voicemail` tool type to deliver messages, ensuring the voicemail is left cleanly without the assistant speaking it aloud.

## Project Contents

- `assistant.json` — Full assistant configuration with voicemail detection logic in the system prompt
- `tools/leave_voicemail.json` — Voicemail tool definition with trigger phrases and the message to leave

## Key Configuration

| Setting | Value |
|---------|-------|
| firstMessageMode | `assistant-waits-for-user` |
| voicemailDetectionEnabled | false |
| voicemailMessage | "" |

## Documentation

- [Voicemail Detection Tool](https://docs.vapi.ai/tools/voicemail-tool)

## Notes

- This assistant uses prompt-based voicemail detection rather than Vapi's built-in `voicemailDetectionEnabled` flag
- Update the `leave_voicemail` tool's `beepDetectionEnabled` to true if you also want to detect voicemail based on beeps.
- Customize the voicemail message in `tools/leave_voicemail.json` under `messages[0].content`

