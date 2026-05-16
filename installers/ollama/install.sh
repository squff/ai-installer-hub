#!/usr/bin/env bash
# Ollama 安装器（中国镜像版）
set -e
PLATFORM="$(uname -s)"
if [ "$PLATFORM" = "Darwin" ]; then
    brew install ollama 2>/dev/null || {
        echo "通过 ghproxy 下载 Ollama..."
        curl -L -o /usr/local/bin/ollama "https://mirror.ghproxy.com/https://github.com/ollama/ollama/releases/latest/download/ollama-darwin"
        chmod +x /usr/local/bin/ollama
    }
else
    echo "通过 ghproxy 下载 Ollama..."
    curl -L -o /usr/local/bin/ollama "https://mirror.ghproxy.com/https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64" 2>/dev/null ||
    curl -fsSL https://ollama.com/install.sh | sh
    chmod +x /usr/local/bin/ollama 2>/dev/null || true
fi
echo "Ollama 安装完成！"
echo "推荐模型: ollama pull qwen2.5:7b（通义千问，中文优秀）"
