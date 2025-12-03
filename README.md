<h1><div align="center">
  <img alt="vapi" width="200px" height="auto" src="https://vapi.ai/brand/img/full-logo-square-3.svg">
  <br><br>
  Vapi Examples
</div></h1>

<p align="center">
  <strong>Production-ready voice AI assistants you can import, customize, and deploy</strong>
</p>

<p align="center">
  <a href="https://docs.vapi.ai/quickstart/introduction"><img src="https://img.shields.io/badge/Documentation-blue" alt="Docs"></a>
  <a href="https://discord.com/invite/pUFNcf2WmH"><img src="https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://docs.vapi.ai/api-reference"><img src="https://img.shields.io/badge/API_Reference-green" alt="API Reference"></a>
  <a href="https://docs.vapi.ai/cli"><img src="https://img.shields.io/badge/CLI-orange" alt="CLI"></a>
</p>

---

A collection of example assistants, squads, and tooling built with [Vapi](https://vapi.ai) — the platform for building voice AI agents. These examples are curated by Vapi forward-deployed engineers and follow best practices for production deployments.

## New to Vapi?

Get started with the [Quickstart Guide](https://docs.vapi.ai/quickstart/introduction) to build your first voice assistant in minutes.

Then explore:

- **[Dashboard](https://dashboard.vapi.ai/)** — Sign up and manage your assistants
- **[API Reference](https://docs.vapi.ai/api-reference)** — Full API documentation
- **[SDKs](https://docs.vapi.ai/resources)** — Client libraries for Web, Python, and more
- **[CLI](https://docs.vapi.ai/cli)** — Command-line tools for development

Once you understand the basics, import these examples into your organization and customize them for your use case.

## Quick Start

### 1. Sign Up

Create a free account at [dashboard.vapi.ai](https://dashboard.vapi.ai/).

### 2. Choose an Example

Browse the examples below and pick one that matches your use case.

### 3. Import & Customize

Each example includes ready-to-use configurations. Import the assistant JSON into your Vapi dashboard, customize the prompts and tools, and you're ready to go.

---

## Examples

### **AI Assistants**

Production-ready voice assistants for various industries and use cases.

| Example | Description | Key Features |
|---------|-------------|--------------|
| **[Healthcare Booking](assistants/vapi_health_complex_booking/)** | AI receptionist for medical clinics with full appointment management | Booking, rescheduling, cancellation, cal.com integration, n8n workflows |
| **[RAG Intent Router](assistants/rag-intent-transfer/)** | Intent-based call routing with retrieval-augmented instructions | Dynamic instructions, multi-intent handling, live agent transfer |

---

## Infrastructure & Tooling

### **GitOps for Vapi**

Manage your Vapi resources (Assistants, Tools, Structured Outputs) via Git using YAML as the source of truth. Get full version control, code review, and environment management for your voice AI infrastructure.

**Key Benefits:**
- 🔄 Full git history with blame and rollback
- 👀 PR review before changes go live
- 🌍 Environment parity (dev, staging, prod)
- 🤝 Team collaboration with branching
- 🔁 CI/CD automation ready

**Currently Supports:**
- ✅ Assistants
- ✅ Tools
- ✅ Structured Outputs

📁 [View GitOps →](gitops/)

---

## Example Structure

Each example follows a consistent structure:

```
example-name/
├── README.md              # Detailed documentation
├── assistant.json         # Vapi assistant configuration
├── assistant_request.json # Sample webhook response payload
├── tools/                 # Tool definitions (API requests, functions)
└── recordings/            # Sample audio or demos (if applicable)
```

---

## Contributing

We welcome contributions! If you've built a great Vapi assistant, consider submitting it:

1. Fork this repository
2. Add your example following the structure above
3. Include a detailed README with setup instructions
4. Submit a pull request

---

## Getting Help

- **Documentation**: [docs.vapi.ai](https://docs.vapi.ai/quickstart/introduction)
- **API Reference**: [docs.vapi.ai/api-reference](https://docs.vapi.ai/api-reference)
- **Discord Community**: [Join Discord](https://discord.com/invite/pUFNcf2WmH)
- **SDKs & Resources**: [docs.vapi.ai/resources](https://docs.vapi.ai/resources)
- **Issues**: Report bugs or request examples in [GitHub Issues](https://github.com/VapiAI/examples/issues)

---

