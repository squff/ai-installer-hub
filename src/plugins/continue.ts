/**
 * Continue Installer Plugin
 * Open-source AI code assistant IDE extension
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

const logger = new Logger('Continue');

const ContinuePlugin: InstallerPlugin = {
  id: 'continue',
  name: 'Continue',
  description: 'VS Code AI 编程插件，支持代码补全和智能对话',
  version: '1.0.0',
  category: 'coding-assistant',
  tags: ['ide-extension', 'coding', 'open-source', 'vscode', 'jetbrains'],
  icon: '',
  homepage: 'https://continue.dev',
  repository: 'https://github.com/continuedev/continue.git',
  supportedPlatforms: ['windows', 'linux', 'macos'],
  requiresDocker: false,
  requiresGPU: false,
  localModel: true,
  cloudModel: true,
  defaultPort: 0,
  defaultApiProviders: ['openai', 'claude', 'ollama'],
  dependencies: [
    { name: 'VS Code', required: false, verifyCommand: 'code --version', installCommand: {} },
  ],

  async detect(env: EnvironmentInfo): Promise<DetectionResult> {
    try {
      const result = execSync('code --list-extensions 2>/dev/null', { encoding: 'utf-8', timeout: 10000 });
      if (result.includes('Continue.continue')) {
        return { alreadyInstalled: true };
      }
    } catch { /* VS Code not found */ }
    return { alreadyInstalled: false };
  },

  async preInstall(env: EnvironmentInfo): Promise<PreInstallResult> {
    const warnings = [];
    try {
      execSync('code --version', { encoding: 'utf-8', timeout: 5000 });
    } catch {
      warnings.push('未检测到 VS Code，请先安装 VS Code 以获得最佳体验。');
    }
    return {
      canInstall: true,
      missingDependencies: [],
      warnings,
      estimatedSize: '~100 MB',
      estimatedTime: '1-3 分钟',
    };
  },

  async install(env: EnvironmentInfo, config: InstallConfig): Promise<InstallResult> {
    const logs: string[] = [];

    try {
      logs.push('正在为 VS Code 安装 Continue 插件...');
      run('code --install-extension Continue.continue --force', { timeout: 120000 });

      if (config.apiConfig) {
        logs.push('正在配置 Continue API 设置...');
        const configDir = path.join(env.homeDir, '.continue');
        const configFile = path.join(configDir, 'config.json');
        ensureDir(path.dirname(configFile));

        const continueConfig = {
          models: [{
            title: config.apiConfig.model || 'GPT-4',
            provider: config.apiConfig.provider || 'openai',
            model: config.apiConfig.model || 'gpt-4o',
            apiKey: config.apiConfig.apiKey || '',
            apiBase: config.apiConfig.baseUrl,
          }],
        };
        fs.writeFileSync(configFile, JSON.stringify(continueConfig, null, 2));
      }

      return {
        success: true,
        message: 'Continue 安装完成！重启 VS Code 即可使用。',
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
      logger.success('Continue 插件安装完成！重启 VS Code 即可激活。');
    }
  },

  async uninstall(env: EnvironmentInfo): Promise<UninstallResult> {
    try {
      run('code --uninstall-extension Continue.continue', { timeout: 30000 });
      return { success: true, message: 'Continue 已卸载', logs: ['已移除插件'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async update(env: EnvironmentInfo): Promise<UpdateResult> {
    try {
      run('code --install-extension Continue.continue --force', { timeout: 120000 });
      return { success: true, message: 'Continue 已更新', logs: ['已重装最新版本'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async configure(env: EnvironmentInfo, apiConfig: ApiConfig): Promise<void> {
    const configDir = path.join(env.homeDir, '.continue');
    const configFile = path.join(configDir, 'config.json');
    ensureDir(path.dirname(configFile));

    const config = {
      models: [{
        title: apiConfig.model || 'GPT-4',
        provider: apiConfig.provider || 'openai',
        model: apiConfig.model || 'gpt-4o',
        apiKey: apiConfig.apiKey || '',
        apiBase: apiConfig.baseUrl,
      }],
    };
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  },

  async start(env: EnvironmentInfo): Promise<void> {
    logger.info('打开 VS Code，在侧边栏找到 Continue 图标即可使用。');
  },

  async stop(env: EnvironmentInfo): Promise<void> {
    logger.info('Continue 是 VS Code 扩展，关闭 VS Code 即可停止。');
  },

  async status(env: EnvironmentInfo): Promise<PluginStatus> {
    const detection = await this.detect(env);
    return {
      running: false,
      health: detection.alreadyInstalled ? 'healthy' : 'stopped',
    };
  },
};

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export default ContinuePlugin;
