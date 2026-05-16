/**
 * Plugin Manager - Dynamic plugin discovery and lifecycle management
 */

import * as path from 'path';
import * as fs from 'fs';
import { InstallerPlugin, EnvironmentInfo, InstallConfig, InstallResult, PluginCategory } from './types';
import { Logger } from '../utils/logger';

export class PluginManager {
  private plugins: Map<string, InstallerPlugin> = new Map();
  private pluginsDir: string;
  private logger: Logger;

  constructor(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
    this.logger = new Logger('PluginManager');
  }

  async loadPlugins(): Promise<void> {
    this.logger.info('正在加载安装插件...');

    // Built-in plugins
    this.loadBuiltInPlugins();

    // External plugins from installers directory
    await this.loadExternalPlugins();

    this.logger.info(`已加载 ${this.plugins.size} 个插件`);
  }

  private loadBuiltInPlugins(): void {
    const pluginModules = [
      require('../plugins/openclaw'),
      require('../plugins/hermes'),
      require('../plugins/claudecode'),
      require('../plugins/roocode'),
      require('../plugins/openhands'),
      require('../plugins/continue'),
      require('../plugins/ollama'),
      require('../plugins/anythingllm'),
    ];

    for (const mod of pluginModules) {
      const plugin: InstallerPlugin = mod.default || mod;
      this.plugins.set(plugin.id, plugin);
      this.logger.info(`  [OK] ${plugin.name} (${plugin.id})`);
    }
  }

  private async loadExternalPlugins(): Promise<void> {
    if (!fs.existsSync(this.pluginsDir)) return;

    const entries = fs.readdirSync(this.pluginsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const manifestPath = path.join(this.pluginsDir, entry.name, 'manifest.json');
      if (!fs.existsSync(manifestPath)) continue;

      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        this.logger.info(`  [EXT] ${manifest.name} (${manifest.id})`);
      } catch (err) {
        this.logger.warn(`加载外部插件失败: ${entry.name}`);
      }
    }
  }

  getPlugin(id: string): InstallerPlugin | undefined {
    return this.plugins.get(id);
  }

  listPlugins(): InstallerPlugin[] {
    return Array.from(this.plugins.values());
  }

  listByCategory(category: PluginCategory): InstallerPlugin[] {
    return this.listPlugins().filter((p) => p.category === category);
  }

  searchPlugins(query: string): InstallerPlugin[] {
    const q = query.toLowerCase();
    return this.listPlugins().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  async installPlugin(
    id: string,
    env: EnvironmentInfo,
    config: InstallConfig = {}
  ): Promise<InstallResult> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`未找到插件: ${id}`);
    }

    // 检查平台支持
    if (!plugin.supportedPlatforms.includes(env.platform)) {
      throw new Error(
        `${plugin.name} 不支持 ${env.platform}。支持的平台: ${plugin.supportedPlatforms.join(', ')}`
      );
    }

    // 检测已有安装
    const detection = await plugin.detect(env);
    if (detection.alreadyInstalled) {
      this.logger.info(`${plugin.name} v${detection.installedVersion} 已安装`);
      return {
        success: true,
        message: `${plugin.name} 已安装`,
        installedPath: detection.installedPath,
        version: detection.installedVersion,
        logs: [],
        warnings: [],
        errors: [],
        repairAttempts: 0,
      };
    }

    // 安装前检查
    this.logger.info(`正在检查 ${plugin.name} 的前置条件...`);
    const preResult = await plugin.preInstall(env);
    if (!preResult.canInstall) {
      this.logger.warn(`缺少依赖: ${preResult.missingDependencies.map((d) => d.name).join(', ')}`);
    }

    // 安装
    this.logger.info(`正在安装 ${plugin.name}...`);
    const result = await plugin.install(env, config);

    if (result.success) {
      // 安装后处理
      await plugin.postInstall(env, result);
      this.logger.info(`${plugin.name} 安装成功！`);
    }

    return result;
  }

  async uninstallPlugin(id: string, env: EnvironmentInfo) {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error(`未找到插件: ${id}`);
    return plugin.uninstall(env);
  }

  async updatePlugin(id: string, env: EnvironmentInfo) {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error(`未找到插件: ${id}`);
    return plugin.update(env);
  }
}
