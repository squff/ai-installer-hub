#!/usr/bin/env node
/**
 * AI Installer Hub - Main CLI Entry Point
 * One-click installation for AI assistants
 */

import { EnvironmentDetector } from './core/env-detector';
import { PluginManager } from './core/plugin-manager';
import { ApiConfigManager } from './core/api-config';
import { AutoRepair } from './core/auto-repair';
import { MirrorManager } from './core/mirror-manager';
import { Logger } from './utils/logger';
import * as path from 'path';

const logger = new Logger('CLI');
const VERSION = '1.0.0';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  logger.banner(`AI Installer Hub v${VERSION}`);
  console.log('');

  switch (command) {
    case 'install':
      await handleInstall(args[1], args.slice(2));
      break;
    case 'uninstall':
      await handleUninstall(args[1]);
      break;
    case 'update':
      await handleUpdate(args[1]);
      break;
    case 'list':
      await handleList();
      break;
    case 'search':
      await handleSearch(args.slice(1).join(' '));
      break;
    case 'status':
      await handleStatus(args[1]);
      break;
    case 'config':
      await handleConfig(args.slice(1));
      break;
    case 'doctor':
      await handleDoctor();
      break;
    case 'version':
    case '--version':
    case '-v':
      console.log(`ai-installer-hub v${VERSION}`);
      break;
    case 'help':
    case '--help':
    case '-h':
    default:
      showHelp();
      break;
  }
}

async function handleInstall(toolId?: string, flags: string[] = []): Promise<void> {
  if (!toolId) {
    logger.error('Please specify a tool to install. Run "aihub list" to see available tools.');
    return;
  }

  const detector = new EnvironmentDetector();
  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  const autoRepair = new AutoRepair();
  const mirrorManager = new MirrorManager();

  // Load plugins
  await pluginManager.loadPlugins();

  // Detect environment
  logger.info('Detecting system environment...');
  const env = await detector.detect();

  logger.info(`Platform: ${env.platform} (${env.arch})`);
  logger.info(`Node.js: ${env.nodeVersion || 'Not found'}`);
  logger.info(`Python: ${env.pythonVersion || 'Not found'}`);
  logger.info(`Git: ${env.gitVersion || 'Not found'}`);
  logger.info(`Docker: ${env.hasDocker ? 'Yes' : 'No'}`);
  logger.info(`GPU: ${env.gpuType || 'None'} (CUDA: ${env.hasCUDA ? 'Yes' : 'No'})`);
  console.log('');

  // Auto-detect best mirrors
  await mirrorManager.detectBestMirror();

  // Parse config from flags
  const config: any = {};
  for (let i = 0; i < flags.length; i++) {
    if (flags[i] === '--api-key' && flags[i + 1]) {
      config.apiConfig = { apiKey: flags[i + 1] };
      i++;
    } else if (flags[i] === '--provider' && flags[i + 1]) {
      config.apiConfig = { ...config.apiConfig, provider: flags[i + 1] };
      i++;
    } else if (flags[i] === '--model' && flags[i + 1]) {
      config.apiConfig = { ...config.apiConfig, model: flags[i + 1] };
      i++;
    } else if (flags[i] === '--port' && flags[i + 1]) {
      config.port = parseInt(flags[i + 1]);
      i++;
    } else if (flags[i] === '--dir' && flags[i + 1]) {
      config.installDir = flags[i + 1];
      i++;
    }
  }

  // Install with auto-repair
  try {
    const result = await pluginManager.installPlugin(toolId, env, config);
    if (result.success) {
      console.log('');
      logger.success(result.message);
    } else {
      console.log('');
      logger.fail(result.message);

      // Try auto-repair
      if (result.errors?.length) {
        logger.info('Attempting auto-repair...');
        const repair = await autoRepair.autoRepair(
          result.errors.join('; '),
          env,
          async () => {
            const r = await pluginManager.installPlugin(toolId, env, config);
            return r.success;
          }
        );
        if (repair.fixed) {
          logger.success('Auto-repair fixed the issue!');
        } else {
          logger.error('Auto-repair could not fix the issue. Check logs for details.');
        }
      }
    }
  } catch (err: any) {
    logger.error(`Installation failed: ${err.message}`);
  }
}

async function handleUninstall(toolId?: string): Promise<void> {
  if (!toolId) {
    logger.error('Please specify a tool to uninstall.');
    return;
  }

  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  await pluginManager.loadPlugins();

  const detector = new EnvironmentDetector();
  const env = await detector.detect();

  try {
    const result = await pluginManager.uninstallPlugin(toolId, env);
    if (result.success) {
      logger.success(result.message);
    } else {
      logger.fail(result.message);
    }
  } catch (err: any) {
    logger.error(`Uninstall failed: ${err.message}`);
  }
}

async function handleUpdate(toolId?: string): Promise<void> {
  if (!toolId) {
    logger.error('Please specify a tool to update.');
    return;
  }

  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  await pluginManager.loadPlugins();

  const detector = new EnvironmentDetector();
  const env = await detector.detect();

  try {
    const result = await pluginManager.updatePlugin(toolId, env);
    if (result.success) {
      logger.success(result.message);
    } else {
      logger.fail(result.message);
    }
  } catch (err: any) {
    logger.error(`Update failed: ${err.message}`);
  }
}

async function handleList(): Promise<void> {
  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  await pluginManager.loadPlugins();

  const plugins = pluginManager.listPlugins();
  console.log('Available AI Assistants:\n');

  const categories = new Map<string, typeof plugins>();
  for (const p of plugins) {
    const cat = categories.get(p.category) || [];
    cat.push(p);
    categories.set(p.category, cat);
  }

  for (const [category, tools] of categories) {
    console.log(`  ${category.toUpperCase().replace('-', ' ')}`);
    for (const p of tools) {
      const platforms = p.supportedPlatforms.map((pl) => {
        if (pl === 'windows') return 'Win';
        if (pl === 'macos') return 'Mac';
        return 'Linux';
      }).join(', ');
      const models = [
        p.localModel ? 'Local' : '',
        p.cloudModel ? 'Cloud' : '',
      ].filter(Boolean).join('+');

      console.log(`    ${p.name.padEnd(20)} ${p.description.slice(0, 50)}`);
      console.log(`    ${''.padEnd(20)} ID: ${p.id} | Platforms: ${platforms} | ${models}`);
      console.log('');
    }
  }

  console.log('Install:  aihub install <id>');
  console.log('Help:     aihub help');
}

async function handleSearch(query: string): Promise<void> {
  if (!query) {
    logger.error('Please provide a search query.');
    return;
  }

  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  await pluginManager.loadPlugins();

  const results = pluginManager.searchPlugins(query);
  if (results.length === 0) {
    logger.info(`No results found for "${query}"`);
    return;
  }

  console.log(`Search results for "${query}":\n`);
  for (const p of results) {
    console.log(`  ${p.name} (${p.id})`);
    console.log(`    ${p.description}`);
    console.log(`    Platforms: ${p.supportedPlatforms.join(', ')}`);
    console.log('');
  }
}

async function handleStatus(toolId?: string): Promise<void> {
  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  await pluginManager.loadPlugins();

  const detector = new EnvironmentDetector();
  const env = await detector.detect();

  if (toolId) {
    const plugin = pluginManager.getPlugin(toolId);
    if (!plugin) {
      logger.error(`Unknown tool: ${toolId}`);
      return;
    }
    const status = await plugin.status(env);
    console.log(`${plugin.name}:`);
    console.log(`  Running:  ${status.running}`);
    console.log(`  Health:   ${status.health}`);
    if (status.version) console.log(`  Version:  ${status.version}`);
    if (status.port) console.log(`  Port:     ${status.port}`);
  } else {
    console.log('Status of all tools:\n');
    for (const plugin of pluginManager.listPlugins()) {
      const status = await plugin.status(env);
      const icon = status.health === 'healthy' ? '[+]' : '[-]';
      console.log(`  ${icon} ${plugin.name.padEnd(20)} ${status.health}`);
    }
  }
}

async function handleConfig(args: string[]): Promise<void> {
  const apiManager = new ApiConfigManager();
  const subCommand = args[0];

  switch (subCommand) {
    case 'list':
      console.log('Available API providers:\n');
      for (const p of apiManager.listProviders()) {
        console.log(`  ${p.displayName.padEnd(25)} (${p.name})`);
        console.log(`    Models: ${p.models.join(', ')}`);
        console.log('');
      }
      break;

    case 'set': {
      const provider = args[1];
      const apiKey = args[2];
      if (!provider || !apiKey) {
        logger.error('Usage: aihub config set <provider> <api-key>');
        return;
      }
      await apiManager.saveConfig({ provider, apiKey });
      logger.success(`API key saved for ${provider}`);
      break;
    }

    case 'test': {
      const provider = args[1];
      if (!provider) {
        logger.error('Usage: aihub config test <provider>');
        return;
      }
      const ok = await apiManager.testConnection(provider);
      if (ok) {
        logger.success(`${provider} connection OK`);
      } else {
        logger.fail(`${provider} connection failed`);
      }
      break;
    }

    default:
      console.log('API Configuration:\n');
      console.log('  aihub config list              List available API providers');
      console.log('  aihub config set <prov> <key>  Set API key for a provider');
      console.log('  aihub config test <prov>       Test connection to a provider');
      break;
  }
}

async function handleDoctor(): Promise<void> {
  const detector = new EnvironmentDetector();

  logger.info('Running system diagnostics...\n');
  const env = await detector.detect();

  console.log('System Information:');
  console.log(`  Platform:     ${env.platform}`);
  console.log(`  Architecture: ${env.arch}`);
  console.log(`  OS Version:   ${env.osVersion}`);
  console.log(`  Shell:        ${env.shellType}`);
  console.log(`  Home Dir:     ${env.homeDir}`);
  console.log(`  Install Dir:  ${env.installDir}`);
  console.log(`  Admin:        ${env.isAdmin ? 'Yes' : 'No'}`);
  console.log('');

  console.log('Dependencies:');
  const checks = [
    { name: 'Node.js', ok: env.hasNode, version: env.nodeVersion },
    { name: 'Python', ok: env.hasPython, version: env.pythonVersion },
    { name: 'Git', ok: env.hasGit, version: env.gitVersion },
    { name: 'Docker', ok: env.hasDocker, version: null },
    { name: 'WSL', ok: env.hasWSL, version: null },
    { name: 'Chrome', ok: env.hasChrome, version: null },
    { name: 'GPU', ok: env.hasGPU, version: env.gpuType },
    { name: 'CUDA', ok: env.hasCUDA, version: null },
  ];

  for (const check of checks) {
    const icon = check.ok ? '[+]' : '[-]';
    const version = check.version ? ` (${check.version})` : '';
    console.log(`  ${icon} ${check.name.padEnd(15)} ${check.ok ? 'OK' : 'Not found'}${version}`);
  }

  if (env.conflicts.length > 0) {
    console.log('\nPort Conflicts:');
    for (const conflict of env.conflicts) {
      console.log(`  [!] Port ${conflict.port} is in use`);
    }
  }

  console.log('\nAll AI tools should work on this system.');
}

function showHelp(): void {
  console.log(`
Usage: aihub <command> [options]

Commands:
  install <id> [--api-key KEY] [--provider PROV] [--model MODEL]
                Install an AI assistant
  uninstall <id>              Uninstall an AI assistant
  update <id>                 Update an AI assistant
  list                        List all available AI assistants
  search <query>              Search for AI assistants
  status [id]                 Show status of installed tools
  config <subcommand>         Manage API configurations
  doctor                      Run system diagnostics
  version                     Show version

Examples:
  aihub install claudecode --api-key sk-xxx --provider claude
  aihub install ollama
  aihub install openclaw --provider openai --model gpt-4o
  aihub list
  aihub doctor
  aihub config set openai sk-xxx

Quick Install (no CLI needed):
  Windows:  irm https://aihub.dev/install.ps1 | iex
  Linux:    curl -fsSL https://aihub.dev/install.sh | bash
  macOS:    curl -fsSL https://aihub.dev/install.sh | bash
`);
}

main().catch((err) => {
  logger.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
