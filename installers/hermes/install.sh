#!/usr/bin/env bash
# Hermes 安装器（中国镜像版）
set -e
INSTALL_DIR="${1:-$HOME/.ai-installer-hub/tools/hermes}"
mkdir -p "$INSTALL_DIR"
git clone --depth 1 https://mirror.ghproxy.com/https://github.com/NousResearch/Hermes.git "$INSTALL_DIR"
cd "$INSTALL_DIR"
python3 -m venv venv 2>/dev/null || python -m venv venv
./venv/bin/pip install --index-url https://pypi.tuna.tsinghua.edu.cn/simple/ -r requirements.txt 2>/dev/null || true
echo "Hermes 安装完成: $INSTALL_DIR"
