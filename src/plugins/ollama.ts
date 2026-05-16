/**
 * Ollama Installer Plugin
 * Run large language models locally
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import {
  InstallerPlugin, EnvironmentInfo, InstallConfig, InstallResult,
  UninstallResult, UpdateResult, DetectionResult, PreInstallResult,
  ApiConfig, PluginStatus,
} from '../core/types';
import { Logger } from '../utils/logger';
import { getInstallDir, run } from '../utils/helpers';

const logger = new Logger('Ollama');

const OllamaPlugin: InstallerPlugin = {
  id: 'ollama',
  name: 'Ollama',
  description: 'Run Llama 3, Gemma 2, Mistral, and other large language models locally',
  version: '1.0.0',
  category: 'local-model',
  tags: ['local', 'llm', 'llama', 'mistral', 'self-hosted', 'privacy'],
  icon: '',
  homepage: 'https://ollama.com',
  repository: 'https://github.com/ollama/ollama.git',
  supportedPlatforms: ['windows', 'linux', 'macos'],
  requiresDocker: false,
  requiresGPU: false,
  localModel: true,
  cloudModel: false,
  defaultPort: 11434,
  defaultApiProviders: ['ollama'],
  dependencies: [],

  async detect(env: EnvironmentInfo): Promise<DetectionResult> {
    try {
      const result = execSync('ollama --version 2>&1', { encoding: 'utf-8', timeout: 5000 });
      const match = result.match(/(\d+\.\d+\.\d+)/);
      return {
        alreadyInstalled: true,
        installedVersion: match ? match[1] : 'unknown',
      };
    } catch {
      return { alreadyInstalled: false };
    }
  },

  async preInstall(env: EnvironmentInfo): Promise<PreInstallResult> {
    return {
      canInstall: true,
      missingDependencies: [],
      warnings: env.hasGPU ? [] : ['No GPU detected. Ollama will run on CPU (slower).'],
      estimatedSize: '~2 GB + models',
      estimatedTime: '2-5 minutes (installer) + model download time',
    };
  },

  async install(env: EnvironmentInfo, config: InstallConfig): Promise<InstallResult> {
    const logs: string[] = [];

    try {
      if (env.platform === 'windows') {
        logs.push('Downloading Ollama for Windows...');
        const url = 'https://ollama.com/download/OllamaSetup.exe';
        const installerPath = path.join(process.env.TEMP || '/tmp', 'OllamaSetup.exe');
        run(`curl -L -o "${installerPath}" "${url}"`, { timeout: 300000 });
        logs.push('Running installer...');
        execSync(`"${installerPath}"`, { timeout: 300000, stdio: 'inherit' });
      } else if (env.platform === 'macos') {
        logs.push('Installing Ollama via Homebrew...');
        run('brew install ollama', { timeout: 300000 });
      } else {
        logs.push('Installing Ollama...');
        run('curl -fsSL https://ollama.com/install.sh | sh', { timeout: 300000 });
      }

      logs.push('Starting Ollama service...');
      try {
        if (env.platform === 'linux') {
          execSync('sudo systemctl start ollama 2>/dev/null || ollama serve &', { timeout: 10000 });
        }
      } catch { /* service may already be running */ }

      // Pull a default model
      logs.push('Pulling default model (llama3.2:3b)...');
      try {
        run('ollama pull llama3.2:3b', { timeout: 600000 });
      } catch {
        logs.push('Model download will continue in background. Run "ollama pull llama3.2:3b" later.');
      }

      return {
        success: true,
        message: 'Ollama installed and running! Run "ollama run llama3.2" to start chatting.',
        logs,
        warnings: [],
        errors: [],
        repairAttempts: 0,
      };
    } catch (err: any) {
      return { success: false, message: err.message, logs, warnings: [], errors: [err.message], repairAttempts: 0 };
    }
  },

  async postInstall(env: EnvironmentInfo, result: InstallResult): Promise<void> {
    if (result.success) {
      logger.success('Ollama is ready!');
      logger.info('  Pull models: ollama pull <model>');
      logger.info('  Run models: ollama run <model>');
      logger.info('  API endpoint: http://localhost:11434');
    }
  },

  async uninstall(env: EnvironmentInfo): Promise<UninstallResult> {
    try {
      if (env.platform === 'macos') {
        run('brew uninstall ollama', { timeout: 60000 });
      } else if (env.platform === 'linux') {
        execSync('sudo systemctl stop ollama 2>/dev/null; sudo rm -f /usr/local/bin/ollama /usr/bin/ollama', { timeout: 30000 });
      } else {
        logger.info('Go to Windows Settings > Apps to uninstall Ollama.');
      }
      return { success: true, message: 'Ollama uninstalled', logs: ['Removed'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async update(env: EnvironmentInfo): Promise<UpdateResult> {
    try {
      if (env.platform === 'macos') {
        run('brew upgrade ollama', { timeout: 300000 });
      } else if (env.platform === 'linux') {
        run('curl -fsSL https://ollama.com/install.sh | sh', { timeout: 300000 });
      } else {
        logger.info('Ollama auto-updates on Windows. Check the system tray icon.');
      }
      return { success: true, message: 'Ollama updated', logs: ['Updated'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async configure(env: EnvironmentInfo, apiConfig: ApiConfig): Promise<void> {
    logger.info('Ollama API is available at http://localhost:11434 by default.');
  },

  async start(env: EnvironmentInfo): Promise<void> {
    if (env.platform === 'linux') {
      execSync('sudo systemctl start ollama || ollama serve &', { timeout: 10000 });
    } else {
      logger.info('Ollama runs as a background service. Check your system tray.');
    }
  },

  async stop(env: EnvironmentInfo): Promise<void> {
    if (env.platform === 'linux') {
      execSync('sudo systemctl stop ollama 2>/dev/null || pkill ollama', { timeout: 10000 });
    } else {
      logger.info('Stop Ollama from the system tray.');
    }
  },

  async status(env: EnvironmentInfo): Promise<PluginStatus> {
    try {
      const result = execSync('curl -s http://localhost:11434/api/tags 2>/dev/null', { encoding: 'utf-8', timeout: 5000 });
      return {
        running: result.length > 0,
        port: 11434,
        health: 'healthy',
      };
    } catch {
      return { running: false, health: 'stopped' };
    }
  },
};

export default OllamaPlugin;
