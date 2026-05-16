/**
 * Claude Code Installer Plugin
 * Anthropic's official CLI coding assistant
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

const logger = new Logger('ClaudeCode');

const ClaudeCodePlugin: InstallerPlugin = {
  id: 'claudecode',
  name: 'Claude Code',
  description: 'Anthropic 官方编程助手，代码能力极强（需科学上网）',
  version: '1.0.0',
  category: 'coding-assistant',
  tags: ['coding', 'cli', 'anthropic', 'claude', 'ai-pair-programming'],
  icon: '',
  homepage: 'https://docs.anthropic.com/en/docs/claude-code',
  repository: 'https://github.com/anthropics/claude-code.git',
  supportedPlatforms: ['windows', 'linux', 'macos'],
  requiresDocker: false,
  requiresGPU: false,
  localModel: false,
  cloudModel: true,
  defaultPort: 0,
  defaultApiProviders: ['claude'],
  dependencies: [
    { name: 'Node.js', required: true, verifyCommand: 'node --version', minVersion: '18.0.0', installCommand: {} },
  ],

  async detect(env: EnvironmentInfo): Promise<DetectionResult> {
    try {
      const result = execSync('claude --version 2>&1', { encoding: 'utf-8', timeout: 5000 });
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
    const missing = [];
    if (!env.hasNode) missing.push({ name: 'Node.js', required: true, verifyCommand: 'node --version' });

    return {
      canInstall: true,
      missingDependencies: missing,
      warnings: missing.length > 0 ? [`缺少依赖: ${missing.map((d) => d.name).join(', ')}`] : [],
      estimatedSize: '~50 MB',
      estimatedTime: '1-2 分钟',
    };
  },

  async install(env: EnvironmentInfo, config: InstallConfig): Promise<InstallResult> {
    const logs: string[] = [];

    try {
      logs.push('正在通过 npm 安装 Claude Code...');
      run('npm install -g @anthropic-ai/claude-code', { timeout: 120000 });

      if (config.apiConfig?.apiKey) {
        logs.push('正在配置 API Key...');
        const envVarName = 'ANTHROPIC_API_KEY';
        if (env.platform === 'windows') {
          execSync(`setx ${envVarName} "${config.apiConfig.apiKey}"`, { timeout: 10000 });
        } else {
          const shellFile = env.shellType.includes('zsh') ? '.zshrc' : '.bashrc';
          const shellPath = path.join(env.homeDir, shellFile);
          const line = `export ${envVarName}="${config.apiConfig.apiKey}"`;
          if (!fs.existsSync(shellPath) || !fs.readFileSync(shellPath, 'utf-8').includes(envVarName)) {
            fs.appendFileSync(shellPath, `\n${line}\n`);
          }
        }
      }

      return {
        success: true,
        message: 'Claude Code 安装完成！输入 "claude" 即可启动。',
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
    if (!result.success) return;
    logger.success('Claude Code 已就绪！在终端输入 "claude" 启动。');
  },

  async uninstall(env: EnvironmentInfo): Promise<UninstallResult> {
    try {
      run('npm uninstall -g @anthropic-ai/claude-code', { timeout: 60000 });
      return { success: true, message: 'Claude Code 已卸载', logs: ['已全局移除'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async update(env: EnvironmentInfo): Promise<UpdateResult> {
    try {
      run('npm update -g @anthropic-ai/claude-code', { timeout: 120000 });
      return { success: true, message: 'Claude Code 已更新', logs: ['已全局更新'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async configure(env: EnvironmentInfo, apiConfig: ApiConfig): Promise<void> {
    const key = 'ANTHROPIC_API_KEY';
    if (env.platform === 'windows') {
      execSync(`setx ${key} "${apiConfig.apiKey || ''}"`, { timeout: 10000 });
    } else {
      const shellPath = path.join(env.homeDir, env.shellType.includes('zsh') ? '.zshrc' : '.bashrc');
      fs.appendFileSync(shellPath, `\nexport ${key}="${apiConfig.apiKey || ''}"\n`);
    }
  },

  async start(env: EnvironmentInfo): Promise<void> {
    logger.info('在终端输入 "claude" 启动 Claude Code。');
  },

  async stop(env: EnvironmentInfo): Promise<void> {
    logger.info('Claude Code 在终端中运行，关闭终端即可停止。');
  },

  async status(env: EnvironmentInfo): Promise<PluginStatus> {
    try {
      execSync('claude --version', { encoding: 'utf-8', timeout: 5000 });
      return { running: false, health: 'healthy' };
    } catch {
      return { running: false, health: 'stopped' };
    }
  },
};

export default ClaudeCodePlugin;
