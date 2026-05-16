# Plugin Development Guide

This guide shows you how to add a new AI tool to the AI Installer Hub.

## Quick Start

1. Create `src/plugins/my-tool.ts`
2. Create `installers/my-tool/install.sh` and `install.ps1`
3. Add it to `src/core/plugin-manager.ts`
4. Test and submit a PR

## Plugin Interface

Every plugin must implement the `InstallerPlugin` interface:

```typescript
import { InstallerPlugin } from '../core/types';

const MyToolPlugin: InstallerPlugin = {
  // Required metadata
  id: 'my-tool',                    // Unique ID (lowercase, hyphenated)
  name: 'My Tool',                  // Display name
  description: 'A cool AI tool',    // Short description
  version: '1.0.0',
  category: 'coding-assistant',     // See categories below
  tags: ['coding', 'ai'],          // Search tags
  icon: '',                         // Icon URL (optional)
  homepage: 'https://example.com',
  repository: 'https://github.com/user/repo.git',

  // Platform support
  supportedPlatforms: ['windows', 'linux', 'macos'],
  requiresDocker: false,
  requiresGPU: false,
  localModel: false,
  cloudModel: true,

  // Network config
  defaultPort: 3000,
  defaultApiProviders: ['openai', 'claude'],

  // Dependencies
  dependencies: [
    {
      name: 'Node.js',
      required: true,
      verifyCommand: 'node --version',
      installCommand: {},
    },
  ],

  // Methods
  async detect(env) { ... },
  async preInstall(env) { ... },
  async install(env, config) { ... },
  async postInstall(env, result) { ... },
  async uninstall(env) { ... },
  async update(env) { ... },
  async configure(env, apiConfig) { ... },
  async start(env) { ... },
  async stop(env) { ... },
  async status(env) { ... },
};

export default MyToolPlugin;
```

## Categories

- `coding-assistant` - AI coding tools (Claude Code, Continue)
- `chat-agent` - Chat/conversation AI (OpenClaw, Hermes)
- `automation` - Autonomous agents (OpenHands)
- `local-model` - Local model runners (Ollama)
- `knowledge-base` - Document/RAG tools (AnythingLLM)
- `dev-tools` - Developer utilities

## Method Details

### detect(env)
Check if the tool is already installed. Return detection result.

```typescript
async detect(env: EnvironmentInfo): Promise<DetectionResult> {
  try {
    const result = execSync('mytool --version', { encoding: 'utf-8' });
    return { alreadyInstalled: true, installedVersion: result.trim() };
  } catch {
    return { alreadyInstalled: false };
  }
}
```

### preInstall(env)
Check if installation is possible. List missing dependencies.

### install(env, config)
Perform the actual installation. Return success/failure with logs.

### postInstall(env, result)
Create startup scripts, shortcuts, etc.

### uninstall(env)
Remove the tool completely.

### update(env)
Update to the latest version.

### configure(env, apiConfig)
Set up API keys and configuration.

### start(env) / stop(env)
Start/stop the service (if applicable).

### status(env)
Report running status, health, version, etc.

## Standalone Installer Scripts

Each tool needs standalone scripts in `installers/<tool-id>/`:

### install.sh (Linux/macOS)
```bash
#!/usr/bin/env bash
set -e
echo "Installing My Tool..."
# Installation commands here
echo "Done!"
```

### install.ps1 (Windows)
```powershell
Write-Host "Installing My Tool..."
# Installation commands here
Write-Host "Done!"
```

## Testing Your Plugin

```bash
# Build
npm run build

# Test detection
node dist/index.js doctor

# Test install
node dist/index.js install my-tool

# Test status
node dist/index.js status my-tool

# Test uninstall
node dist/index.js uninstall my-tool
```

## Example: Simple npm-based tool

```typescript
import { InstallerPlugin, EnvironmentInfo, InstallConfig, InstallResult, DetectionResult } from '../core/types';
import { run } from '../utils/helpers';

const SimplePlugin: InstallerPlugin = {
  id: 'simple-tool',
  name: 'Simple Tool',
  description: 'A simple npm-based tool',
  version: '1.0.0',
  category: 'coding-assistant',
  tags: ['simple'],
  icon: '',
  homepage: 'https://example.com',
  repository: 'https://github.com/example/tool.git',
  supportedPlatforms: ['windows', 'linux', 'macos'],
  requiresDocker: false,
  requiresGPU: false,
  localModel: false,
  cloudModel: true,
  defaultPort: 0,
  defaultApiProviders: ['openai'],
  dependencies: [
    { name: 'Node.js', required: true, verifyCommand: 'node --version' },
  ],

  async detect() {
    try {
      run('simple-tool --version');
      return { alreadyInstalled: true };
    } catch {
      return { alreadyInstalled: false };
    }
  },

  async preInstall() {
    return { canInstall: true, missingDependencies: [], warnings: [], estimatedSize: '50 MB', estimatedTime: '1 min' };
  },

  async install(env: EnvironmentInfo, config: InstallConfig): Promise<InstallResult> {
    run('npm install -g simple-tool');
    return {
      success: true,
      message: 'Simple Tool installed!',
      logs: ['Installed via npm'],
      warnings: [], errors: [], repairAttempts: 0,
    };
  },

  async postInstall() {},
  async uninstall() { run('npm uninstall -g simple-tool'); return { success: true, message: 'Removed', logs: [] }; },
  async update() { run('npm update -g simple-tool'); return { success: true, message: 'Updated', logs: [] }; },
  async configure() {},
  async start() {},
  async stop() {},
  async status() { return { running: false, health: 'stopped' }; },
};

export default SimplePlugin;
```

## Submitting Your Plugin

1. Fork the repository
2. Create a branch: `git checkout -b add-my-tool`
3. Add your plugin files
4. Run tests: `npm test`
5. Submit a PR with:
   - Tool name and description
   - Why it should be included
   - Screenshots (if applicable)
   - Test results on your platform
