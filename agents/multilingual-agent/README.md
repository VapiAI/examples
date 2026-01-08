# VAPI Support - Multilingual Assistant

[![Install](https://vapi.ai/button.svg)](https://vapi.ai/install?agent=multilingual-agent)

## Overview

This agent demonstrates VAPI's multilingual capabilities by providing customer support in **English**, **Spanish**, and **Chinese (Mandarin)**. The assistant, **VAPI Support**, automatically detects the caller's language and seamlessly continues the conversation in that language without announcing the switch. The agent explains company policies conversationally, answers FAQs, and provides reassurance to customers.

## Purpose

The agent showcases:
- **Automatic language detection**: Detects caller's language (English, Spanish, or Chinese)
- **Seamless language switching**: Continues conversation in detected language without announcement
- **Multilingual transcription**: Uses Deepgram's multi-language transcription
- **Conversational policy explanations**: Friendly, human-like responses with natural fillers
- **FAQ handling**: Answers common questions about subscriptions, cancellations, refunds, and more

## AI Assistant: VAPI Support

**Model**: GPT-4o  
**Voice**: ElevenLabs Turbo v2.5 (Voice ID: kPzsL2i3teMYv0FxEYQ6)  
**Transcriber** Deepgram nova-3 (lanaguage: multi)
**Personality**: Calm, warm, conversational customer support assistant

## Primary Languages

- **English** (default)
- **Spanish** (Español)
- **Chinese** (Mandarin - 中文)

## Tools

### `end_call_tool`

**Type**: End call tool  
**Purpose**: Terminates the conversation when appropriate

**Usage**:
- Called after answering caller's questions
- Called when conversation is complete
- Called after closing message

## Conversation Examples

### Example 1: English - Cancellation Policy

**VAPI Support**: "Hi — uh, thank you for calling VAPI Support. How may I help you today?"

**Customer**: "Hi, I want to cancel my subscription."

**VAPI Support**: "Sure — um, our cancellation policy is pretty simple. You can cancel anytime, and you won't be charged again. Even if you cancel in the middle of a billing cycle, you still keep access until the end of that period. Want me to explain it a bit more?"

**Customer**: "So I keep access until the end of the month?"

**VAPI Support**: "No — you keep full access until the current billing period ends. After that, it just won't renew."

**Customer**: "Perfect, thanks!"

**VAPI Support**: "Alright — um, I'm glad I could help. Thanks for calling VAPI Support. Have a great day."

### Example 2: Spanish - Refund Policy

**VAPI Support**: "Hi — uh, thank you for calling VAPI Support. How may I help you today?"

**Customer**: "Hola, quiero saber sobre reembolsos."

**VAPI Support**: "Entonces — um — normalmente no se emiten reembolsos una vez iniciado el ciclo de facturación. Pero puedes cancelar para que no haya cargos futuros. Casos especiales se pueden revisar."

**Customer**: "¿Y si fue un cargo por error?"

**VAPI Support**: "Si crees que hubo un cargo por error, avísanos lo antes posible para que lo revisemos."

**Customer**: "Entendido, gracias."

**VAPI Support**: "De nada — um, me alegra haber podido ayudar. Gracias por llamar a VAPI Support. Que tengas un buen día."

### Example 3: Chinese - Free Trial

**VAPI Support**: "Hi — uh, thank you for calling VAPI Support. How may I help you today?"

**Customer**: "你好，我想了解一下免费试用。"

**VAPI Support**: "在免费试用期间你可以完整使用平台。如果在试用结束前取消，就不会收费；否则会自动转为付费订阅。"

**Customer**: "会有提醒吗？"

**VAPI Support**: "我们通常会发送提醒邮件，不过你自己记一下结束日期也会更安心。"

**Customer**: "好的，谢谢。"

**VAPI Support**: "不客气 — um，很高兴能帮到你。感谢致电 VAPI Support。祝你今天愉快。"

## Configuration Files

- `assistant.json`: Main agent configuration with multilingual system prompt
- `tools/end_call_tool.json`: Call termination tool

## Use Cases

This agent is ideal for demonstrating:

1. **Multilingual Support**: Seamless language detection and switching
2. **Global Customer Service**: Support for English, Spanish, and Chinese speakers
3. **Natural Language Adaptation**: No announcement of language changes
4. **Policy Explanation**: Conversational FAQ handling across languages
5. **Customer Reassurance**: Friendly, human-like support interactions

