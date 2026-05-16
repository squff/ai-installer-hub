#!/usr/bin/env bash
# AI Installer Hub - Linux/macOS One-Click Installer
# Usage: curl -fsSL https://ai-installer-hub.github.io/install.sh | bash

set -e

# ═══════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════
REPO_URL="https://github.com/squff/ai-installer-hub"
INSTALL_DIR="$HOME/.ai-installer-hub"
VERSION="1.0.0"

# ═══════════════════════════════════════════════════
# Colors
# ═══════════════════════════════════════════════════
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ═══════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════
info()    { echo -e "${BLUE}[i]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC} $*"; }
warn()    { echo -e "${YELLOW}[!]${NC} $*"; }
fail()    { echo -e "${RED}[FAIL]${NC} $*"; }
step()    { echo -e "${GREEN}[$1/$2]${NC} $3"; }

command_exists() {
    command -v "$1" &>/dev/null
}

detect_platform() {
    case "$(uname -s)" in
        Linux*)     echo "linux";;
        Darwin*)    echo "macos";;
        *)          echo "unknown";;
    esac
}

detect_arch() {
    case "$(uname -m)" in
        x86_64)     echo "x64";;
        arm64|aarch64) echo "arm64";;
        *)          echo "unknown";;
    esac
}

detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "$ID"
    elif [ "$(detect_platform)" = "macos" ]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# ═══════════════════════════════════════════════════
# Installation Functions
# ═══════════════════════════════════════════════════
install_nodejs() {
    if command_exists node; then
        success "Node.js $(node --version) is already installed"
        return 0
    fi

    info "Installing Node.js..."
    local platform=$(detect_platform)

    if [ "$platform" = "macos" ]; then
        if command_exists brew; then
            brew install node@20
        else
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
            nvm install 20
        fi
    else
        local distro=$(detect_distro)
        case "$distro" in
            ubuntu|debian)
                curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                sudo apt-get install -y nodejs
                ;;
            fedora|centos|rhel)
                curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
                sudo dnf install -y nodejs || sudo yum install -y nodejs
                ;;
            arch)
                sudo pacman -S --noconfirm nodejs npm
                ;;
            *)
                curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                nvm install 20
                ;;
        esac
    fi

    if command_exists node; then
        success "Node.js $(node --version) installed"
    else
        fail "Failed to install Node.js"
        return 1
    fi
}

install_git() {
    if command_exists git; then
        success "Git $(git --version | awk '{print $3}') is already installed"
        return 0
    fi

    info "Installing Git..."
    local platform=$(detect_platform)

    if [ "$platform" = "macos" ]; then
        xcode-select --install 2>/dev/null || brew install git
    else
        local distro=$(detect_distro)
        case "$distro" in
            ubuntu|debian)  sudo apt-get install -y git ;;
            fedora|centos|rhel) sudo dnf install -y git || sudo yum install -y git ;;
            arch)           sudo pacman -S --noconfirm git ;;
            *)              fail "Please install Git manually"; return 1 ;;
        esac
    fi

    if command_exists git; then
        success "Git installed"
    fi
}

install_python() {
    if command_exists python3; then
        success "Python $(python3 --version | awk '{print $2}') is already installed"
        return 0
    elif command_exists python; then
        success "Python $(python --version | awk '{print $2}') is already installed"
        return 0
    fi

    info "Installing Python..."
    local platform=$(detect_platform)

    if [ "$platform" = "macos" ]; then
        brew install python@3.12
    else
        local distro=$(detect_distro)
        case "$distro" in
            ubuntu|debian)  sudo apt-get install -y python3 python3-pip python3-venv ;;
            fedora|centos|rhel) sudo dnf install -y python3 python3-pip || sudo yum install -y python3 python3-pip ;;
            arch)           sudo pacman -S --noconfirm python python-pip ;;
            *)              fail "Please install Python manually"; return 1 ;;
        esac
    fi

    if command_exists python3 || command_exists python; then
        success "Python installed"
    fi
}

install_docker() {
    if command_exists docker; then
        success "Docker is already installed"
        return 0
    fi

    info "Installing Docker..."
    local platform=$(detect_platform)

    if [ "$platform" = "macos" ]; then
        brew install --cask docker
        warn "Please launch Docker Desktop from Applications"
    else
        curl -fsSL https://get.docker.com | sudo sh
        sudo usermod -aG docker "$USER"
        sudo systemctl enable docker
        sudo systemctl start docker
        success "Docker installed (log out and back in for non-root access)"
    fi
}

# ═══════════════════════════════════════════════════
# AI Tool Installation
# ═══════════════════════════════════════════════════
install_ai_tool() {
    local tool_id="$1"
    local install_path="$INSTALL_DIR/tools/$tool_id"

    case "$tool_id" in
        claudecode)
            info "Installing Claude Code..."
            npm install -g @anthropic-ai/claude-code
            if [ -n "$API_KEY" ]; then
                local shell_file="$HOME/.bashrc"
                [ -f "$HOME/.zshrc" ] && shell_file="$HOME/.zshrc"
                grep -q "ANTHROPIC_API_KEY" "$shell_file" 2>/dev/null || echo "export ANTHROPIC_API_KEY=\"$API_KEY\"" >> "$shell_file"
            fi
            success "Claude Code installed! Run 'claude' to start."
            ;;

        ollama)
            info "Installing Ollama..."
            local platform=$(detect_platform)
            if [ "$platform" = "macos" ]; then
                brew install ollama
            else
                curl -fsSL https://ollama.com/install.sh | sh
            fi
            info "Pulling default model (llama3.2:3b)..."
            ollama pull llama3.2:3b || warn "Model download will continue in background"
            success "Ollama installed! Run 'ollama run llama3.2' to start."
            ;;

        continue)
            info "Installing Continue extension..."
            if command_exists code; then
                code --install-extension Continue.continue --force
                success "Continue installed! Restart VS Code to activate."
            else
                warn "VS Code not found. Install VS Code first, then run:"
                echo "  code --install-extension Continue.continue"
            fi
            ;;

        openclaw)
            info "Installing OpenClaw..."
            mkdir -p "$install_path"
            git clone --depth 1 https://github.com/openclaw/openclaw.git "$install_path" 2>/dev/null || true
            cd "$install_path"
            npm install --production
            success "OpenClaw installed to $install_path"
            ;;

        hermes)
            info "Installing Hermes..."
            mkdir -p "$install_path"
            git clone --depth 1 https://github.com/NousResearch/Hermes.git "$install_path" 2>/dev/null || true
            cd "$install_path"
            python3 -m venv venv 2>/dev/null || python -m venv venv
            ./venv/bin/pip install -r requirements.txt 2>/dev/null || true
            success "Hermes installed to $install_path"
            ;;

        roocode)
            info "Installing Roo Code..."
            local platform=$(detect_platform)
            if [ "$platform" = "macos" ]; then
                brew install --cask roocode
            else
                mkdir -p "$install_path"
                curl -L -o "$install_path/Roo-Code.AppImage" \
                    "https://github.com/RooCodeInc/Roo-Code/releases/latest/download/Roo-Code-linux-x64.AppImage"
                chmod +x "$install_path/Roo-Code.AppImage"
            fi
            success "Roo Code installed!"
            ;;

        openhands)
            info "Installing OpenHands (requires Docker)..."
            if ! command_exists docker; then
                fail "Docker is required for OpenHands. Install Docker first."
                return 1
            fi
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
            success "OpenHands running at http://localhost:3000"
            ;;

        anythingllm)
            info "Installing AnythingLLM..."
            local platform=$(detect_platform)
            if [ "$platform" = "macos" ]; then
                brew install --cask anythingllm
            else
                mkdir -p "$install_path"
                git clone --depth 1 https://github.com/Mintplex-Labs/anything-llm.git "$install_path" 2>/dev/null || true
                cd "$install_path"
                command_exists yarn || npm install -g yarn
                yarn install --production 2>/dev/null || npm install --production
            fi
            success "AnythingLLM installed!"
            ;;

        *)
            fail "Unknown tool: $tool_id"
            echo "  Available: claudecode, ollama, continue, openclaw, hermes, roocode, openhands, anythingllm"
            return 1
            ;;
    esac
}

# ═══════════════════════════════════════════════════
# Interactive Menu
# ═══════════════════════════════════════════════════
show_menu() {
    echo ""
    echo -e "${CYAN}Available AI Assistants:${NC}"
    echo ""
    echo "  [1] Claude Code     - AI coding assistant (Anthropic)"
    echo "  [2] Ollama          - Run LLMs locally"
    echo "  [3] Continue        - VS Code AI extension"
    echo "  [4] OpenClaw        - Open-source AI assistant"
    echo "  [5] Hermes          - Lightweight AI with memory"
    echo "  [6] Roo Code        - AI-powered VS Code fork"
    echo "  [7] OpenHands       - Autonomous coding agent"
    echo "  [8] AnythingLLM     - Chat with your documents"
    echo "  [9] Install ALL"
    echo "  [C] 切换到中文版（中国用户）"
    echo "  [0] Exit"
    echo ""
    read -p "Enter your choice (0-9): " choice

    local tool_map=("" "claudecode" "ollama" "continue" "openclaw" "hermes" "roocode" "openhands" "anythingllm")

    if [ "$choice" = "9" ]; then
        for id in "${tool_map[@]:1}"; do
            echo ""
            echo -e "${YELLOW}--- Installing $id ---${NC}"
            install_ai_tool "$id"
        done
    elif [ "$choice" = "C" ] || [ "$choice" = "c" ]; then
        echo -e "${YELLOW}切换到中文版...${NC}"
        curl -fsSL https://squff.github.io/ai-installer-hub/install-cn.sh | bash
        exit 0
    elif [ "$choice" -ge 1 ] && [ "$choice" -le 8 ] 2>/dev/null; then
        install_ai_tool "${tool_map[$choice]}"
    elif [ "$choice" = "0" ]; then
        echo "Goodbye!"
        exit 0
    else
        fail "Invalid choice."
    fi
}

# ═══════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════
main() {
    local platform=$(detect_platform)
    local arch=$(detect_arch)

    echo ""
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}  AI Installer Hub v$VERSION - One-Click AI Assistant Setup${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo ""

    # Parse arguments
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
                echo "Usage: install.sh [--tool TOOL] [--api-key KEY] [--provider PROV] [--model MODEL]"
                echo ""
                echo "Examples:"
                echo "  curl -fsSL https://aihub.dev/install.sh | bash"
                echo "  curl -fsSL https://aihub.dev/install.sh | bash -s -- --tool ollama"
                echo "  curl -fsSL https://aihub.dev/install.sh | bash -s -- --tool claudecode --api-key sk-xxx"
                exit 0
                ;;
            *) shift ;;
        esac
    done

    # System info
    echo -e "${CYAN}System Check:${NC}"
    echo "  Platform:  $platform ($arch)"
    echo "  Distro:    $(detect_distro)"
    echo "  User:      $(whoami)"
    echo ""

    # Check sudo access
    if [ "$(id -u)" -ne 0 ] && [ "$platform" = "linux" ]; then
        if ! sudo -n true 2>/dev/null; then
            warn "This script may need sudo access for some installations."
        fi
    fi

    # Install dependencies
    echo -e "${CYAN}Checking Dependencies:${NC}"
    step 1 3 "Checking Node.js..."
    install_nodejs

    step 2 3 "Checking Git..."
    install_git

    step 3 3 "Checking Python..."
    install_python

    echo ""

    # Install tool
    if [ -n "$TOOL" ]; then
        echo -e "${CYAN}Installing $TOOL...${NC}"
        install_ai_tool "$TOOL"
    else
        show_menu
    fi

    echo ""
    echo -e "${GREEN}============================================================${NC}"
    echo -e "${GREEN}  Installation Complete!${NC}"
    echo -e "${GREEN}============================================================${NC}"
    echo ""
    echo "  Manage tools:     aihub list"
    echo "  Check status:     aihub status"
    echo "  Run diagnostics:  aihub doctor"
    echo "  Configure APIs:   aihub config list"
    echo ""
    echo "  Documentation:    $REPO_URL"
    echo ""
}

main "$@"
