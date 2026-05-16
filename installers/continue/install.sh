#!/usr/bin/env bash
# Continue Extension Installer
set -e
if command -v code &>/dev/null; then
    code --install-extension Continue.continue --force
    echo "Continue installed! Restart VS Code to activate."
else
    echo "VS Code not found. Install VS Code first, then run:"
    echo "  code --install-extension Continue.continue"
fi
