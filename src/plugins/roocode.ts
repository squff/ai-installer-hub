/**
 * Roo Code Installer Plugin
 * AI-powered VS Code fork with built-in coding assistant
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

const logger = new Logger('RooCode');

const RooCodePlugin: InstallerPlugin = {
  id: 'roocode',
  name: 'Roo Code',
  description: 'AI-powered VS Code fork with built-in coding assistant and multi-model support',
  version: '1.0.0',
  category: 'coding-assistant',
  tags: ['ide', 'coding', 'vscode', 'multi-model', 'ai-editor'],
  icon: '',
  homepage: 'https://roocode.com',
  repository: 'https://github.com/RooCodeInc/Roo-Code.git',
  supportedPlatforms: ['windows', 'linux', 'macos'],
  requiresDocker: false,
  requiresGPU: false,
  localModel: true,
  cloudModel: true,
  defaultPort: 0,
  defaultApiProviders: ['openai', 'claude', 'deepseek', 'openrouter'],
  dependencies: [
    { name: 'Node.js', required: true, verifyCommand: 'node --version', installCommand: {} },
    { name: 'Git', required: true, verifyCommand: 'git --version', installCommand: {} },
  ],

  async detect(env: EnvironmentInfo): Promise<DetectionResult> {
    try {
      if (env.platform === 'windows') {
        const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
        const possiblePaths = [
          path.join(programFiles, 'Roo Code', 'Roo Code.exe'),
          path.join(env.homeDir, 'AppData', 'Local', 'Programs', 'roo-code', 'Roo Code.exe'),
        ];
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) return { alreadyInstalled: true, installedPath: p };
        }
      } else if (env.platform === 'macos') {
        if (fs.existsSync('/Applications/Roo Code.app')) {
          return { alreadyInstalled: true, installedPath: '/Applications/Roo Code.app' };
        }
      } else {
        try {
          execSync('which roocode 2>/dev/null', { encoding: 'utf-8', timeout: 5000 });
          return { alreadyInstalled: true };
        } catch { /* not found */ }
      }
    } catch { /* ignore */ }
    return { alreadyInstalled: false };
  },

  async preInstall(env: EnvironmentInfo): Promise<PreInstallResult> {
    return {
      canInstall: true,
      missingDependencies: [],
      warnings: [],
      estimatedSize: '~300 MB',
      estimatedTime: '3-5 minutes',
    };
  },

  async install(env: EnvironmentInfo, config: InstallConfig): Promise<InstallResult> {
    const logs: string[] = [];

    try {
      logs.push('Downloading Roo Code...');

      if (env.platform === 'windows') {
        const installerUrl = 'https://github.com/RooCodeInc/Roo-Code/releases/latest/download/Roo-Code-win32-x64.exe';
        const installerPath = path.join(process.env.TEMP || '/tmp', 'roocode-installer.exe');
        run(`curl -L -o "${installerPath}" "${installerUrl}"`, { timeout: 300000 });
        logs.push('Running installer...');
        execSync(`"${installerPath}" /S`, { timeout: 300000, stdio: 'inherit' });
      } else if (env.platform === 'macos') {
        run('brew install --cask roocode || brew install roocode', { timeout: 300000 });
      } else {
        const installerUrl = 'https://github.com/RooCodeInc/Roo-Code/releases/latest/download/Roo-Code-linux-x64.AppImage';
        const installDir = getInstallDir('roocode');
        const appImagePath = path.join(installDir, 'Roo-Code.AppImage');
        run(`curl -L -o "${appImagePath}" "${installerUrl}" && chmod +x "${appImagePath}"`, { timeout: 300000 });
      }

      return {
        success: true,
        message: 'Roo Code installed successfully!',
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
    if (result.success) logger.success('Roo Code is ready! Launch it from your applications menu.');
  },

  async uninstall(env: EnvironmentInfo): Promise<UninstallResult> {
    try {
      if (env.platform === 'macos') {
        run('brew uninstall --cask roocode 2>/dev/null || rm -rf /Applications/Roo\\ Code.app', { timeout: 30000 });
      } else if (env.platform === 'linux') {
        const installDir = getInstallDir('roocode');
        if (fs.existsSync(installDir)) fs.rmSync(installDir, { recursive: true, force: true });
      }
      return { success: true, message: 'Roo Code uninstalled', logs: ['Removed'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async update(env: EnvironmentInfo): Promise<UpdateResult> {
    try {
      if (env.platform === 'macos') {
        run('brew upgrade --cask roocode', { timeout: 300000 });
      } else {
        logger.info('Roo Code auto-updates itself. Check Help > Check for Updates in the app.');
      }
      return { success: true, message: 'Roo Code updated', logs: ['Updated'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async configure(env: EnvironmentInfo, apiConfig: ApiConfig): Promise<void> {
    logger.info('Configure API keys in Roo Code Settings > API Configuration');
  },

  async start(env: EnvironmentInfo): Promise<void> {
    if (env.platform === 'macos') execSync('open -a "Roo Code"', { timeout: 10000 });
    else if (env.platform === 'linux') execSync(`${getInstallDir('roocode')}/Roo-Code.AppImage &`, { timeout: 10000 });
    else execSync('start "" "Roo Code"', { timeout: 10000 });
  },

  async stop(env: EnvironmentInfo): Promise<void> {
    logger.info('Close Roo Code from the application window.');
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

export default RooCodePlugin;
