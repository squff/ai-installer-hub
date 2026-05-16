/**
 * API Configuration Manager - Unified API key and provider management
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ApiProvider, ApiConfig, EnvironmentInfo } from './types';
import { Logger } from '../utils/logger';

export class ApiConfigManager {
  private logger: Logger;
  private configDir: string;
  private configFile: string;

  static readonly PROVIDERS: ApiProvider[] = [
    // ===== 中国大陆可用（无需科学上网）=====
    {
      name: 'deepseek',
      displayName: 'DeepSeek（推荐）',
      envKey: 'DEEPSEEK_API_KEY',
      baseUrl: 'https://api.deepseek.com/v1',
      models: ['deepseek-chat', 'deepseek-coder'],
      requiresApiKey: true,
      needsProxy: false,
      chinaRecommended: true,
    },
    {
      name: 'kimi',
      displayName: 'Kimi（月之暗面）',
      envKey: 'KIMI_API_KEY',
      baseUrl: 'https://api.moonshot.cn/v1',
      models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
      requiresApiKey: true,
      needsProxy: false,
      chinaRecommended: true,
    },
    {
      name: 'tongyi',
      displayName: '通义千问（阿里云）',
      envKey: 'DASHSCOPE_API_KEY',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-long'],
      requiresApiKey: true,
      needsProxy: false,
      chinaRecommended: true,
    },
    {
      name: 'zhipu',
      displayName: '智谱（GLM）',
      envKey: 'ZHIPU_API_KEY',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      models: ['glm-4', 'glm-4-flash', 'glm-4v'],
      requiresApiKey: true,
      needsProxy: false,
      chinaRecommended: true,
    },
    {
      name: 'baidu',
      displayName: '百度千帆',
      envKey: 'BAIDU_API_KEY',
      baseUrl: 'https://qianfan.baidubce.com/v1',
      models: ['ernie-4.0', 'ernie-3.5', 'ernie-speed'],
      requiresApiKey: true,
      needsProxy: false,
      chinaRecommended: true,
    },
    {
      name: 'ollama',
      displayName: 'Ollama（本地，完全离线）',
      envKey: 'OLLAMA_API_KEY',
      baseUrl: 'http://localhost:11434/v1',
      models: ['qwen2.5', 'deepseek-coder', 'glm4', 'llama3.1'],
      requiresApiKey: false,
      needsProxy: false,
      chinaRecommended: true,
    },
    {
      name: 'xiaomi',
      displayName: '小米 MiMo',
      envKey: 'XIAOMI_API_KEY',
      baseUrl: 'https://api.xiaomi.com/v1',
      models: ['mimo-v2-pro', 'mimo-v2-flash'],
      requiresApiKey: true,
      needsProxy: false,
      chinaRecommended: true,
    },
    // ===== 需要科学上网 =====
    {
      name: 'openai',
      displayName: 'OpenAI（需要科学上网）',
      envKey: 'OPENAI_API_KEY',
      baseUrl: 'https://api.openai.com/v1',
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      requiresApiKey: true,
      needsProxy: true,
      chinaRecommended: false,
    },
    {
      name: 'claude',
      displayName: 'Anthropic Claude（需要科学上网）',
      envKey: 'ANTHROPIC_API_KEY',
      baseUrl: 'https://api.anthropic.com/v1',
      models: ['claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-opus-4-7'],
      requiresApiKey: true,
      needsProxy: true,
      chinaRecommended: false,
    },
    {
      name: 'gemini',
      displayName: 'Google Gemini（需要科学上网）',
      envKey: 'GEMINI_API_KEY',
      baseUrl: 'https://generativelanguage.googleapis.com/v1',
      models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
      requiresApiKey: true,
      needsProxy: true,
      chinaRecommended: false,
    },
    {
      name: 'openrouter',
      displayName: 'OpenRouter（需要科学上网）',
      envKey: 'OPENROUTER_API_KEY',
      baseUrl: 'https://openrouter.ai/api/v1',
      models: ['auto', 'anthropic/claude-sonnet-4', 'meta-llama/llama-3.1-70b-instruct'],
      requiresApiKey: true,
      needsProxy: true,
      chinaRecommended: false,
    },
  ];

  constructor() {
    this.logger = new Logger('ApiConfigManager');
    this.configDir = path.join(os.homedir(), '.ai-installer-hub');
    this.configFile = path.join(this.configDir, 'api-config.json');
  }

  async initialize(): Promise<void> {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
    if (!fs.existsSync(this.configFile)) {
      fs.writeFileSync(this.configFile, JSON.stringify({ providers: {} }, null, 2));
    }
  }

  listProviders(): ApiProvider[] {
    return ApiConfigManager.PROVIDERS;
  }

  getProvider(name: string): ApiProvider | undefined {
    return ApiConfigManager.PROVIDERS.find((p) => p.name === name);
  }

  async saveConfig(config: ApiConfig): Promise<void> {
    await this.initialize();
    const data = JSON.parse(fs.readFileSync(this.configFile, 'utf-8'));

    data.providers[config.provider] = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(this.configFile, JSON.stringify(data, null, 2));
    this.logger.info(`Saved config for ${config.provider}`);

    // Also set environment variable
    const provider = this.getProvider(config.provider);
    if (provider && config.apiKey) {
      await this.setEnvVar(provider.envKey, config.apiKey, process.env.platform as any);
    }
  }

  async getConfig(providerName: string): Promise<ApiConfig | null> {
    await this.initialize();
    const data = JSON.parse(fs.readFileSync(this.configFile, 'utf-8'));
    const config = data.providers[providerName];
    if (!config) return null;

    return {
      provider: providerName,
      ...config,
    };
  }

  async removeConfig(providerName: string): Promise<void> {
    await this.initialize();
    const data = JSON.parse(fs.readFileSync(this.configFile, 'utf-8'));
    delete data.providers[providerName];
    fs.writeFileSync(this.configFile, JSON.stringify(data, null, 2));
    this.logger.info(`Removed config for ${providerName}`);
  }

  async testConnection(providerName: string): Promise<boolean> {
    const config = await this.getConfig(providerName);
    if (!config) {
      this.logger.error(`No config found for ${providerName}`);
      return false;
    }

    const provider = this.getProvider(providerName);
    if (!provider) return false;

    try {
      const baseUrl = config.baseUrl || provider.baseUrl;
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async setEnvVar(
    key: string,
    value: string,
    platform: string
  ): Promise<void> {
    try {
      if (platform === 'win32') {
        const { execSync } = require('child_process');
        execSync(`setx ${key} "${value}"`, { encoding: 'utf-8', timeout: 10000 });
      } else {
        const shellFile = process.env.SHELL?.includes('zsh') ? '~/.zshrc' : '~/.bashrc';
        const line = `export ${key}="${value}"`;

        const fs = require('fs');
        const os = require('os');
        const shellPath = shellFile.replace('~', os.homedir());

        if (fs.existsSync(shellPath)) {
          const content = fs.readFileSync(shellPath, 'utf-8');
          if (!content.includes(key)) {
            fs.appendFileSync(shellPath, `\n${line}\n`);
          }
        } else {
          fs.writeFileSync(shellPath, `${line}\n`);
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to set env var ${key}: ${err}`);
    }
  }

  async exportEnvFile(outputPath: string, providers: string[] = []): Promise<void> {
    const lines: string[] = ['# AI Installer Hub - API Configuration', '# Generated automatically', ''];

    const allProviders = providers.length > 0
      ? providers
      : ApiConfigManager.PROVIDERS.map((p) => p.name);

    for (const name of allProviders) {
      const config = await this.getConfig(name);
      const provider = this.getProvider(name);
      if (config && provider) {
        lines.push(`# ${provider.displayName}`);
        lines.push(`${provider.envKey}=${config.apiKey || ''}`);
        if (config.baseUrl) {
          lines.push(`${provider.envKey.replace('API_KEY', 'BASE_URL')}=${config.baseUrl}`);
        }
        if (config.model) {
          lines.push(`${provider.envKey.replace('API_KEY', 'MODEL')}=${config.model}`);
        }
        lines.push('');
      }
    }

    fs.writeFileSync(outputPath, lines.join('\n'));
    this.logger.info(`Exported env file to ${outputPath}`);
  }
}
