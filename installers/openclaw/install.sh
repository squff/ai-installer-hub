#!/usr/bin/env bash
# OpenClaw 安装器（中国镜像版）
set -e
INSTALL_DIR="${1:-$HOME/.ai-installer-hub/tools/openclaw}"
mkdir -p "$INSTALL_DIR"
git clone --depth 1 https://mirror.ghproxy.com/https://github.com/openclaw/openclaw.git "$INSTALL_DIR"
cd "$INSTALL_DIR"
npm --registry https://registry.npmmirror.com install --production
echo "OpenClaw 安装完成: $INSTALL_DIR"
echo "启动: cd $INSTALL_DIR && npm start"
