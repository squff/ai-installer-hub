# OpenClaw 安装器（中国镜像版）
param([string]$InstallDir = "$env:USERPROFILE\.ai-installer-hub\tools\openclaw")
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
git clone --depth 1 https://mirror.ghproxy.com/https://github.com/openclaw/openclaw.git $InstallDir
Set-Location $InstallDir
npm --registry https://registry.npmmirror.com install --production
Write-Host "OpenClaw 安装完成: $InstallDir"
