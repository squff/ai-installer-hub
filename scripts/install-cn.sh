#!/usr/bin/env bash
# AI 助手一键安装器 - 中国大陆版
# 使用方法: curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash

set -e

# ═══════════════════════════════════════════════════
# 配置
# ═══════════════════════════════════════════════════
INSTALL_DIR="$HOME/.ai-installer-hub"
VERSION="1.0.0"

# 国内镜像源
NPM_REGISTRY="https://registry.npmmirror.com"
PIP_INDEX="https://pypi.tuna.tsinghua.edu.cn/simple/"
GHPROXY="https://mirror.ghproxy.com"
NODEJS_MIRROR="https://npmmirror.com/mirrors/node"
DOCKER_MIRRORS=("https://registry.docker-cn.com" "https://hub-mirror.c.163.com" "https://mirror.ccs.tencentyun.com")

# ═══════════════════════════════════════════════════
# 颜色
# ═══════════════════════════════════════════════════
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ═══════════════════════════════════════════════════
# 辅助函数
# ═══════════════════════════════════════════════════
信息()    { echo -e "${BLUE}[信息]${NC} $*"; }
成功()    { echo -e "${GREEN}[成功]${NC} $*"; }
提示()    { echo -e "${YELLOW}[提示]${NC} $*"; }
失败()    { echo -e "${RED}[失败]${NC} $*"; }
步骤()    { echo -e "${GREEN}[$1/$2]${NC} $3"; }

命令存在() {
    command -v "$1" &>/dev/null
}

检测平台() {
    case "$(uname -s)" in
        Linux*)     echo "linux";;
        Darwin*)    echo "macos";;
        *)          echo "unknown";;
    esac
}

检测架构() {
    case "$(uname -m)" in
        x86_64)     echo "x64";;
        arm64|aarch64) echo "arm64";;
        *)          echo "unknown";;
    esac
}

检测发行版() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "$ID"
    elif [ "$(检测平台)" = "macos" ]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# ═══════════════════════════════════════════════════
# 配置国内镜像
# ═══════════════════════════════════════════════════
设置国内镜像() {
    信息 "配置国内镜像源..."

    # npm 镜像
    if 命令存在 npm; then
        npm config set registry "$NPM_REGISTRY" 2>/dev/null || true
        成功 "npm 镜像: $NPM_REGISTRY"
    fi

    # pip 镜像
    if 命令存在 pip3; then
        pip3 config set global.index-url "$PIP_INDEX" 2>/dev/null || true
        成功 "pip 镜像: $PIP_INDEX"
    elif 命令存在 pip; then
        pip config set global.index-url "$PIP_INDEX" 2>/dev/null || true
        成功 "pip 镜像: $PIP_INDEX"
    fi

    # Git GitHub 代理
    if 命令存在 git; then
        git config --global url."${GHPROXY}/https://github.com/".insteadOf "https://github.com/" 2>/dev/null || true
        成功 "Git GitHub 加速已启用"
    fi

    # Docker 镜像加速
    if 命令存在 docker; then
        配置Docker镜像
    fi
}

配置Docker镜像() {
    local daemon_json="/etc/docker/daemon.json"
    if [ ! -f "$daemon_json" ] || ! grep -q "registry-mirrors" "$daemon_json" 2>/dev/null; then
        信息 "配置 Docker 中国镜像加速..."
        local mirrors_json=""
        for mirror in "${DOCKER_MIRRORS[@]}"; do
            if [ -n "$mirrors_json" ]; then
                mirrors_json="$mirrors_json, "
            fi
            mirrors_json="$mirrors_json\"$mirror\""
        done

        if [ -f "$daemon_json" ]; then
            # 已有配置文件，尝试合并
            提示 "Docker daemon.json 已存在，请手动添加镜像配置"
        else
            sudo mkdir -p /etc/docker
            echo "{\"registry-mirrors\": [$mirrors_json]}" | sudo tee "$daemon_json" > /dev/null
            sudo systemctl restart docker 2>/dev/null || true
            成功 "Docker 镜像加速已配置"
        fi
    fi
}

# ═══════════════════════════════════════════════════
# 安装依赖
# ═══════════════════════════════════════════════════
安装NodeJS() {
    if 命令存在 node; then
        成功 "Node.js $(node --version) 已安装"
        return 0
    fi

    信息 "正在安装 Node.js..."
    local 平台=$(检测平台)

    if [ "$平台" = "macos" ]; then
        if 命令存在 brew; then
            brew install node@20
        else
            信息 "正在安装 Homebrew..."
            /bin/bash -c "$(curl -fsSL https://gitee.com/cunyu/homebrew-install/raw/main/install.sh)" 2>/dev/null ||
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            export PATH="/opt/homebrew/bin:$PATH"
            brew install node@20
        fi
    else
        local 发行版=$(检测发行版)
        case "$发行版" in
            ubuntu|debian)
                # 使用 NodeSource 国内镜像
                curl -fsSL https://npmmirror.com/nodesource/deb_setup_20.x | sudo -E bash - 2>/dev/null ||
                curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                sudo apt-get install -y nodejs
                ;;
            fedora|centos|rhel)
                curl -fsSL https://npmmirror.com/nodesource/rpm_setup_20.x | sudo bash - 2>/dev/null ||
                curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
                sudo dnf install -y nodejs || sudo yum install -y nodejs
                ;;
            arch)
                sudo pacman -S --noconfirm nodejs npm
                ;;
            *)
                # 使用 nvm
                curl -fsSL https://gitee.com/mirrors/nvm/raw/master/install.sh | bash 2>/dev/null ||
                curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                nvm install 20
                ;;
        esac
    fi

    if 命令存在 node; then
        成功 "Node.js $(node --version) 安装成功"
    else
        失败 "Node.js 安装失败，请手动安装: https://nodejs.org/zh-cn"
        return 1
    fi
}

安装Git() {
    if 命令存在 git; then
        成功 "Git $(git --version | awk '{print $3}') 已安装"
        return 0
    fi

    信息 "正在安装 Git..."
    local 平台=$(检测平台)

    if [ "$平台" = "macos" ]; then
        xcode-select --install 2>/dev/null || brew install git
    else
        local 发行版=$(检测发行版)
        case "$发行版" in
            ubuntu|debian)  sudo apt-get install -y git ;;
            fedora|centos|rhel) sudo dnf install -y git || sudo yum install -y git ;;
            arch)           sudo pacman -S --noconfirm git ;;
            *)              失败 "请手动安装 Git"; return 1 ;;
        esac
    fi

    if 命令存在 git; then
        成功 "Git 安装成功"
    fi
}

安装Python() {
    if 命令存在 python3; then
        成功 "Python $(python3 --version | awk '{print $2}') 已安装"
        return 0
    elif 命令存在 python; then
        成功 "Python $(python --version | awk '{print $2}') 已安装"
        return 0
    fi

    信息 "正在安装 Python..."
    local 平台=$(检测平台)

    if [ "$平台" = "macos" ]; then
        brew install python@3.12
    else
        local 发行版=$(检测发行版)
        case "$发行版" in
            ubuntu|debian)  sudo apt-get install -y python3 python3-pip python3-venv ;;
            fedora|centos|rhel) sudo dnf install -y python3 python3-pip || sudo yum install -y python3 python3-pip ;;
            arch)           sudo pacman -S --noconfirm python python-pip ;;
            *)              失败 "请手动安装 Python"; return 1 ;;
        esac
    fi

    if 命令存在 python3 || 命令存在 python; then
        成功 "Python 安装成功"
    fi
}

# ═══════════════════════════════════════════════════
# AI 工具安装
# ═══════════════════════════════════════════════════
安装AI工具() {
    local 工具ID="$1"
    local 安装路径="$INSTALL_DIR/tools/$工具ID"

    case "$工具ID" in
        claudecode)
            信息 "正在安装 Claude Code..."
            提示 "注意: Claude Code 需要科学上网才能使用"
            npm --registry "$NPM_REGISTRY" install -g @anthropic-ai/claude-code
            if [ -n "$API_KEY" ]; then
                local shell_file="$HOME/.bashrc"
                [ -f "$HOME/.zshrc" ] && shell_file="$HOME/.zshrc"
                grep -q "ANTHROPIC_API_KEY" "$shell_file" 2>/dev/null || echo "export ANTHROPIC_API_KEY=\"$API_KEY\"" >> "$shell_file"
            fi
            成功 "Claude Code 安装完成！输入 'claude' 即可启动"
            ;;

        ollama)
            信息 "正在安装 Ollama（本地大模型运行器）..."
            提示 "Ollama 完全本地运行，无需科学上网，强烈推荐！"
            local 平台=$(检测平台)
            if [ "$平台" = "macos" ]; then
                if 命令存在 brew; then
                    brew install ollama
                else
                    curl -fsSL "${GHPROXY}/https://github.com/ollama/ollama/releases/latest/download/ollama-darwin" -o /usr/local/bin/ollama
                    chmod +x /usr/local/bin/ollama
                fi
            else
                # Linux 安装，使用 ghproxy 加速
                curl -fsSL "${GHPROXY}/https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64" -o /usr/local/bin/ollama 2>/dev/null ||
                curl -fsSL https://ollama.com/install.sh | sh
                chmod +x /usr/local/bin/ollama 2>/dev/null || true
            fi
            信息 "正在下载推荐模型（通义千问 7B）..."
            ollama pull qwen2.5:7b || 提示 "模型下载将在后台继续，稍后运行: ollama pull qwen2.5:7b"
            成功 "Ollama 安装完成！"
            提示 "常用命令:"
            提示 "  ollama run qwen2.5:7b    - 启动通义千问对话"
            提示 "  ollama pull deepseek-coder - 下载 DeepSeek 编程模型"
            ;;

        continue)
            信息 "正在安装 Continue（VS Code AI 编程插件）..."
            if 命令存在 code; then
                code --install-extension Continue.continue --force
                成功 "Continue 插件安装完成！重启 VS Code 即可使用"
                提示 "推荐配置 DeepSeek API（国内可用）或 Ollama（完全离线）"
            else
                失败 "未检测到 VS Code"
                提示 "请先安装 VS Code: https://code.visualstudio.com/"
            fi
            ;;

        openclaw)
            信息 "正在安装 OpenClaw..."
            mkdir -p "$安装路径"
            git clone --depth 1 "${GHPROXY}/https://github.com/openclaw/openclaw.git" "$安装路径" 2>/dev/null || true
            cd "$安装路径"
            npm --registry "$NPM_REGISTRY" install --production
            成功 "OpenClaw 安装完成！安装目录: $安装路径"
            ;;

        hermes)
            信息 "正在安装 Hermes..."
            mkdir -p "$安装路径"
            git clone --depth 1 "${GHPROXY}/https://github.com/NousResearch/Hermes.git" "$安装路径" 2>/dev/null || true
            cd "$安装路径"
            python3 -m venv venv 2>/dev/null || python -m venv venv
            ./venv/bin/pip install --index-url "$PIP_INDEX" -r requirements.txt 2>/dev/null || true
            成功 "Hermes 安装完成！安装目录: $安装路径"
            ;;

        roocode)
            信息 "正在安装 Roo Code（AI 编程编辑器）..."
            local 平台=$(检测平台)
            if [ "$平台" = "macos" ]; then
                brew install --cask roocode 2>/dev/null || {
                    提示 "请手动下载 Roo Code: https://roocode.com"
                }
            else
                mkdir -p "$安装路径"
                curl -L -o "$安装路径/Roo-Code.AppImage" \
                    "${GHPROXY}/https://github.com/RooCodeInc/Roo-Code/releases/latest/download/Roo-Code-linux-x64.AppImage"
                chmod +x "$安装路径/Roo-Code.AppImage"
            fi
            成功 "Roo Code 安装完成！"
            ;;

        openhands)
            信息 "正在安装 OpenHands（AI 自动编程代理）..."
            提示 "注意: OpenHands 需要 Docker，且 API 调用需要科学上网"
            if ! 命令存在 docker; then
                失败 "未检测到 Docker，请先安装"
                提示 "安装命令: curl -fsSL https://get.docker.com | sh"
                return 1
            fi
            配置Docker镜像
            docker pull docker.all-hands.dev/all-hands-ai/runtime:latest
            docker pull docker.all-hands.dev/all-hands-ai/openhands:latest
            local api_key_arg=""
            [ -n "$API_KEY" ] && api_key_arg="-e LLM_API_KEY=$API_KEY"
            docker run -d --pull=always --name openhands \
                -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:latest \
                $api_key_arg \
                -v /var/run/docker.sock:/var/run/docker.sock \
                -v "$HOME/.openhands:/.openhands" \
                -p 3000:3000 \
                --add-host host.docker.internal:host-gateway \
                docker.all-hands.dev/all-hands-ai/openhands:latest
            成功 "OpenHands 已启动！访问 http://localhost:3000"
            ;;

        anythingllm)
            信息 "正在安装 AnythingLLM（本地知识库对话工具）..."
            提示 "AnythingLLM 支持本地模型（Ollama），无需科学上网"
            local 平台=$(检测平台)
            if [ "$平台" = "macos" ]; then
                brew install --cask anythingllm 2>/dev/null || {
                    mkdir -p "$安装路径"
                    git clone --depth 1 "${GHPROXY}/https://github.com/Mintplex-Labs/anything-llm.git" "$安装路径" 2>/dev/null || true
                }
            else
                mkdir -p "$安装路径"
                git clone --depth 1 "${GHPROXY}/https://github.com/Mintplex-Labs/anything-llm.git" "$安装路径" 2>/dev/null || true
                cd "$安装路径"
                命令存在 yarn || npm --registry "$NPM_REGISTRY" install -g yarn
                yarn --registry "$NPM_REGISTRY" install --production 2>/dev/null || npm --registry "$NPM_REGISTRY" install --production
            fi
            成功 "AnythingLLM 安装完成！"
            ;;

        deepseek)
            信息 "正在配置 DeepSeek API..."
            提示 "DeepSeek 是国内可用的大模型，无需科学上网，性价比极高"
            提示 "请访问 https://platform.deepseek.com/ 获取 API Key"
            if [ -n "$API_KEY" ]; then
                local shell_file="$HOME/.bashrc"
                [ -f "$HOME/.zshrc" ] && shell_file="$HOME/.zshrc"
                grep -q "DEEPSEEK_API_KEY" "$shell_file" 2>/dev/null || echo "export DEEPSEEK_API_KEY=\"$API_KEY\"" >> "$shell_file"
                成功 "DeepSeek API Key 已设置"
            else
                提示 "请手动设置环境变量 DEEPSEEK_API_KEY"
            fi
            ;;

        ollama-models)
            echo ""
            信息 "推荐下载的本地模型（无需科学上网）:"
            echo ""
            echo "  ollama pull qwen2.5:7b      - 通义千问 7B（推荐，中文优秀）"
            echo "  ollama pull qwen2.5:14b     - 通义千问 14B（更强，需更多显存）"
            echo "  ollama pull deepseek-coder  - DeepSeek Coder（编程专用）"
            echo "  ollama pull glm4:9b         - 智谱 GLM-4"
            echo "  ollama pull llama3.1:8b     - Meta Llama 3.1（英文优秀）"
            echo ""
            提示 "推荐首选: ollama pull qwen2.5:7b（通义千问，中文能力最强）"
            ;;

        *)
            失败 "未知工具: $工具ID"
            echo "  可用工具: ollama, claudecode, continue, openclaw, hermes, roocode, openhands, anythingllm, deepseek"
            return 1
            ;;
    esac
}

# ═══════════════════════════════════════════════════
# 交互菜单
# ═══════════════════════════════════════════════════
显示菜单() {
    echo ""
    echo -e "${CYAN}可安装的 AI 助手:${NC}"
    echo ""
    echo "  ┌──────────────────────────────────────────────────────┐"
    echo "  │  ${GREEN}无需科学上网（推荐）${NC}                                   │"
    echo "  ├──────────────────────────────────────────────────────┤"
    echo "  │  [1] Ollama        - 本地大模型运行器（完全离线）       │"
    echo "  │  [2] DeepSeek      - 国产大模型 API（性价比最高）      │"
    echo "  │  [3] Continue      - VS Code AI 编程插件             │"
    echo "  │  [4] AnythingLLM   - 本地知识库对话                   │"
    echo "  ├──────────────────────────────────────────────────────┤"
    echo "  │  ${YELLOW}需要科学上网${NC}                                           │"
    echo "  ├──────────────────────────────────────────────────────┤"
    echo "  │  [5] Claude Code   - Anthropic 官方编程助手           │"
    echo "  │  [6] Roo Code      - AI 编程编辑器                   │"
    echo "  │  [7] OpenClaw      - 开源 AI 助手                    │"
    echo "  │  [8] Hermes        - 轻量级 AI 助手                  │"
    echo "  │  [9] OpenHands     - AI 自动编程代理（需 Docker）     │"
    echo "  ├──────────────────────────────────────────────────────┤"
    echo "  │  [A] 推荐模型列表（Ollama）                            │"
    echo "  │  [0] 退出                                              │"
    echo "  └──────────────────────────────────────────────────────┘"
    echo ""
    read -p "请输入选项编号: " 选择

    declare -A 工具映射=(
        ["1"]="ollama"
        ["2"]="deepseek"
        ["3"]="continue"
        ["4"]="anythingllm"
        ["5"]="claudecode"
        ["6"]="roocode"
        ["7"]="openclaw"
        ["8"]="hermes"
        ["9"]="openhands"
        ["A"]="ollama-models"
    )

    if [ "$选择" = "0" ]; then
        echo "再见！"
        exit 0
    elif [ -n "${工具映射[$选择]}" ]; then
        安装AI工具 "${工具映射[$选择]}"
    else
        失败 "无效选项，请输入 0-9 或 A"
    fi
}

# ═══════════════════════════════════════════════════
# 解析参数
# ═══════════════════════════════════════════════════
解析参数() {
    TOOL=""
    API_KEY=""
    PROVIDER=""
    MODEL=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            --tool)     TOOL="$2"; shift 2 ;;
            --api-key)  API_KEY="$2"; shift 2 ;;
            --provider) PROVIDER="$2"; shift 2 ;;
            --model)    MODEL="$2"; shift 2 ;;
            --help|-h)
                echo ""
                echo "AI 助手一键安装器 - 中国大陆版"
                echo ""
                echo "使用方法:"
                echo "  install-cn.sh [--tool 工具名] [--api-key 密钥]"
                echo ""
                echo "示例:"
                echo "  curl -fsSL .../install-cn.sh | bash"
                echo "  curl -fsSL .../install-cn.sh | bash -s -- --tool ollama"
                echo "  curl -fsSL .../install-cn.sh | bash -s -- --tool deepseek --api-key sk-xxx"
                echo ""
                echo "推荐工具（国内可用）:"
                echo "  ollama      - 本地大模型，完全离线"
                echo "  deepseek    - DeepSeek API，无需科学上网"
                echo "  continue    - VS Code AI 插件"
                exit 0
                ;;
            *) shift ;;
        esac
    done
}

# ═══════════════════════════════════════════════════
# 主函数
# ═══════════════════════════════════════════════════
主函数() {
    local 平台=$(检测平台)
    local 架构=$(检测架构)

    echo ""
    echo -e "${CYAN}========================================================${NC}"
    echo -e "${CYAN}   AI 助手一键安装器 v$VERSION - 中国大陆特供版${NC}"
    echo -e "${CYAN}========================================================${NC}"
    echo ""

    解析参数 "$@"

    # 系统信息
    echo -e "${CYAN}系统检测:${NC}"
    echo "  操作系统: $平台 ($架构)"
    echo "  发行版:   $(检测发行版)"
    echo "  用户:     $(whoami)"
    echo ""

    # 检查 sudo 权限
    if [ "$(id -u)" -ne 0 ] && [ "$平台" = "linux" ]; then
        if ! sudo -n true 2>/dev/null; then
            提示 "安装过程可能需要 sudo 权限"
        fi
    fi

    # 设置国内镜像
    设置国内镜像
    echo ""

    # 安装依赖
    echo -e "${CYAN}检查环境依赖:${NC}"
    步骤 1 3 "检查 Node.js..."
    安装NodeJS

    步骤 2 3 "检查 Git..."
    安装Git

    步骤 3 3 "检查 Python..."
    安装Python

    echo ""

    # 安装工具
    if [ -n "$TOOL" ]; then
        echo -e "${CYAN}正在安装 $TOOL...${NC}"
        安装AI工具 "$TOOL"
    else
        显示菜单
    fi

    echo ""
    echo -e "${GREEN}========================================================${NC}"
    echo -e "${GREEN}  安装完成！${NC}"
    echo -e "${GREEN}========================================================${NC}"
    echo ""
    echo "  常用命令:"
    echo "    aihub list          - 查看所有可用工具"
    echo "    aihub status        - 查看已安装工具状态"
    echo "    aihub doctor        - 系统诊断"
    echo "    aihub config list   - 查看 API 配置"
    echo ""
    echo "  推荐 API（国内可用，无需科学上网）:"
    echo "    DeepSeek:  https://platform.deepseek.com/"
    echo "    Kimi:      https://platform.moonshot.cn/"
    echo "    通义千问:  https://dashscope.aliyun.com/"
    echo "    智谱:      https://open.bigmodel.cn/"
    echo ""
}

主函数 "$@"
