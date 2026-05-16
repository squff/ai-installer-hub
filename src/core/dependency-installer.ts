/**
 * Dependency Installer - Auto-installs required system dependencies
 */

import { execSync, ExecSyncOptions } from 'child_process';
import * as os from 'os';
import { EnvironmentInfo, Dependency, Platform } from './types';
import { Logger } from '../utils/logger';

export class DependencyInstaller {
  private logger: Logger;
  private mirrors: Record<string, string[]> = {
    npm: ['https://registry.npmjs.org/', 'https://registry.npmmirror.com'],
    pip: ['https://pypi.org/simple/', 'https://pypi.tuna.tsinghua.edu.cn/simple/'],
    git: ['https://github.com/', 'https://ghproxy.com/https://github.com/'],
  };

  constructor() {
    this.logger = new Logger('DependencyInstaller');
  }

  async installAll(deps: Dependency[], env: EnvironmentInfo): Promise<boolean> {
    let allSuccess = true;

    for (const dep of deps) {
      if (!dep.required) continue;

      const installed = await this.isInstalled(dep);
      if (installed) {
        this.logger.info(`  [OK] ${dep.name} is already installed`);
        continue;
      }

      this.logger.info(`  Installing ${dep.name}...`);
      const success = await this.installOne(dep, env);
      if (!success) {
        this.logger.error(`  [FAIL] Failed to install ${dep.name}`);
        allSuccess = false;
      }
    }

    return allSuccess;
  }

  async isInstalled(dep: Dependency): Promise<boolean> {
    try {
      execSync(dep.verifyCommand, { encoding: 'utf-8', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async installOne(dep: Dependency, env: EnvironmentInfo): Promise<boolean> {
    const cmd = dep.installCommand?.[env.platform];
    if (!cmd) {
      this.logger.warn(`No install command for ${dep.name} on ${env.platform}`);
      return false;
    }

    try {
      this.logger.info(`  Running: ${cmd}`);
      execSync(cmd, {
        encoding: 'utf-8',
        timeout: 300000,
        stdio: 'inherit',
      });
      return true;
    } catch (err) {
      this.logger.error(`Failed: ${err}`);
      return false;
    }
  }

  async installPython(env: EnvironmentInfo): Promise<boolean> {
    if (env.hasPython) return true;

    this.logger.info('Installing Python...');
    const cmds: Record<Platform, string> = {
      windows: `
        Write-Host "Downloading Python..."
        $url = "https://www.python.org/ftp/python/3.12.3/python-3.12.3-amd64.exe"
        $out = "$env:TEMP\\python-installer.exe"
        Invoke-WebRequest -Uri $url -OutFile $out
        Start-Process -FilePath $out -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
        Remove-Item $out
      `,
      linux: `
        sudo apt-get update && sudo apt-get install -y python3 python3-pip python3-venv ||
        sudo yum install -y python3 python3-pip ||
        sudo dnf install -y python3 python3-pip
      `,
      macos: `brew install python3 || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && brew install python3`,
    };

    try {
      execSync(cmds[env.platform], { encoding: 'utf-8', timeout: 300000, stdio: 'inherit' });
      return true;
    } catch {
      return false;
    }
  }

  async installNode(env: EnvironmentInfo): Promise<boolean> {
    if (env.hasNode) return true;

    this.logger.info('Installing Node.js...');
    const cmds: Record<Platform, string> = {
      windows: `
        Write-Host "Downloading Node.js..."
        $url = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"
        $out = "$env:TEMP\\node-installer.msi"
        Invoke-WebRequest -Uri $url -OutFile $out
        Start-Process msiexec.exe -ArgumentList "/i $out /quiet /norestart" -Wait
        Remove-Item $out
      `,
      linux: `
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&
        sudo apt-get install -y nodejs ||
        (curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && source ~/.bashrc && nvm install 20)
      `,
      macos: `brew install node@20 || (curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && source ~/.bashrc && nvm install 20)`,
    };

    try {
      execSync(cmds[env.platform], { encoding: 'utf-8', timeout: 300000, stdio: 'inherit' });
      return true;
    } catch {
      return false;
    }
  }

  async installGit(env: EnvironmentInfo): Promise<boolean> {
    if (env.hasGit) return true;

    this.logger.info('Installing Git...');
    const cmds: Record<Platform, string> = {
      windows: `
        $url = "https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/Git-2.44.0-64-bit.exe"
        $out = "$env:TEMP\\git-installer.exe"
        Invoke-WebRequest -Uri $url -OutFile $out
        Start-Process -FilePath $out -ArgumentList "/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /COMPONENTS=icons,ext\\reg\\shellhere,assoc,assoc_sh" -Wait
        Remove-Item $out
      `,
      linux: `sudo apt-get install -y git || sudo yum install -y git || sudo dnf install -y git`,
      macos: `xcode-select --install || brew install git`,
    };

    try {
      execSync(cmds[env.platform], { encoding: 'utf-8', timeout: 300000, stdio: 'inherit' });
      return true;
    } catch {
      return false;
    }
  }

  async installDocker(env: EnvironmentInfo): Promise<boolean> {
    if (env.hasDocker) return true;

    this.logger.info('Installing Docker...');
    const cmds: Record<Platform, string> = {
      windows: `
        Write-Host "Please install Docker Desktop manually from https://www.docker.com/products/docker-desktop/"
        Start-Process "https://www.docker.com/products/docker-desktop/"
      `,
      linux: `
        curl -fsSL https://get.docker.com | sudo sh &&
        sudo usermod -aG docker $USER &&
        sudo systemctl enable docker && sudo systemctl start docker
      `,
      macos: `brew install --cask docker`,
    };

    try {
      execSync(cmds[env.platform], { encoding: 'utf-8', timeout: 600000, stdio: 'inherit' });
      return true;
    } catch {
      return false;
    }
  }

  async fixPath(env: EnvironmentInfo): Promise<void> {
    this.logger.info('Fixing PATH...');
    if (env.platform === 'windows') {
      try {
        execSync('refreshenv 2>nul || echo "Please restart your terminal"', {
          encoding: 'utf-8',
          timeout: 5000,
        });
      } catch { /* ignore */ }
    } else {
      try {
        execSync('hash -r', { encoding: 'utf-8', timeout: 5000 });
      } catch { /* ignore */ }
    }
  }
}
