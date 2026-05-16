#!/usr/bin/env bash
# Claude Code 安装器
set -e
npm --registry https://registry.npmmirror.com install -g @anthropic-ai/claude-code
echo "Claude Code 安装完成！输入 'claude' 即可启动"
echo "注意: 需要科学上网和 Anthropic API Key"
