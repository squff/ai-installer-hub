/**
 * OpenHands Installer Plugin
 * AI software engineering agent (formerly OpenDevin)
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
import { ensureDir, getInstallDir, run } from '../utils/helpers';

const logger = new Logger('OpenHands');

const OpenHandsPlugin: InstallerPlugin = {
  id: 'openhands',
  name: 'OpenHands',
  description: 'AI software engineering agent that can write, debug, and deploy code autonomously',
  version: '1.0.0',
  category: 'automation',
  tags: ['agent', 'autonomous', 'coding', 'devops', 'software-engineering'],
  icon: '',
  homepage: 'https://www.all-hands.dev',
  repository: 'https://github.com/All-Hands-AI/OpenHands.git',
  supportedPlatforms: ['linux', 'macos'],
  requiresDocker: true,
  requiresGPU: false,
  localModel: true,
  cloudModel: true,
  defaultPort: 3000,
  defaultApiProviders: ['openai', 'claude', 'deepseek'],
  dependencies: [
    { name: 'Docker', required: true, verifyCommand: 'docker --version', installCommand: {} },
    { name: 'Git', required: true, verifyCommand: 'git --version', installCommand: {} },
  ],

  async detect(env: EnvironmentInfo): Promise<DetectionResult> {
    try {
      const result = execSync('docker ps --filter name=openhands 2>/dev/null', { encoding: 'utf-8', timeout: 10000 });
      if (result.includes('openhands')) {
        return { alreadyInstalled: true };
      }
    } catch { /* not running */ }
    return { alreadyInstalled: false };
  },

  async preInstall(env: EnvironmentInfo): Promise<PreInstallResult> {
    const missing = [];
    if (!env.hasDocker) missing.push({ name: 'Docker', required: true, verifyCommand: 'docker --version' });
    if (env.platform === 'windows') {
      return {
        canInstall: false,
        missingDependencies: missing,
        warnings: ['OpenHands requires Docker. On Windows, install Docker Desktop with WSL2 backend first.'],
        estimatedSize: '~5 GB',
        estimatedTime: '5-15 minutes',
      };
    }
    return {
      canInstall: missing.length === 0,
      missingDependencies: missing,
      warnings: [],
      estimatedSize: '~5 GB',
      estimatedTime: '5-15 minutes',
    };
  },

  async install(env: EnvironmentInfo, config: InstallConfig): Promise<InstallResult> {
    const logs: string[] = [];

    try {
      logs.push('Pulling OpenHands Docker image...');
      run('docker pull docker.all-hands.dev/all-hands-ai/runtime:latest', { timeout: 600000 });

      const apiKey = config.apiConfig?.apiKey || '';
      const model = config.apiConfig?.model || 'claude-sonnet-4-6';
      const provider = config.apiConfig?.provider || 'anthropic';

      logs.push('Starting OpenHands container...');
      const dockerCmd = [
        'docker run -d --pull=always',
        '--name openhands',
        '-e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:latest',
        `-e LLM_API_KEY=${apiKey}`,
        `-e LLM=${provider}/${model}`,
        '-v /var/run/docker.sock:/var/run/docker.sock',
        '-v ~/.openhands:/.openhands',
        '-p 3000:3000',
        '--add-host host.docker.internal:host-gateway',
        'docker.all-hands.dev/all-hands-ai/openhands:latest',
      ].join(' ');

      run(dockerCmd, { timeout: 120000 });

      return {
        success: true,
        message: 'OpenHands installed and running! Access at http://localhost:3000',
        installedPath: '~/.openhands',
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
      logger.success('OpenHands is running at http://localhost:3000');
      logger.info('Data is stored in ~/.openhands');
    }
  },

  async uninstall(env: EnvironmentInfo): Promise<UninstallResult> {
    try {
      execSync('docker stop openhands 2>/dev/null; docker rm openhands 2>/dev/null', { timeout: 30000 });
      const dataDir = path.join(env.homeDir, '.openhands');
      if (fs.existsSync(dataDir)) fs.rmSync(dataDir, { recursive: true, force: true });
      return { success: true, message: 'OpenHands uninstalled', logs: ['Stopped and removed container'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async update(env: EnvironmentInfo): Promise<UpdateResult> {
    try {
      execSync('docker stop openhands 2>/dev/null; docker rm openhands 2>/dev/null', { timeout: 30000 });
      run('docker pull docker.all-hands.dev/all-hands-ai/openhands:latest', { timeout: 600000 });
      return { success: true, message: 'OpenHands updated. Re-run install to start with new version.', logs: ['Pulled latest image'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async configure(env: EnvironmentInfo, apiConfig: ApiConfig): Promise<void> {
    logger.info('Restart OpenHands container with new API key to apply changes.');
    try {
      execSync('docker stop openhands 2>/dev/null; docker rm openhands 2>/dev/null', { timeout: 30000 });
    } catch { /* ignore */ }
  },

  async start(env: EnvironmentInfo): Promise<void> {
    execSync('docker start openhands 2>/dev/null', { timeout: 30000 });
  },

  async stop(env: EnvironmentInfo): Promise<void> {
    execSync('docker stop openhands 2>/dev/null', { timeout: 30000 });
  },

  async status(env: EnvironmentInfo): Promise<PluginStatus> {
    try {
      const result = execSync('docker ps --filter name=openhands --format "{{.Status}}"', { encoding: 'utf-8', timeout: 10000 });
      return {
        running: result.trim().length > 0,
        port: 3000,
        health: result.includes('Up') ? 'healthy' : 'stopped',
      };
    } catch {
      return { running: false, health: 'stopped' };
    }
  },
};

export default OpenHandsPlugin;
