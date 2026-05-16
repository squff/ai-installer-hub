/**
 * Plugin Manager - Dynamic plugin discovery and lifecycle management
 */

import * as path from 'path';
import * as fs from 'fs';
import { InstallerPlugin, EnvironmentInfo, InstallConfig, PluginCategory } from './types';
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
    this.logger.info('Loading installer plugins...');

    // Built-in plugins
    this.loadBuiltInPlugins();

    // External plugins from installers directory
    await this.loadExternalPlugins();

    this.logger.info(`Loaded ${this.plugins.size} plugins`);
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
        this.logger.warn(`Failed to load external plugin: ${entry.name}`);
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
  ) {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Plugin not found: ${id}`);
    }

    // Check platform support
    if (!plugin.supportedPlatforms.includes(env.platform)) {
      throw new Error(
        `${plugin.name} does not support ${env.platform}. Supported: ${plugin.supportedPlatforms.join(', ')}`
      );
    }

    // Detect existing installation
    const detection = await plugin.detect(env);
    if (detection.alreadyInstalled) {
      this.logger.info(`${plugin.name} v${detection.installedVersion} is already installed`);
      return { success: true, message: `${plugin.name} is already installed`, alreadyInstalled: true };
    }

    // Pre-install check
    this.logger.info(`Checking prerequisites for ${plugin.name}...`);
    const preResult = await plugin.preInstall(env);
    if (!preResult.canInstall) {
      this.logger.warn(`Missing dependencies: ${preResult.missingDependencies.map((d) => d.name).join(', ')}`);
    }

    // Install
    this.logger.info(`Installing ${plugin.name}...`);
    const result = await plugin.install(env, config);

    if (result.success) {
      // Post-install
      await plugin.postInstall(env, result);
      this.logger.info(`${plugin.name} installed successfully!`);
    }

    return result;
  }

  async uninstallPlugin(id: string, env: EnvironmentInfo) {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error(`Plugin not found: ${id}`);
    return plugin.uninstall(env);
  }

  async updatePlugin(id: string, env: EnvironmentInfo) {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error(`Plugin not found: ${id}`);
    return plugin.update(env);
  }
}
