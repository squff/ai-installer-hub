/**
 * Mirror Manager - Manages download mirrors for different regions
 * 默认使用中国大陆镜像源
 */

import { MirrorSource } from './types';
import { Logger } from '../utils/logger';

export class MirrorManager {
  private logger: Logger;
  private activeMirrors: Map<string, string> = new Map();

  static readonly MIRRORS: Record<string, MirrorSource[]> = {
    npm: [
      { name: 'npmmirror（淘宝）', url: 'https://registry.npmmirror.com', region: 'china', priority: 1 },
      { name: 'npmjs（全球）', url: 'https://registry.npmjs.org/', region: 'global', priority: 2 },
    ],
    pip: [
      { name: '清华大学', url: 'https://pypi.tuna.tsinghua.edu.cn/simple/', region: 'china', priority: 1 },
      { name: '阿里云', url: 'https://mirrors.aliyun.com/pypi/simple/', region: 'china', priority: 2 },
      { name: '中国科技大学', url: 'https://pypi.mirrors.ustc.edu.cn/simple/', region: 'china', priority: 3 },
      { name: '豆瓣', url: 'https://pypi.douban.com/simple/', region: 'china', priority: 4 },
      { name: 'PyPI（全球）', url: 'https://pypi.org/simple/', region: 'global', priority: 5 },
    ],
    github: [
      { name: 'ghproxy（国内加速）', url: 'https://mirror.ghproxy.com/', region: 'china', priority: 1 },
      { name: 'ghproxy.com', url: 'https://ghproxy.com/', region: 'china', priority: 2 },
      { name: 'GitHub（全球）', url: 'https://github.com/', region: 'global', priority: 3 },
    ],
    docker: [
      { name: '网易', url: 'https://hub-mirror.c.163.com', region: 'china', priority: 1 },
      { name: '阿里云', url: 'https://registry.docker-cn.com', region: 'china', priority: 2 },
      { name: '腾讯云', url: 'https://mirror.ccs.tencentyun.com', region: 'china', priority: 3 },
      { name: '中科大', url: 'https://docker.mirrors.ustc.edu.cn', region: 'china', priority: 4 },
      { name: 'Docker Hub（全球）', url: 'https://registry-1.docker.io/', region: 'global', priority: 5 },
    ],
    nodejs: [
      { name: 'npmmirror Node.js', url: 'https://npmmirror.com/mirrors/node', region: 'china', priority: 1 },
      { name: 'Node.js 官方', url: 'https://nodejs.org/dist', region: 'global', priority: 2 },
    ],
    ollama: [
      { name: 'Ollama（全球）', url: 'https://ollama.com/', region: 'global', priority: 1 },
    ],
  };

  constructor() {
    this.logger = new Logger('MirrorManager');
    // 默认启用中国镜像
    this.enableChinaMirror();
  }

  enableChinaMirror(): void {
    this.logger.info('启用中国大陆镜像源...');
    for (const [type, mirrors] of Object.entries(MirrorManager.MIRRORS)) {
      const chinaMirror = mirrors.find((m) => m.region === 'china');
      if (chinaMirror) {
        this.activeMirrors.set(type, chinaMirror.url);
        this.logger.info(`  ${type}: ${chinaMirror.name}`);
      }
    }
  }

  enableGlobalMirror(): void {
    this.logger.info('切换到全球镜像源...');
    for (const [type, mirrors] of Object.entries(MirrorManager.MIRRORS)) {
      const globalMirror = mirrors.find((m) => m.region === 'global');
      if (globalMirror) {
        this.activeMirrors.set(type, globalMirror.url);
      }
    }
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

  getNodejsMirror(): string {
    return this.getMirror('nodejs');
  }

  getGithubUrl(repoUrl: string): string {
    const mirror = this.getMirror('github');
    if (mirror && mirror !== 'https://github.com/') {
      return `${mirror}${repoUrl.replace('https://github.com/', '')}`;
    }
    return repoUrl;
  }

  getDockerMirrors(): string[] {
    return MirrorManager.MIRRORS.docker
      .filter((m) => m.region === 'china')
      .map((m) => m.url);
  }

  async detectBestMirror(): Promise<void> {
    this.logger.info('检测最佳镜像源...');

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

  /** 生成 Docker daemon.json 镜像配置 */
  generateDockerDaemonConfig(): string {
    const mirrors = this.getDockerMirrors();
    return JSON.stringify({
      'registry-mirrors': mirrors,
    }, null, 2);
  }
}
