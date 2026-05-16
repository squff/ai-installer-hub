#!/usr/bin/env bash
# Continue 插件安装器
set -e
if command -v code &>/dev/null; then
    code --install-extension Continue.continue --force
    echo "Continue 插件安装完成！重启 VS Code 即可使用"
    echo "推荐配置: DeepSeek API 或 Ollama（本地）"
else
    echo "未检测到 VS Code，请先安装: https://code.visualstudio.com/"
    echo "安装后运行: code --install-extension Continue.continue"
fi
