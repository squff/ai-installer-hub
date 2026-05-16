/**
 * Hermes Installer Plugin
 * Lightweight AI assistant with conversation memory
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

const logger = new Logger('Hermes');

const HermesPlugin: InstallerPlugin = {
  id: 'hermes',
  name: 'Hermes',
  description: '轻量级 AI 助手，注重对话记忆和隐私保护',
  version: '1.0.0',
  category: 'chat-agent',
  tags: ['chat', 'memory', 'local', 'privacy', 'lightweight'],
  icon: '',
  homepage: 'https://github.com/NousResearch/Hermes',
  repository: 'https://github.com/NousResearch/Hermes.git',
  supportedPlatforms: ['windows', 'linux', 'macos'],
  requiresDocker: false,
  requiresGPU: false,
  localModel: true,
  cloudModel: true,
  defaultPort: 3001,
  defaultApiProviders: ['openai', 'ollama'],
  dependencies: [
    { name: 'Python', required: true, verifyCommand: 'python3 --version || python --version', installCommand: {} },
    { name: 'Git', required: true, verifyCommand: 'git --version', installCommand: {} },
  ],

  async detect(env: EnvironmentInfo): Promise<DetectionResult> {
    const installDir = getInstallDir('hermes');
    if (fs.existsSync(path.join(installDir, 'requirements.txt')) || fs.existsSync(path.join(installDir, 'setup.py'))) {
      return { alreadyInstalled: true, installedPath: installDir };
    }
    return { alreadyInstalled: false };
  },

  async preInstall(env: EnvironmentInfo): Promise<PreInstallResult> {
    const missing = [];
    if (!env.hasPython) missing.push({ name: 'Python', required: true, verifyCommand: 'python3 --version' });
    if (!env.hasGit) missing.push({ name: 'Git', required: true, verifyCommand: 'git --version' });

    return {
      canInstall: missing.length === 0 || !missing.some((d) => d.required),
      missingDependencies: missing,
      warnings: missing.length > 0 ? [`缺少依赖: ${missing.map((d) => d.name).join(', ')}`] : [],
      estimatedSize: '~500 MB',
      estimatedTime: '3-8 分钟',
    };
  },

  async install(env: EnvironmentInfo, config: InstallConfig): Promise<InstallResult> {
    const logs: string[] = [];
    const installDir = config.installDir || getInstallDir('hermes');

    try {
      logs.push('正在创建安装目录...');
      ensureDir(installDir);

      logs.push('正在克隆 Hermes 仓库...');
      run('git clone --depth 1 https://github.com/NousResearch/Hermes.git .', { cwd: installDir, timeout: 120000 });

      logs.push('正在创建虚拟环境...');
      const pythonCmd = env.hasPython ? 'python3' : 'python';
      run(`${pythonCmd} -m venv venv`, { cwd: installDir, timeout: 60000 });

      const venvPip = env.platform === 'windows'
        ? path.join(installDir, 'venv', 'Scripts', 'pip')
        : path.join(installDir, 'venv', 'bin', 'pip');

      if (fs.existsSync(path.join(installDir, 'requirements.txt'))) {
        logs.push('正在安装 Python 依赖...');
        run(`${venvPip} install -r requirements.txt`, { cwd: installDir, timeout: 300000 });
      }

      if (config.apiConfig) {
        logs.push('正在配置 API...');
        fs.writeFileSync(path.join(installDir, '.env'), `API_KEY=${config.apiConfig.apiKey || ''}\nMODEL=${config.apiConfig.model || 'gpt-4'}\n`);
      }

      return {
        success: true,
        message: 'Hermes 安装完成',
        installedPath: installDir,
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
    if (!result.success || !result.installedPath) return;
    const venvPython = env.platform === 'windows'
      ? path.join(result.installedPath, 'venv', 'Scripts', 'python')
      : path.join(result.installedPath, 'venv', 'bin', 'python');

    const ext = env.platform === 'windows' ? '.bat' : '.sh';
    const script = env.platform === 'windows'
      ? `@echo off\ncd /d "${result.installedPath}"\n${venvPython} main.py\n`
      : `#!/bin/bash\ncd "${result.installedPath}"\n${venvPython} main.py\n`;

    fs.writeFileSync(path.join(result.installedPath, `start${ext}`), script);
    if (env.platform !== 'windows') execSync(`chmod +x "${path.join(result.installedPath, `start${ext}`)}"`, { timeout: 5000 });
  },

  async uninstall(env: EnvironmentInfo): Promise<UninstallResult> {
    const installDir = getInstallDir('hermes');
    try {
      if (fs.existsSync(installDir)) fs.rmSync(installDir, { recursive: true, force: true });
      return { success: true, message: 'Hermes 已卸载', logs: ['已移除 ' + installDir] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async update(env: EnvironmentInfo): Promise<UpdateResult> {
    const installDir = getInstallDir('hermes');
    try {
      run('git pull origin main', { cwd: installDir, timeout: 120000 });
      return { success: true, message: 'Hermes 已更新', logs: ['已拉取最新代码'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async configure(env: EnvironmentInfo, apiConfig: ApiConfig): Promise<void> {
    const installDir = getInstallDir('hermes');
    fs.writeFileSync(path.join(installDir, '.env'), `API_KEY=${apiConfig.apiKey || ''}\nMODEL=${apiConfig.model || ''}\n`);
  },

  async start(env: EnvironmentInfo): Promise<void> {
    const installDir = getInstallDir('hermes');
    const ext = env.platform === 'windows' ? '.bat' : '.sh';
    execSync(`${env.platform === 'windows' ? '' : 'bash '}"${path.join(installDir, `start${ext}`)}"`, { stdio: 'inherit' });
  },

  async stop(env: EnvironmentInfo): Promise<void> {
    try {
      if (env.platform === 'windows') execSync('taskkill /F /IM python.exe 2>nul', { timeout: 5000 });
      else execSync("pkill -f 'hermes' 2>/dev/null || true", { timeout: 5000 });
    } catch { /* ignore */ }
  },

  async status(env: EnvironmentInfo): Promise<PluginStatus> {
    const installDir = getInstallDir('hermes');
    return {
      running: fs.existsSync(installDir),
      health: fs.existsSync(installDir) ? 'healthy' : 'stopped',
    };
  },
};

export default HermesPlugin;
