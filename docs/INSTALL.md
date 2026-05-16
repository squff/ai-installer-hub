# Installation Guide

## One-Click Install (Recommended)

### Windows

Open PowerShell and run:

```powershell
irm https://ai-installer-hub.github.io/install.ps1 | iex
```

The script will:
1. Check your system
2. Install Node.js, Git, and Python if needed
3. Show a menu of AI tools to install

### Linux / macOS

Open Terminal and run:

```bash
curl -fsSL https://ai-installer-hub.github.io/install.sh | bash
```

## Install a Specific Tool

### Windows

```powershell
# Install Claude Code with API key
irm https://ai-installer-hub.github.io/install.ps1 | iex -Tool claudecode -ApiKey "sk-ant-xxx"

# Install Ollama (local models, no API key needed)
irm https://ai-installer-hub.github.io/install.ps1 | iex -Tool ollama

# Install Continue extension for VS Code
irm https://ai-installer-hub.github.io/install.ps1 | iex -Tool continue
```

### Linux / macOS

```bash
# Install Claude Code with API key
curl -fsSL https://ai-installer-hub.github.io/install.sh | bash -s -- --tool claudecode --api-key "sk-ant-xxx"

# Install Ollama
curl -fsSL https://ai-installer-hub.github.io/install.sh | bash -s -- --tool ollama
```

## Install via npm (CLI tool)

```bash
npm install -g ai-installer-hub
aihub install ollama
aihub list
```

## Manual Install

```bash
git clone https://github.com/ai-installer-hub/ai-installer-hub.git
cd ai-installer-hub
npm install
npm run build

# Use directly
node dist/index.js install ollama
node dist/index.js list
```

## Uninstall

### Windows

```powershell
# Remove a specific tool
irm https://ai-installer-hub.github.io/uninstall.ps1 | iex -Tool ollama

# Remove everything
irm https://ai-installer-hub.github.io/uninstall.ps1 | iex -All
```

### Linux / macOS

```bash
# Remove a specific tool
rm -rf ~/.ai-installer-hub/tools/<tool-name>

# Remove everything
rm -rf ~/.ai-installer-hub
```

## Troubleshooting

### Permission denied on Linux/macOS

```bash
sudo chmod +x install.sh
sudo bash install.sh
```

### PowerShell execution policy on Windows

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Node.js not found after install

Restart your terminal. If still not found:

**Windows:** Check `C:\Program Files\nodejs` is in your PATH.

**Linux/macOS:** Add to your shell config:
```bash
export PATH="$PATH:/usr/local/bin"
```

### Network issues / slow download

The installer automatically detects your region and uses the fastest mirror. If downloads are still slow:

```bash
# Use China mirrors manually
npm config set registry https://registry.npmmirror.com
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple/
```
