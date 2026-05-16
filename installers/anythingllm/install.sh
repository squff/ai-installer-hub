#!/usr/bin/env bash
# AnythingLLM Installer
set -e
PLATFORM="$(uname -s)"
if [ "$PLATFORM" = "Darwin" ]; then
    brew install --cask anythingllm
else
    INSTALL_DIR="$HOME/.ai-installer-hub/tools/anythingllm"
    mkdir -p "$INSTALL_DIR"
    git clone --depth 1 https://github.com/Mintplex-Labs/anything-llm.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    command -v yarn &>/dev/null || npm install -g yarn
    yarn install --production 2>/dev/null || npm install --production
fi
echo "AnythingLLM installed!"
