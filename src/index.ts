#!/usr/bin/env node
/**
 * AI 助手一键安装器 - CLI 入口
 * 中国大陆特供版
 */

import { EnvironmentDetector } from './core/env-detector';
import { PluginManager } from './core/plugin-manager';
import { ApiConfigManager } from './core/api-config';
import { AutoRepair } from './core/auto-repair';
import { MirrorManager } from './core/mirror-manager';
import { Logger } from './utils/logger';
import * as path from 'path';

const logger = new Logger('CLI');
const VERSION = '1.0.0';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  logger.banner(`AI 助手一键安装器 v${VERSION}`);
  console.log('');

  switch (command) {
    case 'install':
      await handleInstall(args[1], args.slice(2));
      break;
    case 'uninstall':
      await handleUninstall(args[1]);
      break;
    case 'update':
      await handleUpdate(args[1]);
      break;
    case 'list':
      await handleList();
      break;
    case 'search':
      await handleSearch(args.slice(1).join(' '));
      break;
    case 'status':
      await handleStatus(args[1]);
      break;
    case 'config':
      await handleConfig(args.slice(1));
      break;
    case 'doctor':
      await handleDoctor();
      break;
    case 'version':
    case '--version':
    case '-v':
      console.log(`ai-installer-hub v${VERSION}`);
      break;
    case 'help':
    case '--help':
    case '-h':
    default:
      showHelp();
      break;
  }
}

async function handleInstall(toolId?: string, flags: string[] = []): Promise<void> {
  if (!toolId) {
    logger.error('请指定要安装的工具。运行 "aihub list" 查看可用工具。');
    return;
  }

  const detector = new EnvironmentDetector();
  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  const autoRepair = new AutoRepair();
  const mirrorManager = new MirrorManager();

  // 加载插件
  await pluginManager.loadPlugins();

  // 检测系统环境
  logger.info('正在检测系统环境...');
  const env = await detector.detect();

  logger.info(`系统: ${env.platform} (${env.arch})`);
  logger.info(`Node.js: ${env.nodeVersion || '未安装'}`);
  logger.info(`Python: ${env.pythonVersion || '未安装'}`);
  logger.info(`Git: ${env.gitVersion || '未安装'}`);
  logger.info(`Docker: ${env.hasDocker ? '已安装' : '未安装'}`);
  logger.info(`GPU: ${env.gpuType || '无'} (CUDA: ${env.hasCUDA ? '支持' : '不支持'})`);
  console.log('');

  // 自动检测最佳镜像（默认中国镜像）
  await mirrorManager.detectBestMirror();

  // 解析配置参数
  const config: any = {};
  for (let i = 0; i < flags.length; i++) {
    if (flags[i] === '--api-key' && flags[i + 1]) {
      config.apiConfig = { apiKey: flags[i + 1] };
      i++;
    } else if (flags[i] === '--provider' && flags[i + 1]) {
      config.apiConfig = { ...config.apiConfig, provider: flags[i + 1] };
      i++;
    } else if (flags[i] === '--model' && flags[i + 1]) {
      config.apiConfig = { ...config.apiConfig, model: flags[i + 1] };
      i++;
    } else if (flags[i] === '--port' && flags[i + 1]) {
      config.port = parseInt(flags[i + 1]);
      i++;
    } else if (flags[i] === '--dir' && flags[i + 1]) {
      config.installDir = flags[i + 1];
      i++;
    }
  }

  // 安装（带自动修复）
  try {
    const result = await pluginManager.installPlugin(toolId, env, config);
    if (result.success) {
      console.log('');
      logger.success(result.message);
    } else {
      console.log('');
      logger.fail(result.message);

      // 尝试自动修复
      if (result.errors?.length) {
        logger.info('正在尝试自动修复...');
        const repair = await autoRepair.autoRepair(
          result.errors.join('; '),
          env,
          async () => {
            const r = await pluginManager.installPlugin(toolId, env, config);
            return r.success;
          }
        );
        if (repair.fixed) {
          logger.success('自动修复成功！');
        } else {
          logger.error('自动修复失败，请查看日志了解详情。');
        }
      }
    }
  } catch (err: any) {
    logger.error(`安装失败: ${err.message}`);
  }
}

async function handleUninstall(toolId?: string): Promise<void> {
  if (!toolId) {
    logger.error('请指定要卸载的工具。');
    return;
  }

  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  await pluginManager.loadPlugins();

  const detector = new EnvironmentDetector();
  const env = await detector.detect();

  try {
    const result = await pluginManager.uninstallPlugin(toolId, env);
    if (result.success) {
      logger.success(result.message);
    } else {
      logger.fail(result.message);
    }
  } catch (err: any) {
    logger.error(`卸载失败: ${err.message}`);
  }
}

async function handleUpdate(toolId?: string): Promise<void> {
  if (!toolId) {
    logger.error('请指定要更新的工具。');
    return;
  }

  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  await pluginManager.loadPlugins();

  const detector = new EnvironmentDetector();
  const env = await detector.detect();

  try {
    const result = await pluginManager.updatePlugin(toolId, env);
    if (result.success) {
      logger.success(result.message);
    } else {
      logger.fail(result.message);
    }
  } catch (err: any) {
    logger.error(`更新失败: ${err.message}`);
  }
}

async function handleList(): Promise<void> {
  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  await pluginManager.loadPlugins();

  const plugins = pluginManager.listPlugins();
  console.log('可用的 AI 助手:\n');

  const categories: Record<string, string> = {
    'coding-assistant': '编程助手',
    'chat-agent': '对话助手',
    'automation': '自动化工具',
    'local-model': '本地模型',
    'knowledge-base': '知识库',
    'dev-tools': '开发工具',
  };

  const grouped = new Map<string, typeof plugins>();
  for (const p of plugins) {
    const cat = grouped.get(p.category) || [];
    cat.push(p);
    grouped.set(p.category, cat);
  }

  for (const [category, tools] of grouped) {
    const catName = categories[category] || category;
    console.log(`  【${catName}】`);
    for (const p of tools) {
      const platforms = p.supportedPlatforms.map((pl) => {
        if (pl === 'windows') return 'Win';
        if (pl === 'macos') return 'Mac';
        return 'Linux';
      }).join('/');
      const models = [
        p.localModel ? '本地' : '',
        p.cloudModel ? '云端' : '',
      ].filter(Boolean).join('+');

      console.log(`    ${p.name.padEnd(20)} ${p.description.slice(0, 40)}`);
      console.log(`    ${''.padEnd(20)} ID: ${p.id} | 平台: ${platforms} | ${models}`);
      console.log('');
    }
  }

  console.log('安装命令:  aihub install <id>');
  console.log('帮助信息:  aihub help');
}

async function handleSearch(query: string): Promise<void> {
  if (!query) {
    logger.error('请提供搜索关键词。');
    return;
  }

  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  await pluginManager.loadPlugins();

  const results = pluginManager.searchPlugins(query);
  if (results.length === 0) {
    logger.info(`未找到 "${query}" 相关的工具`);
    return;
  }

  console.log(`搜索结果 "${query}":\n`);
  for (const p of results) {
    console.log(`  ${p.name} (${p.id})`);
    console.log(`    ${p.description}`);
    console.log(`    平台: ${p.supportedPlatforms.join(', ')}`);
    console.log('');
  }
}

async function handleStatus(toolId?: string): Promise<void> {
  const pluginManager = new PluginManager(path.join(__dirname, '..', 'installers'));
  await pluginManager.loadPlugins();

  const detector = new EnvironmentDetector();
  const env = await detector.detect();

  if (toolId) {
    const plugin = pluginManager.getPlugin(toolId);
    if (!plugin) {
      logger.error(`未知工具: ${toolId}`);
      return;
    }
    const status = await plugin.status(env);
    console.log(`${plugin.name}:`);
    console.log(`  运行状态: ${status.running ? '运行中' : '未运行'}`);
    console.log(`  健康状态: ${status.health}`);
    if (status.version) console.log(`  版本: ${status.version}`);
    if (status.port) console.log(`  端口: ${status.port}`);
  } else {
    console.log('已安装工具状态:\n');
    for (const plugin of pluginManager.listPlugins()) {
      const status = await plugin.status(env);
      const icon = status.health === 'healthy' ? '[+]' : '[-]';
      const healthText = status.health === 'healthy' ? '正常' : '未安装';
      console.log(`  ${icon} ${plugin.name.padEnd(20)} ${healthText}`);
    }
  }
}

async function handleConfig(args: string[]): Promise<void> {
  const apiManager = new ApiConfigManager();
  const subCommand = args[0];

  switch (subCommand) {
    case 'list':
      console.log('可用的 API 提供商:\n');

      console.log('  【国内可用，无需科学上网】');
      for (const p of apiManager.listProviders().filter((p) => !p.needsProxy)) {
        console.log(`    ${p.displayName.padEnd(30)} (${p.name})`);
        console.log(`      模型: ${p.models.join(', ')}`);
        console.log('');
      }

      console.log('  【需要科学上网】');
      for (const p of apiManager.listProviders().filter((p) => p.needsProxy)) {
        console.log(`    ${p.displayName.padEnd(30)} (${p.name})`);
        console.log(`      模型: ${p.models.join(', ')}`);
        console.log('');
      }
      break;

    case 'set': {
      const provider = args[1];
      const apiKey = args[2];
      if (!provider || !apiKey) {
        logger.error('用法: aihub config set <provider> <api-key>');
        return;
      }
      await apiManager.saveConfig({ provider, apiKey });
      logger.success(`API Key 已保存: ${provider}`);
      break;
    }

    case 'test': {
      const provider = args[1];
      if (!provider) {
        logger.error('用法: aihub config test <provider>');
        return;
      }
      const ok = await apiManager.testConnection(provider);
      if (ok) {
        logger.success(`${provider} 连接正常`);
      } else {
        logger.fail(`${provider} 连接失败`);
      }
      break;
    }

    default:
      console.log('API 配置管理:\n');
      console.log('  aihub config list              列出可用的 API 提供商');
      console.log('  aihub config set <prov> <key>  设置 API Key');
      console.log('  aihub config test <prov>       测试 API 连接');
      console.log('');
      console.log('推荐配置（国内可用）:');
      console.log('  aihub config set deepseek sk-xxx');
      console.log('  aihub config set kimi sk-xxx');
      console.log('  aihub config set tongyi sk-xxx');
      break;
  }
}

async function handleDoctor(): Promise<void> {
  const detector = new EnvironmentDetector();

  logger.info('正在运行系统诊断...\n');
  const env = await detector.detect();

  console.log('系统信息:');
  console.log(`  操作系统:     ${env.platform}`);
  console.log(`  架构:         ${env.arch}`);
  console.log(`  系统版本:     ${env.osVersion}`);
  console.log(`  Shell:        ${env.shellType}`);
  console.log(`  主目录:       ${env.homeDir}`);
  console.log(`  安装目录:     ${env.installDir}`);
  console.log(`  管理员权限:   ${env.isAdmin ? '是' : '否'}`);
  console.log('');

  console.log('环境依赖:');
  const checks = [
    { name: 'Node.js', ok: env.hasNode, version: env.nodeVersion },
    { name: 'Python', ok: env.hasPython, version: env.pythonVersion },
    { name: 'Git', ok: env.hasGit, version: env.gitVersion },
    { name: 'Docker', ok: env.hasDocker, version: null },
    { name: 'WSL', ok: env.hasWSL, version: null },
    { name: 'Chrome', ok: env.hasChrome, version: null },
    { name: 'GPU', ok: env.hasGPU, version: env.gpuType },
    { name: 'CUDA', ok: env.hasCUDA, version: null },
  ];

  for (const check of checks) {
    const icon = check.ok ? '[+]' : '[-]';
    const version = check.version ? ` (${check.version})` : '';
    const status = check.ok ? '已安装' : '未找到';
    console.log(`  ${icon} ${check.name.padEnd(15)} ${status}${version}`);
  }

  if (env.conflicts.length > 0) {
    console.log('\n端口冲突:');
    for (const conflict of env.conflicts) {
      console.log(`  [!] 端口 ${conflict.port} 已被占用`);
    }
  }

  console.log('\n系统已就绪，可以安装所有 AI 工具。');
}

function showHelp(): void {
  console.log(`
用法: aihub <命令> [选项]

命令:
  install <id> [--api-key KEY] [--provider PROV] [--model MODEL]
                安装 AI 助手
  uninstall <id>              卸载 AI 助手
  update <id>                 更新 AI 助手
  list                        列出所有可用的 AI 助手
  search <keyword>            搜索 AI 助手
  status [id]                 查看已安装工具状态
  config <subcommand>         管理 API 配置
  doctor                      系统诊断
  version                     查看版本

示例:
  aihub install ollama
  aihub install deepseek --api-key sk-xxx
  aihub install continue --provider deepseek --model deepseek-coder
  aihub list
  aihub doctor
  aihub config set deepseek sk-xxx

推荐工具（国内可用，无需科学上网）:
  ollama      本地大模型运行器（完全离线）
  deepseek    DeepSeek API（性价比最高）
  continue    VS Code AI 编程插件

快速安装（无需 CLI）:
  Windows:  irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex
  Linux:    curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash
  macOS:    curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash
`);
}

main().catch((err) => {
  logger.error(`致命错误: ${err.message}`);
  process.exit(1);
});
