/**
 * OpenClaw Installer Plugin
 * Open-source AI assistant with multi-model support
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
import { ensureDir, getInstallDir, run, downloadFile } from '../utils/helpers';

const logger = new Logger('OpenClaw');

const OpenClawPlugin: InstallerPlugin = {
  id: 'openclaw',
  name: 'OpenClaw',
  description: 'Open-source AI assistant with multi-model support and tool integration',
  version: '1.0.0',
  category: 'chat-agent',
  tags: ['chat', 'multi-model', 'tools', 'open-source'],
  icon: 'https://raw.githubusercontent.com/openclaw/openclaw/main/assets/icon.png',
  homepage: 'https://github.com/openclaw/openclaw',
  repository: 'https://github.com/openclaw/openclaw.git',
  supportedPlatforms: ['windows', 'linux', 'macos'],
  requiresDocker: false,
  requiresGPU: false,
  localModel: true,
  cloudModel: true,
  defaultPort: 3000,
  defaultApiProviders: ['openai', 'claude', 'deepseek'],
  dependencies: [
    { name: 'Node.js', required: true, verifyCommand: 'node --version', installCommand: {} },
    { name: 'Git', required: true, verifyCommand: 'git --version', installCommand: {} },
  ],

  async detect(env: EnvironmentInfo): Promise<DetectionResult> {
    const installDir = getInstallDir('openclaw');
    const packageJson = path.join(installDir, 'package.json');

    if (fs.existsSync(packageJson)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
        return { alreadyInstalled: true, installedVersion: pkg.version, installedPath: installDir };
      } catch { /* ignore */ }
    }
    return { alreadyInstalled: false };
  },

  async preInstall(env: EnvironmentInfo): Promise<PreInstallResult> {
    const missing = [];
    if (!env.hasNode) missing.push({ name: 'Node.js', required: true, verifyCommand: 'node --version' });
    if (!env.hasGit) missing.push({ name: 'Git', required: true, verifyCommand: 'git --version' });

    return {
      canInstall: missing.length === 0 || !missing.some((d) => d.required),
      missingDependencies: missing,
      warnings: missing.length > 0 ? [`Missing: ${missing.map((d) => d.name).join(', ')}`] : [],
      estimatedSize: '~200 MB',
      estimatedTime: '2-5 minutes',
    };
  },

  async install(env: EnvironmentInfo, config: InstallConfig): Promise<InstallResult> {
    const logs: string[] = [];
    const installDir = config.installDir || getInstallDir('openclaw');

    try {
      logs.push('Creating install directory...');
      ensureDir(installDir);

      logs.push('Cloning OpenClaw repository...');
      const repoUrl = 'https://github.com/openclaw/openclaw.git';
      run(`git clone --depth 1 ${repoUrl} "${installDir}"`, { timeout: 120000 });

      logs.push('Installing dependencies...');
      run('npm install --production', { cwd: installDir, timeout: 300000 });

      if (config.apiConfig) {
        logs.push('Configuring API...');
        const envContent = `OPENAI_API_KEY=${config.apiConfig.apiKey || ''}\nOPENAI_BASE_URL=${config.apiConfig.baseUrl || ''}\n`;
        fs.writeFileSync(path.join(installDir, '.env'), envContent);
      }

      logs.push('Build complete!');
      return {
        success: true,
        message: 'OpenClaw installed successfully',
        installedPath: installDir,
        logs,
        warnings: [],
        errors: [],
        repairAttempts: 0,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Installation failed: ${err.message}`,
        logs,
        warnings: [],
        errors: [err.message],
        repairAttempts: 0,
      };
    }
  },

  async postInstall(env: EnvironmentInfo, result: InstallResult): Promise<void> {
    if (!result.success || !result.installedPath) return;
    logger.info('Post-install: creating startup scripts...');

    const startScript = env.platform === 'windows'
      ? `@echo off\ncd /d "${result.installedPath}"\nnpm start\n`
      : `#!/bin/bash\ncd "${result.installedPath}"\nnpm start\n`;

    const ext = env.platform === 'windows' ? '.bat' : '.sh';
    const scriptPath = path.join(result.installedPath, `start${ext}`);
    fs.writeFileSync(scriptPath, startScript);

    if (env.platform !== 'windows') {
      execSync(`chmod +x "${scriptPath}"`, { timeout: 5000 });
    }
  },

  async uninstall(env: EnvironmentInfo): Promise<UninstallResult> {
    const installDir = getInstallDir('openclaw');
    try {
      if (fs.existsSync(installDir)) {
        fs.rmSync(installDir, { recursive: true, force: true });
      }
      return { success: true, message: 'OpenClaw uninstalled successfully', logs: ['Removed ' + installDir] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async update(env: EnvironmentInfo): Promise<UpdateResult> {
    const installDir = getInstallDir('openclaw');
    try {
      run('git pull origin main', { cwd: installDir, timeout: 120000 });
      run('npm install --production', { cwd: installDir, timeout: 300000 });
      return { success: true, message: 'OpenClaw updated successfully', logs: ['Pulled latest changes'] };
    } catch (err: any) {
      return { success: false, message: err.message, logs: [err.message] };
    }
  },

  async configure(env: EnvironmentInfo, apiConfig: ApiConfig): Promise<void> {
    const installDir = getInstallDir('openclaw');
    const envPath = path.join(installDir, '.env');
    const content = `${apiConfig.envKey || 'OPENAI_API_KEY'}=${apiConfig.apiKey || ''}\n`;
    fs.writeFileSync(envPath, content);
  },

  async start(env: EnvironmentInfo): Promise<void> {
    const installDir = getInstallDir('openclaw');
    const ext = env.platform === 'windows' ? '.bat' : '.sh';
    const cmd = env.platform === 'windows' ? `"${path.join(installDir, `start${ext}`)}"` : `bash "${path.join(installDir, `start${ext}`)}"`;
    execSync(cmd, { cwd: installDir, timeout: 10000, stdio: 'inherit' });
  },

  async stop(env: EnvironmentInfo): Promise<void> {
    try {
      if (env.platform === 'windows') {
        execSync('taskkill /F /IM node.exe 2>nul', { timeout: 5000 });
      } else {
        execSync("pkill -f 'openclaw' 2>/dev/null || true", { timeout: 5000 });
      }
    } catch { /* ignore */ }
  },

  async status(env: EnvironmentInfo): Promise<PluginStatus> {
    const installDir = getInstallDir('openclaw');
    return {
      running: fs.existsSync(installDir),
      version: fs.existsSync(path.join(installDir, 'package.json'))
        ? JSON.parse(fs.readFileSync(path.join(installDir, 'package.json'), 'utf-8')).version
        : undefined,
      health: fs.existsSync(installDir) ? 'healthy' : 'stopped',
    };
  },
};

export default OpenClawPlugin;
