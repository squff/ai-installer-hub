# OpenHands Installer (requires Docker)
docker pull docker.all-hands.dev/all-hands-ai/runtime:latest
docker pull docker.all-hands.dev/all-hands-ai/openhands:latest
docker run -d --pull=always --name openhands `
    -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:latest `
    -v /var/run/docker.sock:/var/run/docker.sock `
    -v "$env:USERPROFILE\.openhands:/.openhands" `
    -p 3000:3000 `
    docker.all-hands.dev/all-hands-ai/openhands:latest
Write-Host "OpenHands running at http://localhost:3000"
