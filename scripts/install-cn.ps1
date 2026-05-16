# AI 助手一键安装器 - 中国大陆版
# 使用方法: irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex

param(
    [string]$Tool,
    [string]$ApiKey,
    [string]$Provider,
    [string]$Model
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# ═══════════════════════════════════════════════════
# 配置
# ═══════════════════════════════════════════════════
$INSTALL_DIR = "$env:USERPROFILE\.ai-installer-hub"
$VERSION = "1.0.0"

# 国内镜像源
$MIRRORS = @{
    NPM       = "https://registry.npmmirror.com"
    PIP       = "https://pypi.tuna.tsinghua.edu.cn/simple/"
    GHPROXY   = "https://mirror.ghproxy.com"
    NODEJS    = "https://npmmirror.com/mirrors/node"
    DOCKER_CN = "https://registry.docker-cn.com"
    DOCKER_AE = "https://hub-mirror.c.163.com"
}

# ═══════════════════════════════════════════════════
# 辅助函数
# ═══════════════════════════════════════════════════
function 写-彩色($文本, $颜色 = "White") {
    Write-Host $文本 -ForegroundColor $颜色
}

function 写-步骤($步骤, $总计, $消息) {
    Write-Host "[$步骤/$总计] " -ForegroundColor Green -NoNewline
    Write-Host $消息
}

function 写-成功($消息) {
    Write-Host "[成功] " -ForegroundColor Green -NoNewline
    Write-Host $消息
}

function 写-失败($消息) {
    Write-Host "[失败] " -ForegroundColor Red -NoNewline
    Write-Host $消息
}

function 写-提示($消息) {
    Write-Host "[提示] " -ForegroundColor Yellow -NoNewline
    Write-Host $消息
}

function 写-信息($消息) {
    Write-Host "[信息] " -ForegroundColor Cyan -NoNewline
    Write-Host $消息
}

function 命令存在($命令) {
    try {
        Get-Command $命令 -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# ═══════════════════════════════════════════════════
# 配置国内镜像
# ═══════════════════════════════════════════════════
function 设置-国内镜像() {
    写-信息 "配置国内镜像源..."

    # npm 镜像
    try { npm config set registry $MIRRORS.NPM 2>$null } catch {}
    写-成功 "npm 镜像: $($MIRRORS.NPM)"

    # pip 镜像
    try {
        python -m pip config set global.index-url $MIRRORS.PIP 2>$null
        写-成功 "pip 镜像: $($MIRRORS.PIP)"
    } catch {}

    # Git 全局配置（GitHub 代理）
    try { git config --global url."$($MIRRORS.GHPROXY)/https://github.com/".insteadOf "https://github.com/" 2>$null } catch {}
}

# ═══════════════════════════════════════════════════
# 安装依赖
# ═══════════════════════════════════════════════════
function 安装-NodeJS() {
    if (命令存在 "node") {
        $版本 = node --version
        写-成功 "Node.js $版本 已安装"
        return $true
    }

    写-信息 "正在安装 Node.js..."
    try {
        # 使用国内镜像下载
        $版本号 = "v20.11.1"
        $文件名 = "node-${版本号}-x64.msi"
        $下载地址 = "$($MIRRORS.NODEJS)/${版本号}/$文件名"
        $临时文件 = "$env:TEMP\node-installer.msi"

        写-信息 "下载地址: $下载地址"
        Invoke-WebRequest -Uri $下载地址 -OutFile $临时文件
        Start-Process msiexec.exe -ArgumentList "/i $临时文件 /quiet /norestart" -Wait
        Remove-Item $临时文件 -Force -ErrorAction SilentlyContinue

        # 刷新环境变量
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        if (命令存在 "node") {
            写-成功 "Node.js 安装成功"
            return $true
        }
    } catch {
        写-失败 "Node.js 安装失败: $_"
        写-提示 "请手动安装 Node.js: https://nodejs.org/zh-cn"
        return $false
    }
    return $false
}

function 安装-Git() {
    if (命令存在 "git") {
        $版本 = git --version
        写-成功 "$版本 已安装"
        return $true
    }

    写-信息 "正在安装 Git..."
    try {
        # 使用国内镜像下载 Git for Windows
        $下载地址 = "$($MIRRORS.GHPROXY)/https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/Git-2.44.0-64-bit.exe"
        $临时文件 = "$env:TEMP\git-installer.exe"

        写-信息 "下载 Git for Windows（使用国内加速）..."
        Invoke-WebRequest -Uri $下载地址 -OutFile $临时文件
        Start-Process -FilePath $临时文件 -ArgumentList "/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS" -Wait
        Remove-Item $临时文件 -Force -ErrorAction SilentlyContinue

        # 刷新环境变量
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        if (命令存在 "git") {
            写-成功 "Git 安装成功"
            return $true
        }
    } catch {
        写-失败 "Git 安装失败: $_"
        写-提示 "请手动安装 Git: https://git-scm.com/downloads"
        return $false
    }
    return $false
}

function 安装-Python() {
    if (命令存在 "python") {
        $版本 = python --version 2>&1
        写-成功 "$版本 已安装"
        return $true
    }

    写-信息 "正在安装 Python..."
    try {
        # 使用国内镜像下载
        $下载地址 = "https://registry.npmmirror.com/-/binary/python/3.12.3/python-3.12.3-amd64.exe"
        $临时文件 = "$env:TEMP\python-installer.exe"

        写-信息 "下载 Python（使用国内加速）..."
        Invoke-WebRequest -Uri $下载地址 -OutFile $临时文件
        Start-Process -FilePath $临时文件 -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
        Remove-Item $临时文件 -Force -ErrorAction SilentlyContinue

        # 刷新环境变量
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        if (命令存在 "python") {
            写-成功 "Python 安装成功"
            return $true
        }
    } catch {
        写-失败 "Python 安装失败: $_"
        写-提示 "请手动安装 Python: https://www.python.org/downloads/"
        return $false
    }
    return $false
}

# ═══════════════════════════════════════════════════
# AI 工具安装
# ═══════════════════════════════════════════════════
function 安装-AI工具($工具ID) {
    switch ($工具ID) {
        "claudecode" {
            写-信息 "正在安装 Claude Code..."
            写-提示 "注意: Claude Code 需要科学上网才能使用（Anthropic API 在国内被屏蔽）"
            npm --registry $MIRRORS.NPM install -g @anthropic-ai/claude-code
            if ($ApiKey) {
                [System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", $ApiKey, "User")
                $env:ANTHROPIC_API_KEY = $ApiKey
            }
            写-成功 "Claude Code 安装完成！输入 'claude' 即可启动"
            写-提示 "需要设置 ANTHROPIC_API_KEY 环境变量（需科学上网）"
        }
        "ollama" {
            写-信息 "正在安装 Ollama（本地大模型运行器）..."
            写-提示 "Ollama 完全本地运行，无需科学上网，推荐！"
            $下载地址 = "$($MIRRORS.GHPROXY)/https://github.com/ollama/ollama/releases/latest/download/OllamaSetup.exe"
            $临时文件 = "$env:TEMP\OllamaSetup.exe"
            写-信息 "下载 Ollama 安装包（使用国内加速）..."
            Invoke-WebRequest -Uri $下载地址 -OutFile $临时文件
            写-信息 "正在运行安装程序，请在弹出窗口中完成安装..."
            Start-Process -FilePath $临时文件 -Wait
            Remove-Item $临时文件 -Force -ErrorAction SilentlyContinue
            写-成功 "Ollama 安装完成！"
            写-提示 "推荐下载模型: ollama pull qwen2.5:7b (通义千问)"
        }
        "continue" {
            写-信息 "正在安装 Continue（VS Code AI 编程插件）..."
            if (命令存在 "code") {
                code --install-extension Continue.continue --force
                写-成功 "Continue 插件安装完成！重启 VS Code 即可使用"
                写-提示 "推荐配置: DeepSeek API（国内可用，无需科学上网）"
            } else {
                写-失败 "未检测到 VS Code"
                写-提示 "请先安装 VS Code: https://code.visualstudio.com/"
                写-提示 "安装后运行: code --install-extension Continue.continue"
            }
        }
        "openclaw" {
            写-信息 "正在安装 OpenClaw..."
            $安装目录 = "$INSTALL_DIR\tools\openclaw"
            if (-not (Test-Path $安装目录)) { New-Item -ItemType Directory -Path $安装目录 -Force | Out-Null }
            git clone --depth 1 "$($MIRRORS.GHPROXY)/https://github.com/openclaw/openclaw.git" $安装目录
            Push-Location $安装目录
            npm --registry $MIRRORS.NPM install --production
            Pop-Location
            写-成功 "OpenClaw 安装完成！安装目录: $安装目录"
        }
        "hermes" {
            写-信息 "正在安装 Hermes..."
            $安装目录 = "$INSTALL_DIR\tools\hermes"
            if (-not (Test-Path $安装目录)) { New-Item -ItemType Directory -Path $安装目录 -Force | Out-Null }
            git clone --depth 1 "$($MIRRORS.GHPROXY)/https://github.com/NousResearch/Hermes.git" $安装目录
            Push-Location $安装目录
            python -m venv venv
            & "$安装目录\venv\Scripts\pip" install --index-url $MIRRORS.PIP -r requirements.txt 2>$null
            Pop-Location
            写-成功 "Hermes 安装完成！安装目录: $安装目录"
        }
        "roocode" {
            写-信息 "正在安装 Roo Code（AI 编程编辑器）..."
            $下载地址 = "$($MIRRORS.GHPROXY)/https://github.com/RooCodeInc/Roo-Code/releases/latest/download/Roo-Code-win32-x64.exe"
            $临时文件 = "$env:TEMP\roocode-installer.exe"
            写-信息 "下载 Roo Code 安装包（使用国内加速）..."
            Invoke-WebRequest -Uri $下载地址 -OutFile $临时文件
            Start-Process -FilePath $临时文件 -Wait
            Remove-Item $临时文件 -Force -ErrorAction SilentlyContinue
            写-成功 "Roo Code 安装完成！从开始菜单启动即可"
        }
        "openhands" {
            写-信息 "正在安装 OpenHands（AI 自动编程代理）..."
            写-提示 "注意: OpenHands 需要 Docker，且 API 调用需要科学上网"
            if (-not (命令存在 "docker")) {
                写-失败 "未检测到 Docker，请先安装 Docker Desktop"
                写-提示 "下载地址: https://www.docker.com/products/docker-desktop/"
                写-提示 "安装后需启用 WSL2 后端"
                return
            }
            # 配置 Docker 中国镜像
            写-信息 "配置 Docker 中国镜像加速..."
            docker pull docker.all-hands.dev/all-hands-ai/runtime:latest
            docker pull docker.all-hands.dev/all-hands-ai/openhands:latest
            $apiKeyParam = if ($ApiKey) { "-e LLM_API_KEY=$ApiKey" } else { "" }
            docker run -d --pull=always --name openhands `
                -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:latest `
                $apiKeyParam `
                -v /var/run/docker.sock:/var/run/docker.sock `
                -v "$env:USERPROFILE\.openhands:/.openhands" `
                -p 3000:3000 `
                docker.all-hands.dev/all-hands-ai/openhands:latest
            写-成功 "OpenHands 已启动！访问 http://localhost:3000"
        }
        "anythingllm" {
            写-信息 "正在安装 AnythingLLM（本地知识库对话工具）..."
            写-提示 "AnythingLLM 支持本地模型（Ollama），无需科学上网"
            $下载地址 = "$($MIRRORS.GHPROXY)/https://github.com/Mintplex-Labs/anything-llm/releases/latest/download/AnythingLLMDesktop.exe"
            $临时文件 = "$env:TEMP\AnythingLLMDesktop.exe"
            写-信息 "下载 AnythingLLM 安装包（使用国内加速）..."
            Invoke-WebRequest -Uri $下载地址 -OutFile $临时文件
            Start-Process -FilePath $临时文件 -Wait
            Remove-Item $临时文件 -Force -ErrorAction SilentlyContinue
            写-成功 "AnythingLLM 安装完成！从开始菜单启动即可"
        }
        "deepseek" {
            写-信息 "正在配置 DeepSeek API..."
            写-提示 "DeepSeek 是国内可用的大模型，无需科学上网，性价比极高"
            写-提示 "请访问 https://platform.deepseek.com/ 获取 API Key"
            if ($ApiKey) {
                [System.Environment]::SetEnvironmentVariable("DEEPSEEK_API_KEY", $ApiKey, "User")
                $env:DEEPSEEK_API_KEY = $ApiKey
                写-成功 "DeepSeek API Key 已设置"
            } else {
                写-提示 "请手动设置环境变量 DEEPSEEK_API_KEY"
            }
        }
        "ollama-models" {
            写-信息 "推荐下载的本地模型（无需科学上网）:"
            写-信息 "  ollama pull qwen2.5:7b     - 通义千问 7B（推荐，中文优秀）"
            写-信息 "  ollama pull qwen2.5:14b    - 通义千问 14B（更强，需更多显存）"
            写-信息 "  ollama pull deepseek-coder - DeepSeek Coder（编程专用）"
            写-信息 "  ollama pull glm4:9b        - 智谱 GLM-4"
            写-信息 "  ollama pull llama3.1:8b    - Meta Llama 3.1（英文优秀）"
            写-提示 "推荐首选: qwen2.5:7b（通义千问，中文能力最强）"
        }
        default {
            写-失败 "未知工具: $工具ID"
        }
    }
}

# ═══════════════════════════════════════════════════
# 主流程
# ═══════════════════════════════════════════════════
function 主函数() {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host "   AI 助手一键安装器 v$VERSION - 中国大陆特供版" -ForegroundColor Cyan
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host ""

    # 检查管理员权限
    $是否管理员 = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $是否管理员) {
        写-提示 "当前非管理员权限，部分安装可能需要管理员权限"
    }

    # 系统信息
    Write-Host "系统检测:" -ForegroundColor Cyan
    Write-Host "  操作系统: Windows $(if ([Environment]::Is64BitOperatingSystem) { '64位' } else { '32位' })"
    Write-Host "  系统版本: $([System.Environment]::OSVersion.Version)"
    Write-Host ""

    # 设置国内镜像
    设置-国内镜像
    Write-Host ""

    # 安装依赖
    Write-Host "检查环境依赖:" -ForegroundColor Cyan
    $总计 = 3
    $当前 = 1

    写-步骤 $当前 $总计 "检查 Node.js..."
    $当前++
    $nodeOk = 安装-NodeJS

    写-步骤 $当前 $总计 "检查 Git..."
    $当前++
    $gitOk = 安装-Git

    写-步骤 $当前 $总计 "检查 Python..."
    $当前++
    $pythonOk = 安装-Python

    Write-Host ""

    # 安装指定工具
    if ($Tool) {
        写-信息 "正在安装 $Tool..."
        安装-AI工具 $Tool
    } else {
        # 交互式菜单
        Write-Host "可安装的 AI 助手:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  ┌──────────────────────────────────────────────────────┐"
        Write-Host "  │  无需科学上网（推荐）                                   │"
        Write-Host "  ├──────────────────────────────────────────────────────┤"
        Write-Host "  │  [1] Ollama        - 本地大模型运行器（完全离线）       │"
        Write-Host "  │  [2] DeepSeek      - 国产大模型 API（性价比最高）      │"
        Write-Host "  │  [3] Continue      - VS Code AI 编程插件             │"
        Write-Host "  │  [4] AnythingLLM   - 本地知识库对话（支持文档问答）    │"
        Write-Host "  ├──────────────────────────────────────────────────────┤"
        Write-Host "  │  需要科学上网                                           │"
        Write-Host "  ├──────────────────────────────────────────────────────┤"
        Write-Host "  │  [5] Claude Code   - Anthropic 官方编程助手           │"
        Write-Host "  │  [6] OpenClaw      - 开源 AI 助手                    │"
        Write-Host "  │  [7] Hermes        - 轻量级 AI 助手                  │"
        Write-Host "  │  [8] Roo Code      - AI 编程编辑器                   │"
        Write-Host "  │  [9] OpenHands     - AI 自动编程代理（需 Docker）     │"
        Write-Host "  ├──────────────────────────────────────────────────────┤"
        Write-Host "  │  [A] 推荐模型列表（Ollama）                            │"
        Write-Host "  │  [0] 退出                                              │"
        Write-Host "  └──────────────────────────────────────────────────────┘"
        Write-Host ""

        $选择 = Read-Host "请输入选项编号"

        $工具映射 = @{
            "1" = "ollama"
            "2" = "deepseek"
            "3" = "continue"
            "4" = "anythingllm"
            "5" = "claudecode"
            "6" = "openclaw"
            "7" = "hermes"
            "8" = "roocode"
            "9" = "openhands"
            "A" = "ollama-models"
        }

        if ($工具映射.ContainsKey($选择)) {
            安装-AI工具 $工具映射[$选择]
        } elseif ($选择 -eq "0") {
            Write-Host "再见！"
            return
        } else {
            写-失败 "无效选项，请输入 0-9 或 A"
            return
        }
    }

    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  安装完成！" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  常用命令:"
    Write-Host "    aihub list          - 查看所有可用工具"
    Write-Host "    aihub status        - 查看已安装工具状态"
    Write-Host "    aihub doctor        - 系统诊断"
    Write-Host "    aihub config list   - 查看 API 配置"
    Write-Host ""
    Write-Host "  推荐 API（国内可用，无需科学上网）:"
    Write-Host "    DeepSeek:  https://platform.deepseek.com/"
    Write-Host "    Kimi:      https://platform.moonshot.cn/"
    Write-Host "    通义千问:  https://dashscope.aliyun.com/"
    Write-Host "    智谱:      https://open.bigmodel.cn/"
    Write-Host ""
}

# 运行主函数
主函数
