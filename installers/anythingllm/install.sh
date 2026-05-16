#!/usr/bin/env bash
# AnythingLLM 安装器（中国镜像版）
set -e
PLATFORM="$(uname -s)"
if [ "$PLATFORM" = "Darwin" ]; then
    brew install --cask anythingllm
else
    INSTALL_DIR="$HOME/.ai-installer-hub/tools/anythingllm"
    mkdir -p "$INSTALL_DIR"
    git clone --depth 1 https://mirror.ghproxy.com/https://github.com/Mintplex-Labs/anything-llm.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    command -v yarn &>/dev/null || npm --registry https://registry.npmmirror.com install -g yarn
    yarn --registry https://registry.npmmirror.com install --production 2>/dev/null || npm --registry https://registry.npmmirror.com install --production
fi
echo "AnythingLLM 安装完成！"
echo "支持本地模型（Ollama），无需科学上网"
