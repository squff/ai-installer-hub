# OpenClaw Installer
param([string]$InstallDir = "$env:USERPROFILE\.ai-installer-hub\tools\openclaw")
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
git clone --depth 1 https://github.com/openclaw/openclaw.git $InstallDir
Set-Location $InstallDir
npm install --production
Write-Host "OpenClaw installed to $InstallDir"
