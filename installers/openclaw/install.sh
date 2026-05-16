#!/usr/bin/env bash
# OpenClaw Installer
set -e
INSTALL_DIR="${1:-$HOME/.ai-installer-hub/tools/openclaw}"
mkdir -p "$INSTALL_DIR"
git clone --depth 1 https://github.com/openclaw/openclaw.git "$INSTALL_DIR"
cd "$INSTALL_DIR"
npm install --production
echo "OpenClaw installed to $INSTALL_DIR"
echo "Start: cd $INSTALL_DIR && npm start"
