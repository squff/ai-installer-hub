# AI Installer Hub - Windows Uninstaller
# Usage: irm https://ai-installer-hub.github.io/uninstall.ps1 | iex

param(
    [string]$Tool,
    [switch]$All
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$INSTALL_DIR = "$env:USERPROFILE\.ai-installer-hub"

function Write-Success($Message) {
    Write-Host "[OK] " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Warning($Message) {
    Write-Host "[!] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  AI Installer Hub - Uninstaller" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($All) {
    Write-Warning "This will remove ALL installed AI tools and configuration."
    $confirm = Read-Host "Are you sure? (y/N)"
    if ($confirm -ne "y") {
        Write-Host "Cancelled."
        return
    }

    # Remove all tools
    if (Test-Path "$INSTALL_DIR\tools") {
        Remove-Item -Recurse -Force "$INSTALL_DIR\tools"
        Write-Success "Removed all installed tools"
    }

    # Remove configuration
    if (Test-Path "$INSTALL_DIR\api-config.json") {
        Remove-Item -Force "$INSTALL_DIR\api-config.json"
        Write-Success "Removed API configuration"
    }

    Write-Success "Uninstallation complete"
} elseif ($Tool) {
    $toolDir = "$INSTALL_DIR\tools\$Tool"
    if (Test-Path $toolDir) {
        Remove-Item -Recurse -Force $toolDir
        Write-Success "Removed $Tool"
    } else {
        Write-Warning "$Tool is not installed"
    }
} else {
    Write-Host "Usage:"
    Write-Host "  uninstall.ps1 -Tool <name>    Remove a specific tool"
    Write-Host "  uninstall.ps1 -All            Remove everything"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  irm https://aihub.dev/uninstall.ps1 | iex -Tool ollama"
    Write-Host "  irm https://aihub.dev/uninstall.ps1 | iex -All"
}
