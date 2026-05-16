<div align="center">

# AI 助手一键安装器

### 一行命令，安装任意 AI 助手

*无需技术基础，小白也能用。*

---

[![CI](https://github.com/squff/ai-installer-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/squff/ai-installer-hub/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 这是什么？

**AI 助手一键安装器** 让你用一行命令就能安装主流 AI 工具。

不需要懂 Docker、Python、Node.js，不需要配置环境变量，不需要折腾依赖冲突。

**就像安装 QQ 一样简单。**

---

## 一键安装（推荐）

### Windows

打开 PowerShell，粘贴回车：

```powershell
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex
```

### Linux / macOS

打开终端，粘贴回车：

```bash
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash
```

安装器会自动：
1. 检查你的系统环境
2. 安装缺失的依赖（Node.js、Git、Python）
3. 使用国内镜像加速下载
4. 显示工具列表让你选择

---

## 安装指定工具

### Windows

```powershell
# 安装 Ollama（本地大模型，完全离线，推荐！）
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex -Tool ollama

# 安装 Continue（VS Code AI 插件）
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex -Tool continue
```

### Linux / macOS

```bash
# 安装 Ollama
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool ollama

# 安装 DeepSeek API 配置
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool deepseek --api-key "sk-xxx"
```

---

## 可安装的 AI 助手

### 无需科学上网（推荐）

| 工具 | 功能 | 本地/云端 | 系统要求 |
|------|------|----------|---------|
| [**Ollama**](https://ollama.com) | 在电脑上运行大模型，完全离线 | 本地 | Win/Mac/Linux |
| [**Continue**](https://continue.dev) | VS Code AI 编程插件 | 本地+云端 | Win/Mac/Linux |
| [**AnythingLLM**](https://anythingllm.com) | 和你的文档对话（RAG 知识库） | 本地+云端 | Win/Mac/Linux |

### 需要科学上网

| 工具 | 功能 | 本地/云端 | 系统要求 |
|------|------|----------|---------|
| [**Claude Code**](https://docs.anthropic.com/en/docs/claude-code) | Anthropic 官方编程助手 | 云端 | Win/Mac/Linux |
| [**Roo Code**](https://roocode.com) | AI 编程编辑器（VS Code 增强版） | 本地+云端 | Win/Mac/Linux |
| [**OpenClaw**](https://github.com/openclaw) | 开源 AI 助手 | 本地+云端 | Win/Mac/Linux |
| [**Hermes**](https://github.com/NousResearch) | 轻量级 AI 助手 | 本地+云端 | Win/Mac/Linux |
| [**OpenHands**](https://www.all-hands.dev) | AI 自动编程代理（需 Docker） | 云端 | Mac/Linux |

---

## 推荐 API（国内可用）

无需科学上网，注册即可使用：

| API | 特点 | 获取地址 |
|-----|------|---------|
| **DeepSeek** | 性价比最高，国内首选 | [platform.deepseek.com](https://platform.deepseek.com/) |
| **Kimi** | 长文本处理能力强 | [platform.moonshot.cn](https://platform.moonshot.cn/) |
| **通义千问** | 阿里云出品，中文优秀 | [dashscope.aliyun.com](https://dashscope.aliyun.com/) |
| **智谱 GLM** | 清华出品，功能全面 | [open.bigmodel.cn](https://open.bigmodel.cn/) |
| **Ollama** | 本地运行，完全免费 | 安装后直接使用，无需注册 |

配置 API Key：

```bash
aihub config set deepseek "sk-xxx"
aihub config set kimi "sk-xxx"
aihub config test deepseek
```

---

## 推荐的本地模型（Ollama）

安装 Ollama 后，下载这些模型（无需网络即可使用）：

```bash
# 推荐首选（中文能力最强）
ollama pull qwen2.5:7b

# 编程专用
ollama pull deepseek-coder

# 更大更强
ollama pull qwen2.5:14b

# 智谱 GLM-4
ollama pull glm4:9b
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

# 查看 API 配置
aihub config list
```

---

## 系统要求

- **Windows:** Windows 10/11（64位）
- **macOS:** macOS 12+
- **Linux:** Ubuntu 20.04+、Fedora 36+、Arch 等
- **磁盘空间:** 每个工具 1-5 GB
- **内存:** 8 GB 起步（16 GB 推荐，本地模型需要更多）

安装器会自动处理：
- Node.js 安装
- Python 安装
- Git 安装
- 环境变量配置
- 权限问题修复
- 国内镜像加速

---

## 常见问题

### 下载速度很慢？

安装器已默认使用国内镜像（淘宝 NPM、清华 PyPI、ghproxy 加速）。如果还是很慢，可能是网络问题，建议检查网络连接。

### Ollama 模型下载失败？

```bash
# 手动设置 Ollama 镜像（如果需要）
export OLLAMA_HOST=0.0.0.0
ollama pull qwen2.5:7b
```

### PowerShell 提示"无法加载脚本"？

```powershell
# 运行此命令允许脚本执行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 安装后找不到命令？

重启终端。如果还不行：

**Windows:** 检查 `C:\Program Files\nodejs` 是否在 PATH 中。

**Linux/macOS:** 在 `~/.bashrc` 或 `~/.zshrc` 中添加：
```bash
export PATH="$PATH:/usr/local/bin"
```

### 需要科学上网的工具怎么用？

你需要自行准备科学上网工具。安装器只负责安装软件，不提供代理服务。

---

## 项目结构

```
ai-installer-hub/
  scripts/
    install-cn.ps1    # Windows 中文版一键安装
    install-cn.sh     # Linux/macOS 中文版一键安装
    install.ps1       # Windows 国际版
    install.sh        # Linux/macOS 国际版
  src/
    core/             # 核心框架
    plugins/          # AI 工具插件
    utils/            # 工具函数
  installers/         # 独立安装脚本
  docs/               # 文档
  .github/workflows/  # CI/CD 自动化
```

---

## 开发者

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

---

## 参与贡献

欢迎贡献！详见 [贡献指南](docs/CONTRIBUTING.md)。

我们特别需要：
- 更多 AI 工具的安装器
- 更多 Linux 发行版的测试
- 文档翻译
- 错误信息优化

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE)。

---

<div align="center">

**AI Agent 时代的统一安装平台**

*一行命令，人人可用。*

</div>
