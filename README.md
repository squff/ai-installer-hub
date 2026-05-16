<div align="center">

# AI Installer Hub

### One-Click Installation for AI Assistants

*Install any AI agent in one command. No technical knowledge required.*

---

[![CI](https://github.com/ai-installer-hub/ai-installer-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/ai-installer-hub/ai-installer-hub/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## What is this?

**AI Installer Hub** lets you install the world's best AI tools with a single command. No Docker knowledge, no Python setup, no environment conflicts.

Think of it like an **App Store for AI assistants**.

---

## Quick Install

### Windows

```powershell
irm https://ai-installer-hub.github.io/install.ps1 | iex
```

### Linux / macOS

```bash
curl -fsSL https://ai-installer-hub.github.io/install.sh | bash
```

That's it. The installer will:
1. Check your system
2. Install missing dependencies (Node.js, Git, Python)
3. Show you a menu of AI tools to choose from

---

## Install a Specific Tool

### Windows

```powershell
# Install Claude Code
irm https://ai-installer-hub.github.io/install.ps1 | iex -Tool claudecode -ApiKey "sk-xxx"

# Install Ollama
irm https://ai-installer-hub.github.io/install.ps1 | iex -Tool ollama
```

### Linux / macOS

```bash
# Install Claude Code
curl -fsSL https://ai-installer-hub.github.io/install.sh | bash -s -- --tool claudecode --api-key "sk-xxx"

# Install Ollama
curl -fsSL https://ai-installer-hub.github.io/install.sh | bash -s -- --tool ollama
```

---

## Available AI Assistants

| Tool | What it does | Cloud | Local | Platforms |
|------|-------------|-------|-------|-----------|
| [**Claude Code**](https://docs.anthropic.com/en/docs/claude-code) | AI coding assistant by Anthropic | Yes | No | Win/Mac/Linux |
| [**Ollama**](https://ollama.com) | Run LLMs on your own computer | No | Yes | Win/Mac/Linux |
| [**Continue**](https://continue.dev) | Open-source AI code assistant for VS Code | Yes | Yes | Win/Mac/Linux |
| [**OpenClaw**](https://github.com/openclaw) | Open-source AI chat assistant | Yes | Yes | Win/Mac/Linux |
| [**Hermes**](https://github.com/NousResearch) | Lightweight AI with conversation memory | Yes | Yes | Win/Mac/Linux |
| [**Roo Code**](https://roocode.com) | AI-powered VS Code fork | Yes | Yes | Win/Mac/Linux |
| [**OpenHands**](https://www.all-hands.dev) | Autonomous AI software engineer | Yes | Yes | Mac/Linux |
| [**AnythingLLM**](https://anythingllm.com) | Chat with your documents (RAG) | Yes | Yes | Win/Mac/Linux |

---

## Tool Descriptions

### Claude Code
Anthropic's official CLI coding assistant. Write, debug, and understand code with Claude AI.

```bash
aihub install claudecode --api-key "sk-ant-xxx"
# Then run: claude
```

### Ollama
Run powerful language models (Llama 3, Mistral, Gemma) entirely on your own computer. No internet needed after download.

```bash
aihub install ollama
# Then run: ollama run llama3.2
```

### Continue
The leading open-source AI code assistant. Works as a VS Code extension with support for any AI provider.

```bash
aihub install continue --provider openai --api-key "sk-xxx"
```

### OpenClaw
An open-source AI assistant with multi-model support and tool integration capabilities.

```bash
aihub install openclaw
# Access at http://localhost:3000
```

### Hermes
A lightweight AI assistant focused on conversation memory and local-first privacy.

```bash
aihub install hermes --provider ollama
```

### Roo Code
An AI-powered VS Code fork with a built-in coding assistant supporting multiple AI providers.

```bash
aihub install roocode
# Launch from your applications menu
```

### OpenHands
An autonomous AI software engineering agent that can write, debug, and deploy code. Requires Docker.

```bash
aihub install openhands
# Access at http://localhost:3000
```

### AnythingLLM
An all-in-one desktop application to chat with your documents. Supports RAG (Retrieval-Augmented Generation).

```bash
aihub install anythingllm
# Launch from your applications menu
```

---

## Managing Tools

```bash
# List all available tools
aihub list

# Check what's installed
aihub status

# Update a tool
aihub update ollama

# Uninstall a tool
aihub uninstall ollama

# Run system diagnostics
aihub doctor

# Configure API keys
aihub config set openai sk-xxx
aihub config set claude sk-ant-xxx
aihub config list
```

---

## API Configuration

AI Installer Hub supports these API providers:

| Provider | Best for | Get API Key |
|----------|---------|-------------|
| OpenAI | GPT-4, GPT-4o | [platform.openai.com](https://platform.openai.com) |
| Anthropic | Claude Sonnet/Opus | [console.anthropic.com](https://console.anthropic.com) |
| DeepSeek | DeepSeek models | [platform.deepseek.com](https://platform.deepseek.com) |
| Google | Gemini models | [aistudio.google.com](https://aistudio.google.com) |
| OpenRouter | Access 100+ models | [openrouter.ai](https://openrouter.ai) |
| Ollama | Local models (free) | No key needed |
| Xiaomi | MiMo models | [api.xiaomi.com](https://api.xiaomi.com) |

Set up your API keys:

```bash
aihub config set openai "sk-xxx"
aihub config set claude "sk-ant-xxx"
aihub config test openai
```

---

## System Requirements

- **Windows:** Windows 10/11
- **macOS:** macOS 12+
- **Linux:** Ubuntu 20.04+, Fedora 36+, Arch, etc.
- **Disk space:** 1-5 GB per tool
- **RAM:** 8 GB minimum (16 GB recommended for local models)

The installer automatically handles:
- Node.js installation
- Python installation
- Git installation
- PATH configuration
- Permission issues

---

## Architecture

```
ai-installer-hub/
  src/
    core/              # Core framework
      types.ts         # Type definitions
      env-detector.ts  # System detection
      plugin-manager.ts # Plugin lifecycle
      dependency-installer.ts # Auto dependency install
      api-config.ts    # API key management
      auto-repair.ts   # Smart error recovery
      mirror-manager.ts # Download mirror selection
    plugins/           # AI tool installers
      openclaw.ts
      hermes.ts
      claudecode.ts
      roocode.ts
      openhands.ts
      continue.ts
      ollama.ts
      anythingllm.ts
    utils/             # Utilities
      logger.ts
      helpers.ts
  scripts/             # Cross-platform entry scripts
    install.ps1        # Windows one-click installer
    install.sh         # Linux/macOS one-click installer
    update.sh          # Update manager
    uninstall.ps1      # Windows uninstaller
  installers/          # Per-tool standalone scripts
    openclaw/
    hermes/
    claudecode/
    ...
  .github/workflows/   # CI/CD automation
    ci.yml             # Tests & lint
    release.yml        # Auto release
    compatibility.yml  # Multi-platform testing
```

---

## Plugin Development

Want to add a new AI tool? It's easy!

1. Create a new file in `src/plugins/`
2. Implement the `InstallerPlugin` interface
3. Add the installer scripts in `installers/<tool-name>/`
4. Submit a PR

See [PLUGIN_DEVELOPMENT.md](docs/PLUGIN_DEVELOPMENT.md) for full details.

---

## For Developers

```bash
# Clone the repo
git clone https://github.com/ai-installer-hub/ai-installer-hub.git
cd ai-installer-hub

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the CLI
node dist/index.js list
node dist/index.js doctor

# Run tests
npm test

# Lint
npm run lint
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

Areas we need help with:
- Adding more AI tool installers
- Testing on different Linux distributions
- Translating documentation
- Improving error messages

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**AI Agent Era's Unified Installation Platform**

*No technical knowledge required. One command. Done.*

</div>
