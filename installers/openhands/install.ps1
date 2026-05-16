# OpenHands 安装器（需要 Docker）
Write-Host "注意: OpenHands 需要 Docker Desktop，且 API 调用需要科学上网"

# 配置 Docker 中国镜像
Write-Host "配置 Docker 中国镜像加速..."
$daemonJson = "$env:ProgramData\docker\config\daemon.json"
$daemonDir = Split-Path $daemonJson
if (-not (Test-Path $daemonDir)) { New-Item -ItemType Directory -Path $daemonDir -Force | Out-Null }

$config = @{}
if (Test-Path $daemonJson) {
    $config = Get-Content $daemonJson | ConvertFrom-Json
}
$config.'registry-mirrors' = @("https://hub-mirror.c.163.com", "https://registry.docker-cn.com", "https://mirror.ccs.tencentyun.com")
$config | ConvertTo-Json | Set-Content $daemonJson

docker pull docker.all-hands.dev/all-hands-ai/runtime:latest
docker pull docker.all-hands.dev/all-hands-ai/openhands:latest
docker run -d --pull=always --name openhands `
    -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:latest `
    -v /var/run/docker.sock:/var/run/docker.sock `
    -v "$env:USERPROFILE\.openhands:/.openhands" `
    -p 3000:3000 `
    docker.all-hands.dev/all-hands-ai/openhands:latest
Write-Host "OpenHands 已启动！访问 http://localhost:3000"
