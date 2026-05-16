<div align="center">

![AI 助手一键安装器](https://img.shields.io/badge/AI%20%E5%8A%A9%E6%89%8B%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85%E5%99%A8-v1.0-blue?style=for-the-badge)

### [>>  产品官网（全部功能一览）  <<](https://squff.github.io/ai-installer-hub/index-cn.html)

**点击上方链接，查看最完整的功能展示和使用说明。**

</div>

---

<div align="center">

# AI 助手一键安装器

**一行命令，安装任意 AI 助手。无需技术基础，小白也能用。**

[![CI](https://github.com/squff/ai-installer-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/squff/ai-installer-hub/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](#系统要求)
[![Docs](https://img.shields.io/badge/Docs-中文-blue.svg)](docs/)
[![GitHub stars](https://img.shields.io/github/stars/squff/ai-installer-hub?style=social)](https://github.com/squff/ai-installer-hub)

</div>

---

## 目录

- [这是什么？](#这是什么)
- [一键安装](#一键安装)
- [可安装的 AI 工具](#可安装的-ai-工具)
  - [无需科学上网（推荐）](#无需科学上网推荐)
  - [需要科学上网](#需要科学上网)
- [省钱方案组合](#省钱方案组合)
- [本地模型推荐（Ollama）](#本地模型推荐ollama)
- [国内可用 API](#国内可用-api)
- [使用教程](#使用教程)
- [管理已安装的工具](#管理已安装的工具)
- [开发者指南](#开发者指南)
- [系统要求](#系统要求)
- [常见问题](#常见问题)
- [项目结构](#项目结构)
- [参与贡献](#参与贡献)
- [相关链接](#相关链接)
- [许可证](#许可证)

---

## 这是什么？

**AI 助手一键安装器** 让你用一行命令就能安装主流 AI 工具。

不需要懂 Docker、Python、Node.js，不需要配置环境变量，不需要折腾依赖冲突。

**就像安装 QQ 一样简单。**

- 自动检测系统环境
- 自动安装缺失依赖（Node.js / Git / Python）
- 自动使用国内镜像加速下载
- 全中文交互界面
- 支持 9 款主流 AI 工具的安装和管理

> **[查看完整产品官网 >>](https://squff.github.io/ai-installer-hub/index-cn.html)**

---

## 一键安装

### Windows

打开 PowerShell（按 `Win + X`），粘贴回车：

```powershell
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex
```

### Linux / macOS

打开终端，粘贴回车：

```bash
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash
```

安装器会自动：检查系统环境 → 安装依赖 → 使用国内镜像加速 → 显示工具列表让你选择

### 安装指定工具

```powershell
# Windows — 安装 Ollama
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex -Tool ollama

# Windows — 安装 Continue
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex -Tool continue
```

```bash
# Linux/macOS — 安装 Ollama
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool ollama

# Linux/macOS — 配置 DeepSeek API
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool deepseek --api-key "sk-xxx"
```

---

## 可安装的 AI 工具

### 无需科学上网（推荐）

| 工具 | 功能 | 本地/云端 | 系统要求 |
|------|------|----------|---------|
| [**Ollama**](https://ollama.com) | 在电脑上运行大模型，完全离线 | 本地 | Win / Mac / Linux |
| [**Continue**](https://continue.dev) | VS Code AI 编程插件 | 本地 + 云端 | Win / Mac / Linux |
| [**AnythingLLM**](https://anythingllm.com) | 和你的文档对话（RAG 知识库） | 本地 + 云端 | Win / Mac / Linux |

### 需要科学上网

| 工具 | 功能 | 本地/云端 | 系统要求 |
|------|------|----------|---------|
| [**Claude Code**](https://docs.anthropic.com/en/docs/claude-code) | Anthropic 官方编程助手 | 云端 | Win / Mac / Linux |
| [**Roo Code**](https://roocode.com) | AI 编程编辑器（VS Code 增强版） | 本地 + 云端 | Win / Mac / Linux |
| [**OpenClaw**](https://github.com/openclaw) | 开源 AI 助手 | 本地 + 云端 | Win / Mac / Linux |
| [**Hermes**](https://github.com/NousResearch) | 轻量级 AI 助手 | 本地 + 云端 | Win / Mac / Linux |
| [**OpenHands**](https://www.all-hands.dev) | AI 自动编程代理（需 Docker） | 云端 | Mac / Linux |

> **每个工具的完整安装步骤、注意事项、常见问题：[docs/INSTALL-GUIDE.md](docs/INSTALL-GUIDE.md)**

---

## 省钱方案组合

不想花钱也能用 AI！以下是推荐的免费 / 低成本方案：

### 方案一：完全免费（推荐新手）

```
Ollama（本地模型） + Continue（VS Code 插件）
```

- 花费：**0 元**
- 需要：8 GB 内存，5 GB 硬盘
- 安装：`aihub install ollama` + `aihub install continue`
- 详见 [INSTALL-GUIDE - Ollama](docs/INSTALL-GUIDE.md#1-ollama--本地大模型最推荐) + [INSTALL-GUIDE - Continue](docs/INSTALL-GUIDE.md#3-continue--vs-code-ai-编程插件)

### 方案二：便宜好用（推荐程序员）

```
DeepSeek API + Continue（VS Code 插件）
```

- 花费：**每天几毛钱**
- 需要：注册 DeepSeek 获取 API Key
- 安装：`aihub config set deepseek "sk-xxx"` + `aihub install continue`
- 详见 [INSTALL-GUIDE - DeepSeek](docs/INSTALL-GUIDE.md#2-deepseek--国产大模型-api)

### 方案三：本地知识库（推荐研究/法务/财务）

```
Ollama（本地模型） + AnythingLLM（文档对话）
```

- 花费：**0 元**（完全离线）
- 需要：16 GB 内存推荐，导入 PDF/Word/TXT
- 安装：`aihub install ollama` + `aihub install anythingllm`
- 详见 [INSTALL-GUIDE - AnythingLLM](docs/INSTALL-GUIDE.md#4-anythingllm--本地知识库对话)

---

## 本地模型推荐（Ollama）

安装 Ollama 后，下载模型即可使用（无需网络）：

| 模型 | 大小 | 内存要求 | 特点 | 下载命令 |
|------|------|---------|------|---------|
| qwen2.5:7b | 4.7 GB | 8 GB+ | 中文能力最强，推荐首选 | `ollama pull qwen2.5:7b` |
| qwen2.5:14b | 9 GB | 16 GB+ | 更强，推理能力出色 | `ollama pull qwen2.5:14b` |
| deepseek-coder | 3.8 GB | 8 GB+ | 编程专用 | `ollama pull deepseek-coder` |
| glm4:9b | 5.5 GB | 8 GB+ | 智谱 GLM-4 | `ollama pull glm4:9b` |
| llama3.1:8b | 4.7 GB | 8 GB+ | Meta 出品，英文优秀 | `ollama pull llama3.1:8b` |
| qwen2.5:3b | 1.9 GB | 4 GB+ | 轻量版，低配电脑首选 | `ollama pull qwen2.5:3b` |

> 更多模型推荐：[INSTALL-GUIDE - Ollama 模型列表](docs/INSTALL-GUIDE.md#安装后下载模型)

---

## 国内可用 API

无需科学上网，注册即可使用：

| API | 注册地址 | 推荐模型 | 特点 |
|-----|---------|---------|------|
| **DeepSeek** | [platform.deepseek.com](https://platform.deepseek.com/) | deepseek-chat | 性价比最高，国内首选 |
| **Kimi (月之暗面)** | [platform.moonshot.cn](https://platform.moonshot.cn/) | moonshot-v1-8k | 长文本处理能力强 |
| **通义千问** | [dashscope.aliyun.com](https://dashscope.aliyun.com/) | qwen-plus | 阿里云出品，中文优秀 |
| **智谱 GLM** | [open.bigmodel.cn](https://open.bigmodel.cn/) | glm-4 | 清华出品，功能全面 |
| **Ollama** | 无需注册 | 本地模型 | 完全免费，离线使用 |

配置 API Key：

```bash
aihub config set deepseek "sk-xxx"
aihub config set kimi "sk-xxx"
aihub config test deepseek
```

> 更多 API 配置指南：[INSTALL-GUIDE - API 配置](docs/INSTALL-GUIDE.md#api-配置指南)

---

## 使用教程

### 第一步：运行安装器

```powershell
# Windows
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex
```

### 第二步：选择工具

安装器会显示菜单，输入数字选择你想安装的 AI 工具。

### 第三步：安装依赖

安装器自动处理 Node.js、Python、Git 等依赖，你只需等待。

### 第四步：配置模型

根据所选工具，下载本地模型或配置 API Key。

### 第五步：开始使用

启动工具，享受 AI 带来的便利。

### 第六步：管理工具

```bash
aihub list      # 查看所有可用工具
aihub status    # 查看已安装状态
aihub update    # 更新工具
aihub doctor    # 系统诊断
```

---

## 管理已安装的工具

```bash
# 查看所有可用工具
aihub list

# 查看已安装状态
aihub status

# 更新工具
aihub update ollama

# 卸载工具
aihub uninstall ollama

# 系统诊断
aihub doctor

# API 配置管理
aihub config list                    # 查看所有配置
aihub config set deepseek "sk-xxx"   # 设置 API Key
aihub config test deepseek           # 测试连接
```

> 更多管理命令：[docs/INSTALL-GUIDE.md - 常见问题](docs/INSTALL-GUIDE.md#常见问题)

---

## 开发者指南

```bash
# 克隆项目
git clone https://github.com/squff/ai-installer-hub.git
cd ai-installer-hub

# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 测试 CLI
node dist/index.js list
node dist/index.js doctor

# 运行测试
npm test
```

| 文档 | 内容 |
|------|------|
| [贡献指南](docs/CONTRIBUTING.md) | 如何参与项目开发 |
| [插件开发](docs/PLUGIN_DEVELOPMENT.md) | 如何为新 AI 工具编写安装插件 |
| [API 参考](docs/API.md) | CLI 命令和 TypeScript API 文档 |
| [CI/CD](.github/workflows/) | 持续集成和自动发布工作流 |

---

## 系统要求

| 项目 | 最低要求 | 推荐配置 |
|------|---------|---------|
| 操作系统 | Windows 10 / macOS 12 / Ubuntu 20.04 | Windows 11 / 最新 macOS / Ubuntu 22.04 |
| 内存 | 8 GB | 16 GB（本地模型需要更多） |
| 硬盘空间 | 10 GB | 50 GB+ |
| 网络 | 能访问国内网站即可 | — |

安装器会自动处理：Node.js 安装 · Python 安装 · Git 安装 · 环境变量配置 · 权限问题修复 · 国内镜像加速

---

## 常见问题

<details>
<summary><b>下载速度很慢？</b></summary>

安装器已默认使用国内镜像（淘宝 NPM、清华 PyPI、ghproxy 加速）。如果还是很慢：
- 检查网络连接
- 尝试切换网络（比如用手机热点）
- 避开网络高峰期
</details>

<details>
<summary><b>Ollama 模型下载失败？</b></summary>

```bash
# 手动设置 Ollama 镜像（如果需要）
export OLLAMA_HOST=0.0.0.0
ollama pull qwen2.5:7b
```

重新运行相同的 `ollama pull` 命令会从断点继续下载。
</details>

<details>
<summary><b>PowerShell 提示"无法加载脚本"？</b></summary>

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
</details>

<details>
<summary><b>安装后找不到命令？</b></summary>

重启终端。如果还不行：

- **Windows:** 检查 `C:\Program Files\nodejs` 是否在 PATH 中
- **Linux/macOS:** 在 `~/.bashrc` 或 `~/.zshrc` 中添加 `export PATH="$PATH:/usr/local/bin"`
</details>

<details>
<summary><b>8 GB 内存够用吗？</b></summary>

- Ollama 3b 模型：够用
- Ollama 7b 模型：勉强够用，会比较卡
- 推荐选择 `qwen2.5:3b`（仅需约 2 GB 内存）
</details>

<details>
<summary><b>没有 NVIDIA 显卡能用吗？</b></summary>

可以。没有 GPU 时 Ollama 会用 CPU 运行，只是速度慢一些。7B 模型在 CPU 上大约每秒生成 5-10 个字。
</details>

<details>
<summary><b>API Key 泄露了怎么办？</b></summary>

立刻去对应的平台删除旧 Key，创建新的 Key。建议通过环境变量设置 Key，不要硬编码在代码中。
</details>

<details>
<summary><b>可以同时安装多个工具吗？</b></summary>

可以，它们互不影响。推荐组合：
- Ollama + Continue（免费编程助手）
- Ollama + AnythingLLM（免费知识库）
- DeepSeek + Continue（便宜好用的编程助手）
</details>

<details>
<summary><b>如何卸载？</b></summary>

```bash
# 卸载单个工具
aihub uninstall ollama

# 卸载所有（Windows）
Remove-Item -Recurse -Force "$env:USERPROFILE\.ai-installer-hub"

# 卸载所有（macOS / Linux）
rm -rf ~/.ai-installer-hub
```
</details>

> 更多问题：[INSTALL-GUIDE.md - 完整 FAQ](docs/INSTALL-GUIDE.md#常见问题)

---

## 项目结构

```
ai-installer-hub/
├── scripts/
│   ├── install-cn.ps1        # Windows 中文版一键安装
│   ├── install-cn.sh         # Linux/macOS 中文版一键安装
│   ├── install.ps1           # Windows 国际版
│   ├── install.sh            # Linux/macOS 国际版
│   └── uninstall.ps1         # 卸载脚本
├── src/
│   ├── index.ts              # CLI 入口
│   ├── core/
│   │   ├── types.ts          # 类型定义
│   │   ├── api-config.ts     # API 配置中心（含国内 API）
│   │   ├── mirror-manager.ts # 国内镜像管理器
│   │   ├── env-detector.ts   # 系统环境检测
│   │   ├── plugin-manager.ts # 插件管理器
│   │   ├── dependency-installer.ts  # 依赖自动安装
│   │   └── auto-repair.ts    # 自动修复系统
│   ├── plugins/              # AI 工具插件（8 个）
│   │   ├── ollama.ts
│   │   ├── continue.ts
│   │   ├── anythingllm.ts
│   │   ├── claudecode.ts
│   │   ├── roocode.ts
│   │   ├── openclaw.ts
│   │   ├── hermes.ts
│   │   └── openhands.ts
│   └── utils/
│       ├── logger.ts
│       └── helpers.ts
├── installers/               # 各工具独立安装脚本
│   ├── ollama/               # Ollama 安装器
│   ├── continue/             # Continue 安装器
│   ├── anythingllm/          # AnythingLLM 安装器
│   ├── claudecode/           # Claude Code 安装器
│   ├── roocode/              # Roo Code 安装器
│   ├── openclaw/             # OpenClaw 安装器
│   ├── hermes/               # Hermes 安装器
│   └── openhands/            # OpenHands 安装器
├── docs/
│   ├── index-cn.html         # 中文产品官网（最详细）
│   ├── index.html            # 英文产品官网
│   ├── INSTALL-GUIDE.md      # 详细安装指南（每个工具完整步骤）
│   ├── INSTALL-CN.md         # 中文安装快速指南
│   ├── INSTALL.md            # 英文安装指南
│   ├── CONTRIBUTING.md       # 贡献指南
│   ├── PLUGIN_DEVELOPMENT.md # 插件开发指南
│   └── API.md                # API 参考文档
├── .github/workflows/
│   ├── ci.yml                # 持续集成
│   ├── release.yml           # 自动发布
│   └── compatibility.yml     # 多平台兼容性测试
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

---

## 参与贡献

欢迎贡献！详见 [贡献指南](docs/CONTRIBUTING.md)。

我们特别需要：
- 更多 AI 工具的安装器 — [插件开发指南](docs/PLUGIN_DEVELOPMENT.md)
- 更多 Linux 发行版的测试
- 文档翻译
- 错误信息优化

---

## 相关链接

| 链接 | 说明 |
|------|------|
| [产品官网](https://squff.github.io/ai-installer-hub/index-cn.html) | 最完整的功能展示 |
| [详细安装指南](docs/INSTALL-GUIDE.md) | 每个工具的完整步骤 |
| [快速安装指南](docs/INSTALL-CN.md) | 中文安装快速指南 |
| [贡献指南](docs/CONTRIBUTING.md) | 如何参与开发 |
| [插件开发](docs/PLUGIN_DEVELOPMENT.md) | 如何添加新工具 |
| [API 参考](docs/API.md) | CLI 和 TypeScript API |
| [英文文档](docs/INSTALL.md) | English Installation Guide |

---

## 许可证

[MIT License](LICENSE)

---

<div align="center">

**AI Agent 时代的统一安装平台**

*一行命令，人人可用。*

[![GitHub](https://img.shields.io/badge/GitHub-squff/ai--installer--hub-181717?logo=github)](https://github.com/squff/ai-installer-hub)
[![Stars](https://img.shields.io/github/stars/squff/ai-installer-hub?style=social)](https://github.com/squff/ai-installer-hub)

</div>
