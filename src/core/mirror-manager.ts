/**
 * Mirror Manager - Manages download mirrors for different regions
 */

import { MirrorSource } from './types';
import { Logger } from '../utils/logger';

export class MirrorManager {
  private logger: Logger;
  private activeMirrors: Map<string, string> = new Map();

  static readonly MIRRORS: Record<string, MirrorSource[]> = {
    npm: [
      { name: 'npmjs (Global)', url: 'https://registry.npmjs.org/', region: 'global', priority: 1 },
      { name: 'npmmirror (China)', url: 'https://registry.npmmirror.com', region: 'china', priority: 2 },
    ],
    pip: [
      { name: 'PyPI (Global)', url: 'https://pypi.org/simple/', region: 'global', priority: 1 },
      { name: 'Tsinghua (China)', url: 'https://pypi.tuna.tsinghua.edu.cn/simple/', region: 'china', priority: 2 },
      { name: 'Aliyun (China)', url: 'https://mirrors.aliyun.com/pypi/simple/', region: 'china', priority: 3 },
    ],
    github: [
      { name: 'GitHub (Global)', url: 'https://github.com/', region: 'global', priority: 1 },
      { name: 'ghproxy (China)', url: 'https://ghproxy.com/', region: 'china', priority: 2 },
    ],
    docker: [
      { name: 'Docker Hub (Global)', url: 'https://registry-1.docker.io/', region: 'global', priority: 1 },
      { name: 'Docker China', url: 'https://registry.docker-cn.com/', region: 'china', priority: 2 },
    ],
    ollama: [
      { name: 'Ollama (Global)', url: 'https://ollama.com/', region: 'global', priority: 1 },
    ],
  };

  constructor() {
    this.logger = new Logger('MirrorManager');
  }

  enableChinaMirror(): void {
    this.logger.info('Switching to China mirror sources...');
    this.activeMirrors.set('npm', 'https://registry.npmmirror.com');
    this.activeMirrors.set('pip', 'https://pypi.tuna.tsinghua.edu.cn/simple/');
    this.activeMirrors.set('github', 'https://ghproxy.com/');
    this.activeMirrors.set('docker', 'https://registry.docker-cn.com/');
  }

  enableGlobalMirror(): void {
    this.logger.info('Switching to global mirror sources...');
    this.activeMirrors.clear();
  }

  getMirror(type: string): string {
    return this.activeMirrors.get(type) || MirrorManager.MIRRORS[type]?.[0]?.url || '';
  }

  getNpmRegistry(): string {
    return this.getMirror('npm');
  }

  getPipIndex(): string {
    return this.getMirror('pip');
  }

  getGithubUrl(repoUrl: string): string {
    const mirror = this.getMirror('github');
    if (mirror && mirror !== 'https://github.com/') {
      return `${mirror}${repoUrl.replace('https://github.com/', '')}`;
    }
    return repoUrl;
  }

  async detectBestMirror(): Promise<void> {
    this.logger.info('Detecting best mirror source...');

    for (const [type, mirrors] of Object.entries(MirrorManager.MIRRORS)) {
      let bestMirror = mirrors[0];
      let bestLatency = Infinity;

      for (const mirror of mirrors) {
        try {
          const start = Date.now();
          await fetch(mirror.url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
          const latency = Date.now() - start;

          if (latency < bestLatency) {
            bestLatency = latency;
            bestMirror = mirror;
          }
        } catch {
          continue;
        }
      }

      if (bestMirror) {
        this.activeMirrors.set(type, bestMirror.url);
        this.logger.info(`  ${type}: ${bestMirror.name} (${bestLatency}ms)`);
      }
    }
  }

  configureNpm(): string {
    const registry = this.getNpmRegistry();
    return `npm config set registry ${registry}`;
  }

  configurePip(): string {
    const index = this.getPipIndex();
    return `pip config set global.index-url ${index}`;
  }
}
