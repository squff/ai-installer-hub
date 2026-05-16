#!/usr/bin/env bash
# OpenHands Installer (requires Docker)
set -e
if ! command -v docker &>/dev/null; then
    echo "Docker is required. Install Docker first."
    exit 1
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
echo "OpenHands running at http://localhost:3000"
