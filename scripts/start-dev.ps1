#!/usr/bin/env pwsh
# PATH# Development Server Launcher
# Usage: .\start-dev.ps1

$ErrorActionPreference = "Stop"
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     PATH# Development Server - Quick Start                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Function to kill Node processes
function Kill-NodeProcesses {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "⚠️  Found running Node processes, stopping them..."
        $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✅ Node processes stopped"
    }
}

# Step 1: Check dependencies
Write-Host "[1/4] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Gray
    & npm install 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Step 2: Check and kill existing Node processes
Write-Host "[2/4] Checking for existing Node processes..." -ForegroundColor Yellow
Kill-NodeProcesses

# Step 3: Verify project structure
Write-Host "[3/4] Verifying project structure..." -ForegroundColor Yellow
$requiredDirs = @(
    "engine/core",
    "modules/modules",
    "plugins/extensions",
    "apps/web"
)

$allValid = $true
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "  ✅ $dir" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $dir (missing)" -ForegroundColor Red
        $allValid = $false
    }
}

if (-not $allValid) {
    Write-Host "❌ Project structure is incomplete" -ForegroundColor Red
    exit 1
}

# Step 4: Start server
Write-Host "[4/4] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Server starting..." -ForegroundColor Green
Write-Host "🌐 URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📖 Docs: docs/INDEX.md" -ForegroundColor Cyan
Write-Host "🔌 Plugins: docs/extensions/PLUGINS_QUICK_REFERENCE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

try {
    & npm run dev
} catch {
    Write-Host ""
    Write-Host "❌ Server failed to start" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Kill Node processes: Get-Process node | Stop-Process -Force" -ForegroundColor Gray
    Write-Host "2. Check port 3000: netstat -ano | findstr :3000" -ForegroundColor Gray
    Write-Host "3. Try npm install again" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Cleanup on exit
Write-Host ""
Write-Host "Server stopped" -ForegroundColor Yellow
