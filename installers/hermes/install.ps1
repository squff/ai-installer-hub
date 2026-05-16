# Hermes Installer
param([string]$InstallDir = "$env:USERPROFILE\.ai-installer-hub\tools\hermes")
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
git clone --depth 1 https://github.com/NousResearch/Hermes.git $InstallDir
Set-Location $InstallDir
python -m venv venv
& "$InstallDir\venv\Scripts\pip" install -r requirements.txt 2>$null
Write-Host "Hermes installed to $InstallDir"
