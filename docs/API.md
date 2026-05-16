# API Reference

## CLI Commands

### `aihub install <tool> [options]`

Install an AI assistant.

**Options:**
- `--api-key <key>` - API key for the service
- `--provider <name>` - API provider (openai, claude, deepseek, etc.)
- `--model <name>` - Model to use
- `--port <number>` - Custom port
- `--dir <path>` - Custom installation directory

**Examples:**
```bash
aihub install ollama
aihub install claudecode --api-key sk-ant-xxx
aihub install openclaw --provider openai --model gpt-4o
```

### `aihub uninstall <tool>`

Uninstall an AI assistant.

```bash
aihub uninstall ollama
```

### `aihub update <tool>`

Update an AI assistant to the latest version.

```bash
aihub update ollama
```

### `aihub list`

List all available AI assistants.

### `aihub search <query>`

Search for AI assistants by name, description, or tags.

```bash
aihub search coding
aihub search local
```

### `aihub status [tool]`

Show status of installed tools. If no tool specified, shows all.

```bash
aihub status
aihub status ollama
```

### `aihub config <subcommand>`

Manage API configurations.

**Subcommands:**
- `aihub config list` - List available API providers
- `aihub config set <provider> <key>` - Set API key
- `aihub config test <provider>` - Test connection

### `aihub doctor`

Run system diagnostics. Checks all dependencies and system capabilities.

### `aihub version`

Show version information.

## TypeScript API

### EnvironmentDetector

```typescript
import { EnvironmentDetector } from './core/env-detector';

const detector = new EnvironmentDetector();
const env = await detector.detect();

console.log(env.platform);     // 'windows' | 'linux' | 'macos'
console.log(env.hasNode);      // boolean
console.log(env.hasPython);    // boolean
console.log(env.hasDocker);    // boolean
console.log(env.hasGPU);       // boolean
```

### PluginManager

```typescript
import { PluginManager } from './core/plugin-manager';

const manager = new PluginManager('./installers');
await manager.loadPlugins();

// List all plugins
const plugins = manager.listPlugins();

// Get specific plugin
const ollama = manager.getPlugin('ollama');

// Install
await manager.installPlugin('ollama', env, { autoStart: true });

// Uninstall
await manager.uninstallPlugin('ollama', env);
```

### ApiConfigManager

```typescript
import { ApiConfigManager } from './core/api-config';

const api = new ApiConfigManager();

// List providers
const providers = api.listProviders();

// Save config
await api.saveConfig({
  provider: 'openai',
  apiKey: 'sk-xxx',
  model: 'gpt-4o',
});

// Test connection
const ok = await api.testConnection('openai');

// Export .env file
await api.exportEnvFile('.env', ['openai', 'claude']);
```

### AutoRepair

```typescript
import { AutoRepair } from './core/auto-repair';

const repair = new AutoRepair();

// Diagnose an error
const actions = await repair.diagnose(errorString, env);

// Auto-repair with retry
const result = await repair.autoRepair(
  errorString,
  env,
  async () => { /* retry original operation */ return true; }
);
```

## Plugin Interface

See [PLUGIN_DEVELOPMENT.md](PLUGIN_DEVELOPMENT.md) for the full `InstallerPlugin` interface.

## Environment Info

The `EnvironmentInfo` object contains all detected system information:

```typescript
interface EnvironmentInfo {
  platform: 'windows' | 'linux' | 'macos';
  arch: 'x64' | 'arm64' | 'arm';
  osVersion: string;
  hasWSL: boolean;
  hasDocker: boolean;
  hasPython: boolean;
  pythonVersion: string | null;
  hasNode: boolean;
  nodeVersion: string | null;
  hasGit: boolean;
  gitVersion: string | null;
  hasChrome: boolean;
  hasGPU: boolean;
  gpuType: string | null;
  hasCUDA: boolean;
  homeDir: string;
  installDir: string;
  shellType: string;
  isAdmin: boolean;
  freePort: number;
  conflicts: PortConflict[];
}
```
