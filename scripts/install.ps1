# AI Installer Hub - Windows One-Click Installer
# Usage: irm https://ai-installer-hub.github.io/install.ps1 | iex

param(
    [string]$Tool,
    [string]$ApiKey,
    [string]$Provider,
    [string]$Model
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# ═══════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════
$REPO_URL = "https://github.com/squff/ai-installer-hub"
$INSTALL_DIR = "$env:USERPROFILE\.ai-installer-hub"
$VERSION = "1.0.0"

# ═══════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════
function Write-ColorText($Text, $Color = "White") {
    Write-Host $Text -ForegroundColor $Color
}

function Write-Step($Step, $Total, $Message) {
    Write-Host "[$Step/$Total] " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Success($Message) {
    Write-Host "[OK] " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Fail($Message) {
    Write-Host "[FAIL] " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Write-Warning($Message) {
    Write-Host "[!] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Test-Command($Command) {
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Get-LatestRelease {
    try {
        $response = Invoke-RestMethod -Uri "$REPO_URL/releases/latest" -UseBasicParsing
        return $response.tag_name
    } catch {
        return "v$VERSION"
    }
}

# ═══════════════════════════════════════════════════
# Installation Functions
# ═══════════════════════════════════════════════════
function Install-NodeJS {
    if (Test-Command "node") {
        $version = node --version
        Write-Success "Node.js $version is already installed"
        return $true
    }

    Write-Host "  Installing Node.js..." -ForegroundColor Cyan
    try {
        $url = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"
        $out = "$env:TEMP\node-installer.msi"
        Invoke-WebRequest -Uri $url -OutFile $out
        Start-Process msiexec.exe -ArgumentList "/i $out /quiet /norestart" -Wait
        Remove-Item $out -Force -ErrorAction SilentlyContinue

        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        if (Test-Command "node") {
            Write-Success "Node.js installed successfully"
            return $true
        }
    } catch {
        Write-Fail "Failed to install Node.js: $_"
        return $false
    }
    return $false
}

function Install-Git {
    if (Test-Command "git") {
        $version = git --version
        Write-Success "$version is already installed"
        return $true
    }

    Write-Host "  Installing Git..." -ForegroundColor Cyan
    try {
        $url = "https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/Git-2.44.0-64-bit.exe"
        $out = "$env:TEMP\git-installer.exe"
        Invoke-WebRequest -Uri $url -OutFile $out
        Start-Process -FilePath $out -ArgumentList "/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS" -Wait
        Remove-Item $out -Force -ErrorAction SilentlyContinue

        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        if (Test-Command "git") {
            Write-Success "Git installed successfully"
            return $true
        }
    } catch {
        Write-Fail "Failed to install Git: $_"
        return $false
    }
    return $false
}

function Install-Python {
    if (Test-Command "python") {
        $version = python --version 2>&1
        Write-Success "$version is already installed"
        return $true
    }

    Write-Host "  Installing Python..." -ForegroundColor Cyan
    try {
        $url = "https://www.python.org/ftp/python/3.12.3/python-3.12.3-amd64.exe"
        $out = "$env:TEMP\python-installer.exe"
        Invoke-WebRequest -Uri $url -OutFile $out
        Start-Process -FilePath $out -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
        Remove-Item $out -Force -ErrorAction SilentlyContinue

        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        if (Test-Command "python") {
            Write-Success "Python installed successfully"
            return $true
        }
    } catch {
        Write-Fail "Failed to install Python: $_"
        return $false
    }
    return $false
}

# ═══════════════════════════════════════════════════
# AI Tool Installation
# ═══════════════════════════════════════════════════
function Install-AITool($ToolId) {
    switch ($ToolId) {
        "claudecode" {
            Write-Host "  Installing Claude Code..." -ForegroundColor Cyan
            npm install -g @anthropic-ai/claude-code
            if ($ApiKey) {
                [System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", $ApiKey, "User")
                $env:ANTHROPIC_API_KEY = $ApiKey
            }
            Write-Success "Claude Code installed! Run 'claude' to start."
        }
        "ollama" {
            Write-Host "  Installing Ollama..." -ForegroundColor Cyan
            $url = "https://ollama.com/download/OllamaSetup.exe"
            $out = "$env:TEMP\OllamaSetup.exe"
            Invoke-WebRequest -Uri $url -OutFile $out
            Write-Host "  Running Ollama installer..." -ForegroundColor Cyan
            Start-Process -FilePath $out -Wait
            Remove-Item $out -Force -ErrorAction SilentlyContinue
            Write-Success "Ollama installed! Run 'ollama run llama3.2' to start."
        }
        "continue" {
            Write-Host "  Installing Continue extension..." -ForegroundColor Cyan
            if (Test-Command "code") {
                code --install-extension Continue.continue --force
                Write-Success "Continue extension installed! Restart VS Code to activate."
            } else {
                Write-Warning "VS Code not found. Install VS Code first, then run: code --install-extension Continue.continue"
            }
        }
        "openclaw" {
            Write-Host "  Installing OpenClaw..." -ForegroundColor Cyan
            $installDir = "$INSTALL_DIR\tools\openclaw"
            if (-not (Test-Path $installDir)) { New-Item -ItemType Directory -Path $installDir -Force | Out-Null }
            git clone --depth 1 https://github.com/openclaw/openclaw.git $installDir
            Push-Location $installDir
            npm install --production
            Pop-Location
            Write-Success "OpenClaw installed to $installDir"
        }
        "hermes" {
            Write-Host "  Installing Hermes..." -ForegroundColor Cyan
            $installDir = "$INSTALL_DIR\tools\hermes"
            if (-not (Test-Path $installDir)) { New-Item -ItemType Directory -Path $installDir -Force | Out-Null }
            git clone --depth 1 https://github.com/NousResearch/Hermes.git $installDir
            Push-Location $installDir
            python -m venv venv
            & "$installDir\venv\Scripts\pip" install -r requirements.txt 2>$null
            Pop-Location
            Write-Success "Hermes installed to $installDir"
        }
        "roocode" {
            Write-Host "  Installing Roo Code..." -ForegroundColor Cyan
            $url = "https://github.com/RooCodeInc/Roo-Code/releases/latest/download/Roo-Code-win32-x64.exe"
            $out = "$env:TEMP\roocode-installer.exe"
            Invoke-WebRequest -Uri $url -OutFile $out
            Start-Process -FilePath $out -Wait
            Remove-Item $out -Force -ErrorAction SilentlyContinue
            Write-Success "Roo Code installed!"
        }
        "openhands" {
            Write-Host "  Installing OpenHands (requires Docker)..." -ForegroundColor Cyan
            if (-not (Test-Command "docker")) {
                Write-Fail "Docker is required for OpenHands. Install Docker Desktop first."
                Write-Host "  Download: https://www.docker.com/products/docker-desktop/"
                return
            }
            docker pull docker.all-hands.dev/all-hands-ai/runtime:latest
            docker pull docker.all-hands.dev/all-hands-ai/openhands:latest
            $apiKeyParam = if ($ApiKey) { "-e LLM_API_KEY=$ApiKey" } else { "" }
            docker run -d --pull=always --name openhands `
                -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:latest `
                $apiKeyParam `
                -v /var/run/docker.sock:/var/run/docker.sock `
                -v "$env:USERPROFILE\.openhands:/.openhands" `
                -p 3000:3000 `
                docker.all-hands.dev/all-hands-ai/openhands:latest
            Write-Success "OpenHands running at http://localhost:3000"
        }
        "anythingllm" {
            Write-Host "  Installing AnythingLLM..." -ForegroundColor Cyan
            $url = "https://s3.us-west-1.amazonaws.com/public.useanything.com/latest/AnythingLLMDesktop.exe"
            $out = "$env:TEMP\AnythingLLMDesktop.exe"
            Invoke-WebRequest -Uri $url -OutFile $out
            Start-Process -FilePath $out -Wait
            Remove-Item $out -Force -ErrorAction SilentlyContinue
            Write-Success "AnythingLLM installed!"
        }
        default {
            Write-Fail "Unknown tool: $ToolId"
            Write-Host "  Available tools: claudecode, ollama, continue, openclaw, hermes, roocode, openhands, anythingllm"
        }
    }
}

# ═══════════════════════════════════════════════════
# Main Installation Flow
# ═══════════════════════════════════════════════════
function Main {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  AI Installer Hub v$VERSION - One-Click AI Assistant Setup" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""

    # Check if running as admin
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) {
        Write-Warning "Running without administrator privileges. Some installations may require elevation."
    }

    # System check
    Write-Host "System Check:" -ForegroundColor Cyan
    Write-Host "  Platform:  Windows $(if ([Environment]::Is64BitOperatingSystem) { 'x64' } else { 'x86' })"
    Write-Host "  Version:   $([System.Environment]::OSVersion.Version)"
    Write-Host ""

    # Install dependencies
    Write-Host "Checking Dependencies:" -ForegroundColor Cyan
    $steps = 3
    $current = 1

    Write-Step $current $steps "Checking Node.js..."
    $current++
    $nodeOk = Install-NodeJS

    Write-Step $current $steps "Checking Git..."
    $current++
    $gitOk = Install-Git

    Write-Step $current $steps "Checking Python..."
    $current++
    $pythonOk = Install-Python

    Write-Host ""

    # If specific tool requested, install it
    if ($Tool) {
        Write-Host "Installing $Tool..." -ForegroundColor Cyan
        Install-AITool $Tool
    } else {
        # Interactive mode - show menu
        Write-Host "Available AI Assistants:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  [1] Claude Code     - AI coding assistant (Anthropic)"
        Write-Host "  [2] Ollama          - Run LLMs locally"
        Write-Host "  [3] Continue        - VS Code AI extension"
        Write-Host "  [4] OpenClaw        - Open-source AI assistant"
        Write-Host "  [5] Hermes          - Lightweight AI with memory"
        Write-Host "  [6] Roo Code        - AI-powered VS Code fork"
        Write-Host "  [7] OpenHands       - Autonomous coding agent"
        Write-Host "  [8] AnythingLLM     - Chat with your documents"
        Write-Host "  [9] Install ALL"
        Write-Host "  [C] Switch to Chinese version (for China users)"
        Write-Host "  [0] Exit"
        Write-Host ""

        $choice = Read-Host "Enter your choice (0-9)"

        $toolMap = @{
            "1" = "claudecode"
            "2" = "ollama"
            "3" = "continue"
            "4" = "openclaw"
            "5" = "hermes"
            "6" = "roocode"
            "7" = "openhands"
            "8" = "anythingllm"
        }

        if ($choice -eq "9") {
            foreach ($id in $toolMap.Values) {
                Write-Host ""
                Write-Host "--- Installing $id ---" -ForegroundColor Yellow
                Install-AITool $id
            }
        } elseif ($choice -eq "C" -or $choice -eq "c") {
            Write-Host "Switching to Chinese version..." -ForegroundColor Yellow
            irm https://squff.github.io/ai-installer-hub/install-cn.ps1 | iex
            return
        } elseif ($toolMap.ContainsKey($choice)) {
            Install-AITool $toolMap[$choice]
        } elseif ($choice -eq "0") {
            Write-Host "Goodbye!"
            return
        } else {
            Write-Fail "Invalid choice."
            return
        }
    }

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "  Installation Complete!" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Manage tools:     aihub list"
    Write-Host "  Check status:     aihub status"
    Write-Host "  Run diagnostics:  aihub doctor"
    Write-Host "  Configure APIs:   aihub config list"
    Write-Host ""
    Write-Host "  Documentation:    $REPO_URL"
    Write-Host ""
}

# Run main function
Main
