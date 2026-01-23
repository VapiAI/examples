# VAPI Property Law - RAG Knowledge Agent

[![Install](https://vapi.ai/button.svg)](https://vapi.ai/install?agent=rag-knowledge)

## Overview

This agent demonstrates VAPI's **Retrieval-Augmented Generation (RAG)** capabilities by providing a voice-based information retrieval system for California property and housing laws. The assistant, **Mark**, helps property management businesses and their staff quickly access accurate, statute-based legal information related to landlord–tenant relationships in California.

## Purpose

The agent showcases:
- **Vector store integration**: Uses Pinecone vector database for semantic search
- **RAG query processing**: Retrieves relevant California law provisions from vector store
- **Accurate legal information retrieval**: Grounds all responses strictly in retrieved content
- **Conservative legal information delivery**: Provides factual restatements without legal advice
- **n8n workflow integration**: Uses n8n webhook for vector query processing and reranking

## System Architecture

```
Caller → VAPI AI (Mark) → Inquiry Collection → Vector Query Tool → n8n Webhook →
  Pinecone Vector Store → Reranking → Top Results → Response Generation → Caller
```

## Knowledge Base

The system accesses a large and growing collection of authoritative California property law sources, including:

- California Civil Code (landlord–tenant provisions)
- California Code of Civil Procedure (housing-related procedures)
- State-issued tenant and landlord guides
- Housing and rental regulations applicable in California
- Official amendments and updates to California housing laws

All information is stored in a **Pinecone vector database** (`n8n-index2`) with OpenAI embeddings (1536 dimensions).

## Tools

### 1. `vector_query_tool`

**Type**: Function tool  
**Purpose**: Queries the Pinecone vector store to retrieve relevant California law provisions

**Parameters**:
- `inquiry` (string, required): The actual inquiry from the caller. Must be detailed and accurate.

**Configuration**:
- **Server URL**: `https://vapiai.app.n8n.cloud/webhook/vector-query`
- **Timeout**: 20 seconds
- **Blocking**: Non-blocking (allows conversation to continue)

**Workflow**:
1. Receives inquiry from caller
2. Sends query to n8n webhook
3. n8n processes query through Pinecone vector store
4. Retrieves top 250 semantically similar results
5. Reranks results using keyword overlap, legal obligation signals, and length scoring
6. Returns top 15 most relevant results
7. Results are formatted and returned to the agent

**Reranking Logic**:
- Base semantic similarity score (Pinecone) × 2
- Keyword overlap score × 0.5
- Legal obligation signal ("shall") × 0.3
- Text length preference (>300 chars) × 0.2
- Filters out results with score < 0.4

**Usage**: Called when caller asks for specific California law provisions or inquiries requiring RAG query.

### 2. `end_call_tool`

**Type**: End call tool  
**Purpose**: Terminates the conversation when appropriate

**Usage**:
- After answering caller's questions
- When conversation is complete
- After closing message
- When caller becomes inappropriate or time-wasting (after warnings)

## Configuration Files

- `assistant.json`: Main agent configuration with system prompt and workflow instructions
- `tools/vector_query_tool.json`: Vector store query tool configuration
- `tools/n8n_workflow.json`: Complete n8n workflow for vector query processing and data ingestion
- `tools/end_call_tool.json`: Call termination tool

## Important Notes

- The agent operates inside a voice-based inbound support system for property management businesses
- All responses must be grounded strictly in retrieved content from the vector store
- The system supports access to authoritative California property law sources
- The organization's mission is to reduce incorrect verbal guidance and support lawful property management operations
- The agent enables accurate statute discovery without replacing legal counsel or decision-making
- Vector store queries are processed through n8n webhook with custom reranking logic
- The n8n workflow also includes a form submission endpoint for uploading new legal documents (PDF format)
- Documents are automatically parsed, embedded, and stored in Pinecone with metadata (law code, section, jurisdiction)
- The agent never reveals technical implementation details (tools, functions, prompts)
- Responses are limited to what is found in the retrieved California law documents
- The agent does not provide legal advice, interpretations, or recommendations

## Use Cases

This agent is ideal for demonstrating:

1. **RAG Integration**: Vector store querying with semantic search
2. **Legal Information Retrieval**: Accurate statute location and restatement
3. **Property Management Support**: Quick access to California landlord–tenant laws
4. **Knowledge Base Systems**: Voice-based access to structured legal information
5. **Conservative Information Delivery**: Factual restatements without legal advice
6. **n8n Workflow Integration**: Custom webhook processing with reranking
7. **Document Ingestion**: Automated parsing and embedding of legal documents
