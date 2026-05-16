/**
 * AnythingLLM Installer Plugin
 * All-in-one AI desktop application with RAG support
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

const logger = new Logger('AnythingLLM');

const AnythingLLMPlugin: InstallerPlugin = {
  id: 'anythingllm',
  name: 'AnythingLLM',
  description: '本地知识库对话工具，导入文档后向 AI 提问（RAG）',
  version: '1.0.0',
  category: 'knowledge-base',
  tags: ['rag', 'documents', 'knowledge-base', 'desktop', 'chat-with-docs'],
  icon: '',
  homepage: 'https://anythingllm.com',
  repository: 'https://github.com/Mintplex-Labs/anything-llm.git',
  supportedPlatforms: ['windows', 'linux', 'macos'],
  requiresDocker: false,
  requiresGPU: false,
  localModel: true,
  cloudModel: true,
  defaultPort: 3001,
  defaultApiProviders: ['openai', 'claude', 'deepseek', 'ollama'],
  dependencies: [
    { name: 'Node.js', required: true, verifyCommand: 'node --version', installCommand: {} },
    { name: 'Yarn', required: false, verifyCommand: 'yarn --version', installCommand: { windows: 'npm install -g yarn', linux: 'npm install -g yarn', macos: 'npm install -g yarn' } },
  ],

  async detect(env: EnvironmentInfo): Promise<DetectionResult> {
    // Check for desktop app
    try {
      if (env.platform === 'macos' && fs.existsSync('/Applications/AnythingLLM.app')) {
        return { alreadyInstalled: true, installedPath: '/Applications/AnythingLLM.app' };
      }
    } catch { /* ignore */ }

    // Check for server install
    const installDir = getInstallDir('anythingllm');
    if (fs.existsSync(path.join(installDir, 'package.json'))) {
      return { alreadyInstalled: true, installedPath: installDir };
    }

    return { alreadyInstalled: false };
  },

  async preInstall(env: EnvironmentInfo): Promise<PreInstallResult> {
    const warnings = [];
    if (!env.hasNode) {
      warnings.push('需要 Node.js，将自动安装。');
    }
    return {
      canInstall: true,
      missingDependencies: [],
      warnings,
      estimatedSize: '~500 MB',
      estimatedTime: '3-8 分钟',
    };
  },

  async install(env: EnvironmentInfo, config: InstallConfig): Promise<InstallResult> {
    const logs: string[] = [];

    try {
      // Try desktop installer first
      logs.push('正在安装 AnythingLLM Desktop...');

      if (env.platform === 'windows') {
        const url = 'https://s3.us-west-1.amazonaws.com/public.useanything.com/latest/AnythingLLMDesktop.exe';
        const installerPath = path.join(process.env.TEMP || '/tmp', 'AnythingLLMDesktop.exe');
        run(`curl -L -o "${installerPath}" "${url}"`, { timeout: 300000 });
        execSync(`"${installerPath}"`, { timeout: 300000, stdio: 'inherit' });
      } else if (env.platform === 'macos') {
        run('brew install --cask anythingllm', { timeout: 300000 });
      } else {
        // Linux - install from source
        const installDir = config.installDir || getInstallDir('anythingllm');
        ensureDir(installDir);

        logs.push('正在克隆仓库...');
        run('git clone --depth 1 https://github.com/Mintplex-Labs/anything-llm.git .', { cwd: installDir, timeout: 120000 });

        logs.push('正在安装依赖...');
        run('yarn install --production', { cwd: installDir, timeout: 300000 });

        logs.push('正在构建...');
        run('cd server && yarn install --production', { cwd: installDir, timeout: 300000 });
        run('cd frontend && yarn install --production', { cwd: installDir, timeout: 300000 });
      }

      if (config.apiConfig) {
        logs.push('正在配置 API...');
        const envDir = env.platform === 'linux' ? getInstallDir('anythingllm') : env.homeDir;
        const envPath = path.join(envDir, '.env');
        fs.writeFileSync(envPath, `LLM_PROVIDER=${config.apiConfig.provider || 'openai'}\nOPEN_AI_KEY=${config.apiConfig.apiKey || ''}\n`);
      }

      return {
        success: true,
        message: 'AnythingLLM 安装完成！',
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
      logger.success('AnythingLLM 已安装！');
      if (env.platform !== 'linux') {
        logger.info('从应用菜单中启动 AnythingLLM。');
      } else {
        logger.info(`启动命令: cd ${result.installedPath} && yarn start`);
      }
    }
  },

  async uninstall(env: EnvironmentInfo): Promise<UninstallResult> {
    try {
      if (env.platform === 'macos') {
        run('brew uninstall --cask anythingllm 2>/dev/null || true', { timeout: 30000 });
      }
      const installDir = getInstallDir('anythingllm');
      if (fs.existsSync(installDir)) fs.rmSync(installDir, { recursive: true, force: true });
      return { success: true, message: 'AnythingLLM 已卸载', logs: ['已移除'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async update(env: EnvironmentInfo): Promise<UpdateResult> {
    try {
      if (env.platform === 'macos') {
        run('brew upgrade --cask anythingllm', { timeout: 300000 });
      } else {
        const installDir = getInstallDir('anythingllm');
        if (fs.existsSync(installDir)) {
          run('git pull origin main', { cwd: installDir, timeout: 120000 });
        }
      }
      return { success: true, message: 'AnythingLLM 已更新', logs: ['已更新'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async configure(env: EnvironmentInfo, apiConfig: ApiConfig): Promise<void> {
    logger.info('在 AnythingLLM 设置 > LLM 偏好中配置 API Key。');
  },

  async start(env: EnvironmentInfo): Promise<void> {
    if (env.platform === 'macos') {
      execSync('open -a AnythingLLM', { timeout: 10000 });
    } else {
      logger.info('从应用菜单启动 AnythingLLM，或运行启动脚本。');
    }
  },

  async stop(env: EnvironmentInfo): Promise<void> {
    logger.info('在应用窗口中关闭 AnythingLLM。');
  },

  async status(env: EnvironmentInfo): Promise<PluginStatus> {
    const detection = await this.detect(env);
    return {
      running: false,
      version: detection.installedVersion,
      health: detection.alreadyInstalled ? 'healthy' : 'stopped',
    };
  },
};

export default AnythingLLMPlugin;
