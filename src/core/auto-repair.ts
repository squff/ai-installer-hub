/**
 * Auto Repair System - Intelligent error detection and automatic fixing
 */

import { execSync } from 'child_process';
import { EnvironmentInfo, RepairAction, RepairResult } from './types';
import { Logger } from '../utils/logger';
import { MirrorManager } from './mirror-manager';

export class AutoRepair {
  private logger: Logger;
  private mirrorManager: MirrorManager;
  private maxRetries: number = 3;

  constructor() {
    this.logger = new Logger('AutoRepair');
    this.mirrorManager = new MirrorManager();
  }

  async diagnose(error: string, env: EnvironmentInfo): Promise<RepairAction[]> {
    const actions: RepairAction[] = [];

    // Network errors
    if (this.isNetworkError(error)) {
      actions.push({
        type: 'change-mirror',
        description: '切换到镜像源以加速下载',
        execute: async () => {
          this.logger.info('正在切换到镜像源...');
          this.mirrorManager.enableChinaMirror();
          return true;
        },
      });

      actions.push({
        type: 'retry',
        description: '使用新镜像源重试',
        execute: async () => {
          this.logger.info('正在重试下载...');
          return true;
        },
      });
    }

    // Permission errors
    if (this.isPermissionError(error)) {
      actions.push({
        type: 'fix-permission',
        description: '修复文件/目录权限',
        execute: async () => {
          this.logger.info('正在修复权限...');
          return this.fixPermissions(env);
        },
      });
    }

    // Port conflicts
    if (this.isPortConflict(error)) {
      actions.push({
        type: 'kill-process',
        description: '终止占用端口的冲突进程',
        execute: async () => {
          this.logger.info('正在解决端口冲突...');
          return this.resolvePortConflict(error, env);
        },
      });
    }

    // Dependency errors
    if (this.isDependencyError(error)) {
      actions.push({
        type: 'install-dep',
        description: '安装缺失的依赖',
        execute: async () => {
          this.logger.info('正在安装缺失的依赖...');
          return this.installMissingDeps(error, env);
        },
      });
    }

    // Version errors
    if (this.isVersionError(error)) {
      actions.push({
        type: 'downgrade',
        description: '尝试使用兼容版本',
        execute: async () => {
          this.logger.info('正在尝试降级版本...');
          return true;
        },
      });
    }

    // 通用重试
    if (actions.length === 0) {
      actions.push({
        type: 'retry',
        description: '重试操作',
        execute: async () => {
          this.logger.info('正在重试操作...');
          return true;
        },
      });
    }

    return actions;
  }

  async autoRepair(
    error: string,
    env: EnvironmentInfo,
    originalOperation: () => Promise<boolean>
  ): Promise<RepairResult> {
    this.logger.info('自动修复已触发...');
    const actions = await this.diagnose(error, env);
    const executedActions: RepairAction[] = [];

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      this.logger.info(`修复尝试 ${attempt + 1}/${this.maxRetries}`);

      for (const action of actions) {
        this.logger.info(`  尝试: ${action.description}`);
        try {
          const fixed = await action.execute();
          executedActions.push(action);

          if (fixed) {
            // 重试原始操作
            const success = await originalOperation();
            if (success) {
              this.logger.info('自动修复成功！');
              return { fixed: true, actions: executedActions };
            }
          }
        } catch (repairErr) {
          this.logger.warn(`  Repair action failed: ${repairErr}`);
        }
      }
    }

    return {
      fixed: false,
      actions: executedActions,
      finalError: error,
    };
  }

  private isNetworkError(error: string): boolean {
    const patterns = [
      /ETIMEDOUT/i,
      /ECONNREFUSED/i,
      /ENOTFOUND/i,
      /network/i,
      /timeout/i,
      /ERR_SOCKET/i,
      /fetch failed/i,
      /connection reset/i,
    ];
    return patterns.some((p) => p.test(error));
  }

  private isPermissionError(error: string): boolean {
    const patterns = [
      /EACCES/i,
      /permission denied/i,
      /EPERM/i,
      /access denied/i,
      /unauthorized/i,
    ];
    return patterns.some((p) => p.test(error));
  }

  private isPortConflict(error: string): boolean {
    const patterns = [
      /EADDRINUSE/i,
      /port.*already.*in.*use/i,
      /address already in use/i,
      /listen EADDRINUSE/i,
    ];
    return patterns.some((p) => p.test(error));
  }

  private isDependencyError(error: string): boolean {
    const patterns = [
      /module not found/i,
      /cannot find module/i,
      /No module named/i,
      /command not found/i,
      /not recognized/i,
      /is not installed/i,
    ];
    return patterns.some((p) => p.test(error));
  }

  private isVersionError(error: string): boolean {
    const patterns = [
      /version.*not.*found/i,
      /incompatible/i,
      /unsupported version/i,
      /requires.*>=/i,
      /peer dep/i,
    ];
    return patterns.some((p) => p.test(error));
  }

  private async fixPermissions(env: EnvironmentInfo): Promise<boolean> {
    try {
      if (env.platform === 'windows') {
        execSync(
          `icacls "${env.installDir}" /grant ${process.env.USERNAME}:F /T`,
          { encoding: 'utf-8', timeout: 30000 }
        );
      } else {
        execSync(
          `chmod -R 755 "${env.installDir}" && chown -R $(whoami) "${env.installDir}"`,
          { encoding: 'utf-8', timeout: 30000 }
        );
      }
      return true;
    } catch {
      return false;
    }
  }

  private async resolvePortConflict(error: string, env: EnvironmentInfo): Promise<boolean> {
    const portMatch = error.match(/port\s*(\d+)/i) || error.match(/:(\d+)/);
    if (!portMatch) return false;

    const port = portMatch[1];
    try {
      if (env.platform === 'windows') {
        const result = execSync(
          `netstat -ano | findstr :${port}`,
          { encoding: 'utf-8', timeout: 10000 }
        );
        const pidMatch = result.match(/\s+(\d+)\s*$/m);
        if (pidMatch) {
          execSync(`taskkill /PID ${pidMatch[1]} /F`, { encoding: 'utf-8', timeout: 10000 });
        }
      } else {
        execSync(
          `kill $(lsof -t -i:${port}) 2>/dev/null || fuser -k ${port}/tcp 2>/dev/null`,
          { encoding: 'utf-8', timeout: 10000 }
        );
      }
      return true;
    } catch {
      return false;
    }
  }

  private async installMissingDeps(error: string, env: EnvironmentInfo): Promise<boolean> {
    // Extract module/package name from error
    const moduleMatch = error.match(/module\s*['"]?(\S+?)['"]?/i) ||
      error.match(/cannot find module\s*['"]?(\S+?)['"]?/i) ||
      error.match(/No module named\s*['"]?(\S+?)['"]?/i);

    if (!moduleMatch) return false;

    const moduleName = moduleMatch[1];
    try {
      if (moduleName.endsWith('.py') || moduleName.includes('.')) {
        // Python module
        execSync(`pip install ${moduleName}`, { encoding: 'utf-8', timeout: 120000 });
      } else {
        // npm module
        execSync(`npm install -g ${moduleName}`, { encoding: 'utf-8', timeout: 120000 });
      }
      return true;
    } catch {
      return false;
    }
  }
}
