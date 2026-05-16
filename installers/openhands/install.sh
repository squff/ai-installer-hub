#!/usr/bin/env bash
# OpenHands 安装器（需要 Docker）
set -e
if ! command -v docker &>/dev/null; then
    echo "Docker 未安装，请先安装 Docker"
    echo "安装命令: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# 配置 Docker 中国镜像
echo "配置 Docker 中国镜像加速..."
DAEMON_JSON="/etc/docker/daemon.json"
if [ ! -f "$DAEMON_JSON" ] || ! grep -q "registry-mirrors" "$DAEMON_JSON" 2>/dev/null; then
    sudo mkdir -p /etc/docker
    echo '{"registry-mirrors": ["https://hub-mirror.c.163.com", "https://registry.docker-cn.com", "https://mirror.ccs.tencentyun.com"]}' | sudo tee "$DAEMON_JSON" > /dev/null
    sudo systemctl restart docker 2>/dev/null || true
fi

docker pull docker.all-hands.dev/all-hands-ai/runtime:latest
docker pull docker.all-hands.dev/all-hands-ai/openhands:latest
docker run -d --pull=always --name openhands \
    -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:latest \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$HOME/.openhands:/.openhands" \
    -p 3000:3000 \
    --add-host host.docker.internal:host-gateway \
    docker.all-hands.dev/all-hands-ai/openhands:latest
echo "OpenHands 已启动！访问 http://localhost:3000"
echo "注意: API 调用需要科学上网"
