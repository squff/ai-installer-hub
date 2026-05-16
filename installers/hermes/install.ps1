# Hermes 安装器（中国镜像版）
param([string]$InstallDir = "$env:USERPROFILE\.ai-installer-hub\tools\hermes")
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
git clone --depth 1 https://mirror.ghproxy.com/https://github.com/NousResearch/Hermes.git $InstallDir
Set-Location $InstallDir
python -m venv venv
& "$InstallDir\venv\Scripts\pip" install --index-url https://pypi.tuna.tsinghua.edu.cn/simple/ -r requirements.txt 2>$null
Write-Host "Hermes 安装完成: $InstallDir"
