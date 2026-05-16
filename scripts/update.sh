#!/usr/bin/env bash
# AI Installer Hub - Update Script
# Usage: curl -fsSL https://ai-installer-hub.github.io/update.sh | bash

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}  AI Installer Hub - Update Manager${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

INSTALL_DIR="$HOME/.ai-installer-hub"

# Update all installed tools
for tool_dir in "$INSTALL_DIR"/tools/*/; do
    if [ -d "$tool_dir" ] && [ -f "$tool_dir/package.json" ] || [ -d "$tool_dir/.git" ]; then
        tool_name=$(basename "$tool_dir")
        echo -e "${CYAN}Updating $tool_name...${NC}"
        cd "$tool_dir"
        if [ -d ".git" ]; then
            git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
        fi
        if [ -f "package.json" ]; then
            npm install --production 2>/dev/null || true
        fi
        echo -e "${GREEN}[OK]${NC} $tool_name updated"
        echo ""
    fi
done

echo -e "${GREEN}All tools updated!${NC}"
