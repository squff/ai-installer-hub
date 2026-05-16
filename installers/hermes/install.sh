#!/usr/bin/env bash
# Hermes Installer
set -e
INSTALL_DIR="${1:-$HOME/.ai-installer-hub/tools/hermes}"
mkdir -p "$INSTALL_DIR"
git clone --depth 1 https://github.com/NousResearch/Hermes.git "$INSTALL_DIR"
cd "$INSTALL_DIR"
python3 -m venv venv 2>/dev/null || python -m venv venv
./venv/bin/pip install -r requirements.txt 2>/dev/null || true
echo "Hermes installed to $INSTALL_DIR"
