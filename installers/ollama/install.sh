#!/usr/bin/env bash
# Ollama Installer
set -e
PLATFORM="$(uname -s)"
if [ "$PLATFORM" = "Darwin" ]; then
    brew install ollama
else
    curl -fsSL https://ollama.com/install.sh | sh
fi
echo "Ollama installed! Run 'ollama run llama3.2' to start."
