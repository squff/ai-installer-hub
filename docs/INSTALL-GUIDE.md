# AI 助手详细安装指南

> 面向完全不懂技术的新手，手把手教你安装每一个 AI 工具。

---

## 目录

- [安装前准备](#安装前准备)
- [第一梯队：无需科学上网（推荐）](#第一梯队无需科学上网推荐)
  - [1. Ollama — 本地大模型（最推荐）](#1-ollama--本地大模型最推荐)
  - [2. DeepSeek — 国产大模型 API](#2-deepseek--国产大模型-api)
  - [3. Continue — VS Code AI 编程插件](#3-continue--vs-code-ai-编程插件)
  - [4. AnythingLLM — 本地知识库对话](#4-anythingllm--本地知识库对话)
- [第二梯队：需要科学上网](#第二梯队需要科学上网)
  - [5. Claude Code — Anthropic 官方编程助手](#5-claude-code--anthropic-官方编程助手)
  - [6. Roo Code — AI 编程编辑器](#6-roocode--ai-编程编辑器)
  - [7. OpenClaw — 开源 AI 助手](#7-openclaw--开源-ai-助手)
  - [8. Hermes — 轻量级 AI 助手](#8-hermes--轻量级-ai-助手)
  - [9. OpenHands — AI 自动编程代理](#9-openhands--ai-自动编程代理)
- [API 配置指南](#api-配置指南)
- [常见问题](#常见问题)

---

## 安装前准备

### 你需要什么？

| 项目 | 最低要求 | 推荐配置 |
|------|---------|---------|
| 操作系统 | Windows 10 / macOS 12 / Ubuntu 20.04 | Windows 11 / 最新 macOS / Ubuntu 22.04 |
| 内存 | 8 GB | 16 GB（本地模型需要更多） |
| 硬盘空间 | 10 GB | 50 GB+ |
| 网络 | 能访问国内网站即可 | - |

### 第一步：运行一键安装器

安装器会自动帮你安装 Node.js、Git、Python 等环境依赖。

**Windows 用户：**

1. 按键盘上的 `Win + X` 键
2. 选择 **Windows PowerShell**（或 **终端**）
3. 复制下面的命令，粘贴到窗口中，按回车：

```powershell
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex
```

4. 等待安装完成（可能需要 3-10 分钟）
5. 安装器会显示一个菜单，输入数字选择要安装的工具

**macOS 用户：**

1. 按 `Command + 空格`，搜索 **终端**，打开它
2. 复制粘贴以下命令，按回车：

```bash
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash
```

**Linux 用户：**

打开终端，执行同样的命令：

```bash
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash
```

### 安装器做了什么？

运行后，安装器会自动：
- 检测你的系统类型
- 检查 Node.js 是否已安装，没有的话自动装
- 检查 Git 是否已安装，没有的话自动装
- 检查 Python 是否已安装，没有的话自动装
- 配置国内镜像源（淘宝 npm、清华 pip）
- 显示可安装的 AI 工具列表

---

## 第一梯队：无需科学上网（推荐）

> 以下工具在中国大陆可以直接使用，不需要任何代理。

---

### 1. Ollama — 本地大模型（最推荐）

**这是什么？** 让你在自己电脑上运行 AI 大模型。不联网也能用，完全免费，隐私安全。

**适合谁？** 所有人。想体验 AI 但不想花钱、不想注册账号的首选。

#### 系统要求

| 项目 | 最低要求 | 推荐 |
|------|---------|------|
| 内存 | 8 GB | 16 GB |
| 硬盘 | 5 GB（单个模型） | 20 GB+（多个模型） |
| GPU | 不需要（CPU 也能跑） | NVIDIA 显卡（速度快 10 倍） |
| 系统 | Win 10 / macOS 12 / Ubuntu 20.04 | 最新版本 |

#### 安装步骤

**方式一：一键安装器（推荐）**

运行安装器后，在菜单中输入 `1` 选择 Ollama。

**方式二：单独安装**

Windows：
```powershell
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex -Tool ollama
```

macOS / Linux：
```bash
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool ollama
```

**方式三：手动安装**

1. 访问 https://ollama.com/download
2. 下载对应系统的安装包
3. 双击安装（Windows）或拖入 Applications（macOS）

#### 安装后：下载模型

安装完 Ollama 后，需要下载模型才能使用。打开终端/PowerShell，输入：

```bash
# 推荐首选 — 通义千问 7B（中文能力最强，约 4.7GB）
ollama pull qwen2.5:7b

# 下载完后启动对话
ollama run qwen2.5:7b
```

**推荐模型列表：**

| 模型 | 大小 | 特点 | 下载命令 |
|------|------|------|---------|
| qwen2.5:7b | 4.7 GB | 中文优秀，推荐首选 | `ollama pull qwen2.5:7b` |
| qwen2.5:14b | 9 GB | 更强，需要更多内存 | `ollama pull qwen2.5:14b` |
| deepseek-coder | 3.8 GB | 编程专用 | `ollama pull deepseek-coder` |
| glm4:9b | 5.5 GB | 智谱 GLM-4 | `ollama pull glm4:9b` |
| llama3.1:8b | 4.7 GB | Meta 出品，英文优秀 | `ollama pull llama3.1:8b` |
| qwen2.5:3b | 1.9 GB | 轻量版，低配电脑可用 | `ollama pull qwen2.5:3b` |

**内存不够怎么办？**
- 8 GB 内存：选择 3b 模型（如 `qwen2.5:3b`）
- 16 GB 内存：选择 7b 模型（如 `qwen2.5:7b`）
- 32 GB+ 内存：可以选择 14b 模型

#### 注意事项

- 模型文件较大（几 GB），首次下载需要耐心等待
- 下载过程中如果断网，重新运行命令会继续下载
- 没有 GPU 也能运行，只是速度慢一些（CPU 推理）
- Ollama 自带 API 服务，地址是 `http://localhost:11434`
- 其他工具（如 Continue、AnythingLLM）可以连接本地 Ollama 使用

#### 常用命令

```bash
ollama list              # 查看已下载的模型
ollama run qwen2.5:7b    # 启动对话
ollama pull <模型名>      # 下载新模型
ollama rm <模型名>        # 删除模型
ollama serve             # 启动 API 服务（一般自动运行）
```

---

### 2. DeepSeek — 国产大模型 API

**这是什么？** DeepSeek 是国内最优秀的大模型之一，性价比极高。它通过 API 提供服务，需要注册账号获取 API Key。

**适合谁？** 需要高质量 AI 对话或编程辅助的用户。不需要科学上网，注册免费，按使用量付费（非常便宜）。

#### 安装步骤

**第一步：注册 DeepSeek 账号**

1. 打开浏览器，访问 https://platform.deepseek.com/
2. 点击"注册"，用手机号或邮箱注册
3. 登录后进入控制台

**第二步：获取 API Key**

1. 在控制台中找到 **API Keys** 菜单
2. 点击 **创建 API Key**
3. 复制生成的 Key（格式类似 `sk-xxxxxxxx`）
4. **重要：** 只会显示一次，务必保存好

**第三步：配置到安装器**

```bash
# 方式一：通过安装器配置
aihub config set deepseek "sk-你的API Key"

# 方式二：手动设置环境变量
# Windows PowerShell:
$env:DEEPSEEK_API_KEY = "sk-你的API Key"

# macOS / Linux:
export DEEPSEEK_API_KEY="sk-你的API Key"
```

**第四步：测试连接**

```bash
aihub config test deepseek
```

看到"连接正常"就说明配置成功了。

#### 注意事项

- DeepSeek 提供免费额度，足够日常使用
- API Key 相当于密码，不要泄露给他人
- 如果提示"余额不足"，需要在平台充值
- DeepSeek 的 API 地址在国内，不需要科学上网
- 推荐模型：`deepseek-chat`（通用对话）、`deepseek-coder`（编程）

#### 可以搭配使用

DeepSeek API 可以搭配以下工具使用：
- **Continue** — VS Code 编程插件
- **AnythingLLM** — 知识库对话
- **OpenClaw** — AI 助手

---

### 3. Continue — VS Code AI 编程插件

**这是什么？** 一个 VS Code 插件，让你在写代码时有 AI 帮助。可以自动补全代码、解释代码、回答编程问题。

**适合谁？** 使用 VS Code 写代码的开发者。

#### 前置条件

必须先安装 **VS Code**（微软的免费代码编辑器）。

如果还没安装 VS Code：
1. 访问 https://code.visualstudio.com/
2. 下载并安装
3. 安装完成后重启电脑

#### 安装步骤

**方式一：一键安装器**

运行安装器后，在菜单中输入 `3` 选择 Continue。

**方式二：VS Code 内安装**

1. 打开 VS Code
2. 按 `Ctrl + Shift + X`（macOS: `Cmd + Shift + X`）打开扩展面板
3. 搜索 **Continue**
4. 找到 Continue.dev，点击"安装"

**方式三：命令行安装**

```bash
code --install-extension Continue.continue
```

#### 配置 AI 模型

安装完 Continue 后，需要配置使用的 AI 模型。推荐以下几种方案：

**方案一：使用本地 Ollama（完全免费，推荐）**

1. 先安装 Ollama（参考上面的 Ollama 部分）
2. 下载模型：`ollama pull qwen2.5:7b`
3. 在 VS Code 中按 `Ctrl + Shift + P`，输入 `Continue: Open Config`
4. 在配置文件中添加：

```json
{
  "models": [
    {
      "title": "本地通义千问",
      "provider": "ollama",
      "model": "qwen2.5:7b"
    }
  ]
}
```

**方案二：使用 DeepSeek API（推荐，便宜好用）**

1. 先注册 DeepSeek 账号获取 API Key
2. 在 Continue 配置中添加：

```json
{
  "models": [
    {
      "title": "DeepSeek",
      "provider": "deepseek",
      "model": "deepseek-chat",
      "apiKey": "sk-你的API Key"
    }
  ]
}
```

#### 使用方法

- 在 VS Code 中按 `Ctrl + L` 打开 Continue 对话面板
- 选中代码后按 `Ctrl + I` 让 AI 解释或修改代码
- 在编辑器中直接输入代码，AI 会自动补全

#### 注意事项

- Continue 本身免费开源
- 使用云端 API（如 DeepSeek）会产生少量费用
- 使用本地 Ollama 则完全免费
- 重启 VS Code 后插件才会激活
- 如果面板没显示，检查左侧边栏是否有 Continue 图标

---

### 4. AnythingLLM — 本地知识库对话

**这是什么？** 把你的文档（PDF、Word、TXT 等）导入后，可以向 AI 提问文档中的内容。比如导入一本说明书，然后问"第3章讲了什么"。

**适合谁？** 需要处理大量文档的用户，如学生、研究人员、法务、财务等。

#### 系统要求

| 项目 | 要求 |
|------|------|
| 内存 | 8 GB 起步（文档多则需要更多） |
| 硬盘 | 5 GB + 文档大小 |
| 系统 | Win 10+ / macOS 12+ / Ubuntu 20.04+ |

#### 安装步骤

**Windows：**

1. 运行安装器，菜单选 `4`
2. 或者直接下载桌面版：
   - 运行安装器脚本会自动下载安装包
   - 安装包约 200 MB，双击安装即可

**macOS：**

```bash
# 通过 Homebrew 安装
brew install --cask anythingllm

# 或通过安装器
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool anythingllm
```

**Linux：**

```bash
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool anythingllm
```

#### 配置 AI 模型

AnythingLLM 支持多种 AI 模型后端：

**推荐方案一：连接本地 Ollama（免费）**

1. 先确保 Ollama 已安装并运行
2. 打开 AnythingLLM，进入 **设置 > LLM 后端**
3. 选择 **Ollama**
4. 地址填写：`http://localhost:11434`
5. 模型选择你下载的模型（如 `qwen2.5:7b`）

**推荐方案二：使用 DeepSeek API**

1. 进入 **设置 > LLM 后端**
2. 选择 **DeepSeek**
3. 填入你的 API Key

#### 使用方法

1. 打开 AnythingLLM
2. 创建一个 **工作区**（Workspace）
3. 点击 **上传文档**，选择你的 PDF/Word/TXT 文件
4. 等待文档处理完成
5. 在对话框中提问，AI 会根据文档内容回答

#### 注意事项

- 首次启动需要初始化，等待几秒
- 文档处理需要时间，大文件可能需要几分钟
- 中文文档支持良好
- 支持的文件格式：PDF、DOCX、TXT、CSV、MD 等
- 文档数据保存在本地，不会上传到云端
- 搭配 Ollama 使用可以完全离线

---

## 第二梯队：需要科学上网

> 以下工具的 API 服务在国内被屏蔽，需要自行准备科学上网工具。

---

### 5. Claude Code — Anthropic 官方编程助手

**这是什么？** Anthropic 公司开发的 AI 编程助手，被认为是目前代码能力最强的 AI 之一。它是一个命令行工具，可以在终端中直接使用。

**适合谁？** 有一定技术基础的开发者，愿意使用科学上网工具。

#### 前置条件

- 需要科学上网工具（VPN/代理）
- 需要 Anthropic 账号和 API Key

#### 安装步骤

**第一步：获取 Anthropic API Key**

1. 开启科学上网
2. 访问 https://console.anthropic.com/
3. 注册/登录账号
4. 进入 **API Keys** 页面，创建一个 Key
5. 复制保存 Key（格式 `sk-ant-xxx`）

**第二步：安装 Claude Code**

```bash
# 通过安装器
aihub install claudecode --api-key "sk-ant-你的Key"

# 或手动安装
npm install -g @anthropic-ai/claude-code
```

**第三步：设置 API Key**

```bash
# Windows PowerShell:
$env:ANTHROPIC_API_KEY = "sk-ant-你的Key"

# macOS / Linux:
export ANTHROPIC_API_KEY="sk-ant-你的Key"
```

**第四步：使用**

```bash
# 进入你的项目目录
cd 你的项目路径

# 启动 Claude Code
claude
```

#### 注意事项

- **必须科学上网**，否则无法连接 Anthropic API
- API 按使用量计费，需要在 Anthropic 控制台充值
- Claude Code 是命令行工具，没有图形界面
- 代码能力强，特别适合复杂编程任务
- API Key 需要保密，不要提交到代码仓库
- 建议设置环境变量而不是硬编码 Key

#### 费用说明

- Claude Sonnet 4: $3/百万输入 token，$15/百万输出 token
- Claude Haiku 4.5: $0.80/百万输入 token，$4/百万输出 token
- 日常使用大约几美元/天

---

### 6. Roo Code — AI 编程编辑器

**这是什么？** 基于 VS Code 的 AI 编程编辑器，内置 AI 助手功能。比单独装 VS Code + 插件更方便。

**适合谁？** 想要开箱即用 AI 编程体验的开发者。

#### 安装步骤

**Windows：**

```powershell
# 通过安装器（使用国内加速下载）
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex -Tool roocode
```

**macOS：**

```bash
brew install --cask roocode
```

**Linux：**

```bash
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool roocode
```

#### 配置 AI 模型

1. 打开 Roo Code
2. 进入 **设置 > API 配置**
3. 选择 API 提供商并填入 Key

**推荐搭配（需要科学上网）：**
- OpenAI（GPT-4o）
- Anthropic（Claude）

**可选搭配（不需要科学上网）：**
- DeepSeek API
- 本地 Ollama

#### 注意事项

- Roo Code 本身免费
- AI 功能需要 API Key，会产生费用
- 界面和 VS Code 几乎一样，VS Code 用户无需学习
- 支持 VS Code 插件生态
- 打开速度比 VS Code 稍慢（因为内置了 AI 功能）

---

### 7. OpenClaw — 开源 AI 助手

**这是什么？** 开源的 AI 助手平台，支持多种 AI 模型。

#### 安装步骤

```bash
# Windows
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex -Tool openclaw

# macOS / Linux
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool openclaw
```

#### 注意事项

- 需要 Node.js 环境（安装器自动处理）
- 支持 OpenAI、Claude 等多种 API
- 安装后访问 http://localhost:3000
- 可以搭配 DeepSeek API 使用（不需要科学上网）

---

### 8. Hermes — 轻量级 AI 助手

**这是什么？** 轻量级 AI 助手，注重对话记忆和隐私。

#### 安装步骤

```bash
# Windows
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex -Tool hermes

# macOS / Linux
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool hermes
```

#### 注意事项

- 需要 Python 环境（安装器自动处理）
- 自动创建 Python 虚拟环境
- 可以搭配 Ollama 本地模型使用
- 适合注重隐私的用户

---

### 9. OpenHands — AI 自动编程代理

**这是什么？** AI 自动编程代理，可以自主完成编程任务。你告诉它"帮我写一个网站"，它会自己写代码、调试、运行。

**适合谁？** 有 Docker 使用经验的开发者。

#### 前置条件

- **必须安装 Docker**
- 需要科学上网（API 调用）
- 建议 16 GB+ 内存

#### 安装 Docker

**Windows：**

1. 访问 https://www.docker.com/products/docker-desktop/
2. 下载 Docker Desktop
3. 安装时勾选 **使用 WSL 2 后端**
4. 安装完成后重启电脑
5. 启动 Docker Desktop，等待它完全运行

**macOS：**

```bash
brew install --cask docker
```

安装后从应用程序中启动 Docker Desktop。

**Linux：**

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# 重新登录
```

#### 安装 OpenHands

```bash
# Windows（需确保 Docker Desktop 已运行）
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex -Tool openhands

# macOS / Linux
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool openhands
```

#### 配置

1. 启动后访问 http://localhost:3000
2. 在设置中填入 API Key（OpenAI 或其他支持的提供商）

#### 注意事项

- Docker 镜像较大（几 GB），首次下载需要耐心
- 需要科学上网才能拉取镜像和调用 API
- 运行时占用资源较多
- 停止命令：`docker stop openhands`
- 重启命令：`docker start openhands`
- 不适合低配电脑

---

## API 配置指南

### 国内可用的 API（无需科学上网）

| API | 注册地址 | 推荐模型 | 特点 |
|-----|---------|---------|------|
| DeepSeek | platform.deepseek.com | deepseek-chat | 性价比最高 |
| Kimi | platform.moonshot.cn | moonshot-v1-8k | 长文本处理 |
| 通义千问 | dashscope.aliyun.com | qwen-plus | 中文优秀 |
| 智谱 | open.bigmodel.cn | glm-4 | 功能全面 |
| 百度千帆 | qianfan.baidubce.com | ernie-4.0 | 生态完善 |

### 配置方法

```bash
# 设置 API Key
aihub config set deepseek "sk-xxx"
aihub config set kimi "sk-xxx"
aihub config set tongyi "sk-xxx"

# 测试连接
aihub config test deepseek

# 查看所有配置
aihub config list
```

### 最省钱的方案

1. 安装 Ollama（免费本地模型）
2. 搭配 Continue 插件使用
3. 完全不需要花钱，不需要网络

---

## 常见问题

### Q: 安装器运行报错怎么办？

A: 
1. 确保以管理员/Root 权限运行
2. 检查网络连接
3. 运行 `aihub doctor` 查看系统诊断

### Q: 下载速度太慢？

A: 安装器已默认使用国内镜像。如果还是慢：
- 检查网络是否正常
- 尝试切换网络（比如用手机热点）
- 避开网络高峰期

### Q: Ollama 模型下载中断了？

A: 重新运行相同的 `ollama pull` 命令，会从断点继续下载。

### Q: 没有 NVIDIA 显卡能用 Ollama 吗？

A: 可以。没有 GPU 时 Ollama 会用 CPU 运行，只是速度慢一些。7B 模型在 CPU 上大约每秒生成 5-10 个字。

### Q: 8 GB 内存够用吗？

A: 
- Ollama 3b 模型：够用
- Ollama 7b 模型：勉强够用，会比较卡
- 建议选 `qwen2.5:3b`（仅需约 2 GB 内存）

### Q: API Key 泄露了怎么办？

A: 立刻去对应的平台删除旧 Key，创建新的 Key。

### Q: 可以同时安装多个工具吗？

A: 可以。它们互不影响。推荐组合：
- Ollama + Continue（免费编程助手）
- Ollama + AnythingLLM（免费知识库）
- DeepSeek + Continue（便宜好用的编程助手）

### Q: 如何卸载？

```bash
# 卸载单个工具
aihub uninstall ollama

# 卸载所有
# Windows:
Remove-Item -Recurse -Force "$env:USERPROFILE\.ai-installer-hub"

# macOS / Linux:
rm -rf ~/.ai-installer-hub
```

### Q: PowerShell 提示"无法加载脚本"？

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: macOS 提示"无法验证开发者"？

1. 打开 **系统设置 > 隐私与安全性**
2. 找到被阻止的应用，点击 **仍要打开**
3. 或者在终端运行：`sudo xattr -rd com.apple.quarantine /path/to/app`
