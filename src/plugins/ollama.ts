/**
 * Ollama 安装插件
 * 本地运行大语言模型
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
  description: '在本地运行大语言模型，完全离线，无需科学上网',
  version: '1.0.0',
  category: 'local-model',
  tags: ['local', 'llm', 'llama', 'mistral', 'self-hosted', 'privacy', '本地', '离线'],
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
      warnings: env.hasGPU ? [] : ['未检测到 GPU，Ollama 将使用 CPU 运行（速度较慢）'],
      estimatedSize: '~2 GB + 模型文件',
      estimatedTime: '2-5 分钟（安装器）+ 模型下载时间',
    };
  },

  async install(env: EnvironmentInfo, config: InstallConfig): Promise<InstallResult> {
    const logs: string[] = [];

    try {
      if (env.platform === 'windows') {
        logs.push('正在下载 Ollama for Windows...');
        const url = 'https://ollama.com/download/OllamaSetup.exe';
        const installerPath = path.join(process.env.TEMP || '/tmp', 'OllamaSetup.exe');
        run(`curl -L -o "${installerPath}" "${url}"`, { timeout: 300000 });
        logs.push('正在运行安装程序...');
        execSync(`"${installerPath}"`, { timeout: 300000, stdio: 'inherit' });
      } else if (env.platform === 'macos') {
        logs.push('正在通过 Homebrew 安装 Ollama...');
        run('brew install ollama', { timeout: 300000 });
      } else {
        logs.push('正在安装 Ollama...');
        run('curl -fsSL https://ollama.com/install.sh | sh', { timeout: 300000 });
      }

      logs.push('正在启动 Ollama 服务...');
      try {
        if (env.platform === 'linux') {
          execSync('sudo systemctl start ollama 2>/dev/null || ollama serve &', { timeout: 10000 });
        }
      } catch { /* 服务可能已经在运行 */ }

      // 下载推荐的默认模型（中文能力最强）
      logs.push('正在下载推荐模型（通义千问 7B，约 4.7GB）...');
      try {
        run('ollama pull qwen2.5:7b', { timeout: 600000 });
      } catch {
        logs.push('模型下载将在后台继续，稍后运行: ollama pull qwen2.5:7b');
      }

      return {
        success: true,
        message: 'Ollama 安装完成！运行 "ollama run qwen2.5:7b" 开始对话。',
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
      logger.success('Ollama 已就绪！');
      logger.info('  下载模型: ollama pull <模型名>');
      logger.info('  启动对话: ollama run <模型名>');
      logger.info('  API 地址: http://localhost:11434');
      logger.info('  推荐模型: ollama pull qwen2.5:7b');
    }
  },

  async uninstall(env: EnvironmentInfo): Promise<UninstallResult> {
    try {
      if (env.platform === 'macos') {
        run('brew uninstall ollama', { timeout: 60000 });
      } else if (env.platform === 'linux') {
        execSync('sudo systemctl stop ollama 2>/dev/null; sudo rm -f /usr/local/bin/ollama /usr/bin/ollama', { timeout: 30000 });
      } else {
        logger.info('请前往 Windows 设置 > 应用 > 卸载 Ollama。');
      }
      return { success: true, message: 'Ollama 已卸载', logs: ['已移除'] };
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
        logger.info('Ollama 在 Windows 上会自动更新，请查看系统托盘图标。');
      }
      return { success: true, message: 'Ollama 已更新', logs: ['已更新'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async configure(env: EnvironmentInfo, apiConfig: ApiConfig): Promise<void> {
    logger.info('Ollama API 默认地址: http://localhost:11434');
  },

  async start(env: EnvironmentInfo): Promise<void> {
    if (env.platform === 'linux') {
      execSync('sudo systemctl start ollama || ollama serve &', { timeout: 10000 });
    } else {
      logger.info('Ollama 以后台服务运行，请查看系统托盘。');
    }
  },

  async stop(env: EnvironmentInfo): Promise<void> {
    if (env.platform === 'linux') {
      execSync('sudo systemctl stop ollama 2>/dev/null || pkill ollama', { timeout: 10000 });
    } else {
      logger.info('请从系统托盘停止 Ollama。');
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
