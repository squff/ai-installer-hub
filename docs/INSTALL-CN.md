# 安装指南（中国大陆版）

## 一键安装

### Windows

1. 按 `Win + X`，选择 **Windows PowerShell**
2. 复制粘贴以下命令，按回车：

```powershell
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex
```

3. 等待安装完成，按提示选择要安装的 AI 工具

### Linux

打开终端，复制粘贴：

```bash
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash
```

### macOS

打开终端（Terminal），复制粘贴：

```bash
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash
```

## 安装指定工具

不需要交互菜单？直接指定工具名：

### Windows

```powershell
# 安装 Ollama（本地大模型，推荐）
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex -Tool ollama

# 安装 Continue（VS Code 插件）
irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex -Tool continue
```

### Linux / macOS

```bash
curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash -s -- --tool ollama
```

## 推荐安装顺序

如果你是第一次使用，推荐这个顺序：

1. **先装 Ollama** — 完全免费，无需联网
   ```bash
   # 安装后下载中文模型
   ollama pull qwen2.5:7b
   ```

2. **再装 Continue** — VS Code 编程插件，搭配 Ollama 使用
   - 打开 VS Code，配置 Continue 使用本地 Ollama

3. **按需装其他工具** — 根据你的需要选择

## 国内可用 API

这些 API 不需要科学上网，注册就能用：

### DeepSeek（推荐）

- 地址: https://platform.deepseek.com/
- 特点: 性价比最高，中文能力优秀
- 配置:
  ```bash
  aihub config set deepseek "sk-xxx"
  ```

### Kimi（月之暗面）

- 地址: https://platform.moonshot.cn/
- 特点: 长文本处理能力突出
- 配置:
  ```bash
  aihub config set kimi "sk-xxx"
  ```

### 通义千问（阿里云）

- 地址: https://dashscope.aliyun.com/
- 特点: 阿里云出品，中文理解优秀
- 配置:
  ```bash
  aihub config set tongyi "sk-xxx"
  ```

### 智谱 GLM

- 地址: https://open.bigmodel.cn/
- 特点: 清华大学出品，功能全面
- 配置:
  ```bash
  aihub config set zhipu "sk-xxx"
  ```

## 卸载

### 卸载单个工具

```bash
aihub uninstall ollama
```

### 卸载所有

```bash
# Windows
Remove-Item -Recurse -Force "$env:USERPROFILE\.ai-installer-hub"

# Linux / macOS
rm -rf ~/.ai-installer-hub
```

## 故障排除

### PowerShell 无法运行脚本

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 下载速度慢

安装器已自动使用国内镜像。如果还是慢：
- 检查网络连接
- 尝试切换网络（如手机热点）

### Node.js 安装失败

手动安装: https://nodejs.org/zh-cn/download

### Git 安装失败

手动安装: https://git-scm.com/downloads

### 端口被占用

```bash
# 查看端口占用
aihub doctor
```

### 找不到已安装的工具

重启终端。如果还不行，检查 PATH 环境变量。
