/**
 * Environment Detection Module
 * Automatically detects system capabilities, installed tools, and potential conflicts
 */

import { execSync } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { EnvironmentInfo, Platform, Arch, PortConflict } from './types';

export class EnvironmentDetector {
  async detect(): Promise<EnvironmentInfo> {
    const platform = this.detectPlatform();
    const arch = this.detectArch();

    return {
      platform,
      arch,
      osVersion: os.release(),
      hasWSL: await this.detectWSL(),
      hasDocker: await this.detectDocker(),
      hasPython: await this.detectPython(),
      pythonVersion: await this.getPythonVersion(),
      hasNode: await this.detectNode(),
      nodeVersion: await this.getNodeVersion(),
      hasGit: await this.detectGit(),
      gitVersion: await this.getGitVersion(),
      hasChrome: await this.detectChrome(),
      hasGPU: await this.detectGPU(),
      gpuType: await this.getGPUType(),
      hasCUDA: await this.detectCUDA(),
      homeDir: os.homedir(),
      installDir: path.join(os.homedir(), '.ai-installer-hub'),
      shellType: this.detectShell(),
      isAdmin: await this.checkAdmin(),
      freePort: await this.findFreePort(3000),
      conflicts: await this.detectPortConflicts(),
    };
  }

  private detectPlatform(): Platform {
    switch (os.platform()) {
      case 'win32':
        return 'windows';
      case 'darwin':
        return 'macos';
      default:
        return 'linux';
    }
  }

  private detectArch(): Arch {
    const arch = os.arch();
    if (arch === 'arm64') return 'arm64';
    if (arch === 'arm') return 'arm';
    return 'x64';
  }

  private async detectWSL(): Promise<boolean> {
    try {
      if (os.platform() !== 'win32') return false;
      const result = execSync('wsl --list --quiet 2>nul', { encoding: 'utf-8', timeout: 5000 });
      return result.trim().length > 0;
    } catch {
      return false;
    }
  }

  private async detectDocker(): Promise<boolean> {
    try {
      execSync('docker --version', { encoding: 'utf-8', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private async detectPython(): Promise<boolean> {
    try {
      const cmds = ['python3 --version', 'python --version'];
      for (const cmd of cmds) {
        try {
          execSync(cmd, { encoding: 'utf-8', timeout: 5000 });
          return true;
        } catch { continue; }
      }
      return false;
    } catch {
      return false;
    }
  }

  private async getPythonVersion(): Promise<string | null> {
    try {
      const result = execSync('python3 --version 2>&1 || python --version 2>&1', {
        encoding: 'utf-8',
        timeout: 5000,
      });
      const match = result.match(/Python ([\d.]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  private async detectNode(): Promise<boolean> {
    try {
      execSync('node --version', { encoding: 'utf-8', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private async getNodeVersion(): Promise<string | null> {
    try {
      return execSync('node --version', { encoding: 'utf-8', timeout: 5000 }).trim();
    } catch {
      return null;
    }
  }

  private async detectGit(): Promise<boolean> {
    try {
      execSync('git --version', { encoding: 'utf-8', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  private async getGitVersion(): Promise<string | null> {
    try {
      const result = execSync('git --version', { encoding: 'utf-8', timeout: 5000 });
      const match = result.match(/git version ([\d.]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  private async detectChrome(): Promise<boolean> {
    const paths = {
      win32: [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      ],
      darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
      linux: ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'],
    };
    const platformPaths = paths[os.platform() as keyof typeof paths] || paths.linux;
    return platformPaths.some((p) => fs.existsSync(p));
  }

  private async detectGPU(): Promise<boolean> {
    try {
      if (os.platform() === 'win32') {
        const result = execSync('wmic path win32_VideoController get name 2>nul', {
          encoding: 'utf-8',
          timeout: 10000,
        });
        return /nvidia|amd|radeon|intel/i.test(result);
      } else {
        const result = execSync('lspci 2>/dev/null | grep -i vga || true', {
          encoding: 'utf-8',
          timeout: 5000,
        });
        return result.trim().length > 0;
      }
    } catch {
      return false;
    }
  }

  private async getGPUType(): Promise<string | null> {
    try {
      if (os.platform() === 'win32') {
        const result = execSync('wmic path win32_VideoController get name 2>nul', {
          encoding: 'utf-8',
          timeout: 10000,
        });
        if (/nvidia/i.test(result)) return 'nvidia';
        if (/amd|radeon/i.test(result)) return 'amd';
        if (/intel/i.test(result)) return 'intel';
      } else {
        const result = execSync('lspci 2>/dev/null | grep -i vga || true', {
          encoding: 'utf-8',
          timeout: 5000,
        });
        if (/nvidia/i.test(result)) return 'nvidia';
        if (/amd|radeon/i.test(result)) return 'amd';
      }
      return null;
    } catch {
      return null;
    }
  }

  private async detectCUDA(): Promise<boolean> {
    try {
      execSync('nvcc --version', { encoding: 'utf-8', timeout: 5000 });
      return true;
    } catch {
      try {
        if (os.platform() === 'win32') {
          return fs.existsSync('C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA');
        }
        return fs.existsSync('/usr/local/cuda');
      } catch {
        return false;
      }
    }
  }

  private detectShell(): string {
    if (os.platform() === 'win32') {
      return process.env.COMSPEC || 'cmd.exe';
    }
    return process.env.SHELL || '/bin/bash';
  }

  private async checkAdmin(): Promise<boolean> {
    try {
      if (os.platform() === 'win32') {
        execSync('net session 2>nul', { encoding: 'utf-8', timeout: 5000 });
        return true;
      } else {
        const uid = execSync('id -u', { encoding: 'utf-8', timeout: 5000 });
        return parseInt(uid.trim()) === 0;
      }
    } catch {
      return false;
    }
  }

  private async findFreePort(startPort: number): Promise<number> {
    const net = await import('net');
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(startPort, () => {
        const addr = server.address();
        const port = typeof addr === 'object' && addr ? addr.port : startPort;
        server.close(() => resolve(port));
      });
      server.on('error', () => {
        resolve(this.findFreePort(startPort + 1));
      });
    });
  }

  private async detectPortConflicts(): Promise<PortConflict[]> {
    const commonPorts = [3000, 3001, 5000, 5173, 8000, 8080, 8888, 11434];
    const conflicts: PortConflict[] = [];

    for (const port of commonPorts) {
      try {
        const isInUse = await this.isPortInUse(port);
        if (isInUse) {
          conflicts.push({ port, process: 'unknown', pid: 0 });
        }
      } catch { continue; }
    }
    return conflicts;
  }

  private isPortInUse(port: number): Promise<boolean> {
    const net = require('net');
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(true));
      server.once('listening', () => {
        server.close(() => resolve(false));
      });
      server.listen(port);
    });
  }
}
