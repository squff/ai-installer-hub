#!/usr/bin/env bash
# Roo Code Installer
set -e
PLATFORM="$(uname -s)"
if [ "$PLATFORM" = "Darwin" ]; then
    brew install --cask roocode
else
    INSTALL_DIR="$HOME/.ai-installer-hub/tools/roocode"
    mkdir -p "$INSTALL_DIR"
    curl -L -o "$INSTALL_DIR/Roo-Code.AppImage" \
        "https://github.com/RooCodeInc/Roo-Code/releases/latest/download/Roo-Code-linux-x64.AppImage"
    chmod +x "$INSTALL_DIR/Roo-Code.AppImage"
fi
echo "Roo Code installed!"
