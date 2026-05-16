/**
 * Core type definitions for AI Installer Hub
 */

export type Platform = 'windows' | 'linux' | 'macos';
export type Arch = 'x64' | 'arm64' | 'arm';

export interface EnvironmentInfo {
  platform: Platform;
  arch: Arch;
  osVersion: string;
  hasWSL: boolean;
  hasDocker: boolean;
  hasPython: boolean;
  pythonVersion: string | null;
  hasNode: boolean;
  nodeVersion: string | null;
  hasGit: boolean;
  gitVersion: string | null;
  hasChrome: boolean;
  hasGPU: boolean;
  gpuType: string | null;
  hasCUDA: boolean;
  homeDir: string;
  installDir: string;
  shellType: string;
  isAdmin: boolean;
  freePort: number;
  conflicts: PortConflict[];
}

export interface PortConflict {
  port: number;
  process: string;
  pid: number;
}

export interface InstallResult {
  success: boolean;
  message: string;
  installedPath?: string;
  version?: string;
  logs: string[];
  warnings: string[];
  errors: string[];
  repairAttempts: number;
}

export interface UninstallResult {
  success: boolean;
  message: string;
  logs: string[];
}

export interface UpdateResult {
  success: boolean;
  message: string;
  oldVersion?: string;
  newVersion?: string;
  logs: string[];
}

export interface Dependency {
  name: string;
  required: boolean;
  installCommand?: {
    windows?: string;
    linux?: string;
    macos?: string;
  };
  verifyCommand: string;
  minVersion?: string;
}

export interface ApiProvider {
  name: string;
  displayName: string;
  envKey: string;
  baseUrl?: string;
  models: string[];
  requiresApiKey: boolean;
}

export interface ApiConfig {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface InstallerPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  category: PluginCategory;
  tags: string[];
  icon: string;
  homepage: string;
  repository: string;
  supportedPlatforms: Platform[];
  requiresDocker: boolean;
  requiresGPU: boolean;
  localModel: boolean;
  cloudModel: boolean;
  dependencies: Dependency[];
  defaultPort: number;
  defaultApiProviders: string[];

  detect(env: EnvironmentInfo): Promise<DetectionResult>;
  preInstall(env: EnvironmentInfo): Promise<PreInstallResult>;
  install(env: EnvironmentInfo, config: InstallConfig): Promise<InstallResult>;
  postInstall(env: EnvironmentInfo, result: InstallResult): Promise<void>;
  uninstall(env: EnvironmentInfo): Promise<UninstallResult>;
  update(env: EnvironmentInfo): Promise<UpdateResult>;
  configure(env: EnvironmentInfo, apiConfig: ApiConfig): Promise<void>;
  start(env: EnvironmentInfo): Promise<void>;
  stop(env: EnvironmentInfo): Promise<void>;
  status(env: EnvironmentInfo): Promise<PluginStatus>;
}

export type PluginCategory =
  | 'coding-assistant'
  | 'chat-agent'
  | 'automation'
  | 'local-model'
  | 'knowledge-base'
  | 'dev-tools';

export interface DetectionResult {
  alreadyInstalled: boolean;
  installedVersion?: string;
  installedPath?: string;
  needsUpdate?: boolean;
  latestVersion?: string;
}

export interface PreInstallResult {
  canInstall: boolean;
  missingDependencies: Dependency[];
  warnings: string[];
  estimatedSize: string;
  estimatedTime: string;
}

export interface InstallConfig {
  installDir?: string;
  apiConfig?: ApiConfig;
  autoStart?: boolean;
  createDesktopShortcut?: boolean;
  createService?: boolean;
  mirror?: string;
}

export interface PluginStatus {
  running: boolean;
  port?: number;
  pid?: number;
  uptime?: string;
  version?: string;
  health?: 'healthy' | 'degraded' | 'unhealthy' | 'stopped';
}

export interface RepairAction {
  type: 'retry' | 'install-dep' | 'change-mirror' | 'downgrade' | 'fix-permission' | 'kill-process';
  description: string;
  execute: () => Promise<boolean>;
}

export interface RepairResult {
  fixed: boolean;
  actions: RepairAction[];
  finalError?: string;
}

export interface MirrorSource {
  name: string;
  url: string;
  region: 'global' | 'china' | 'europe' | 'asia';
  priority: number;
}
