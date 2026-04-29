#!/usr/bin/env pwsh
# PathEngine 3D - Setup Script
# Автоматическая установка и сборка модуля

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PathEngine 3D - Setup & Build" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$modulePath = $PSScriptRoot

# Функция для красивого вывода
function Write-Step {
    param([string]$message)
    Write-Host "▶ $message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$message)
    Write-Host "✖ $message" -ForegroundColor Red
}

function Write-Success {
    param([string]$message)
    Write-Host "✔ $message" -ForegroundColor Green
}

# Шаг 1: Проверка Node.js
Write-Step "Checking Node.js installation..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js found: $nodeVersion"
} catch {
    Write-Error-Custom "Node.js not found! Please install Node.js from https://nodejs.org/"
    exit 1
}

# Шаг 2: Проверка npm
Write-Step "Checking npm installation..."
try {
    $npmVersion = npm --version
    Write-Success "npm found: v$npmVersion"
} catch {
    Write-Error-Custom "npm not found!"
    exit 1
}

# Шаг 3: Переход в директорию модуля
Write-Step "Navigating to module directory..."
Set-Location $modulePath
Write-Success "Current directory: $modulePath"

# Шаг 4: Установка зависимостей
Write-Host ""
Write-Step "Installing dependencies..."
Write-Host ""

try {
    npm install
    Write-Host ""
    Write-Success "Dependencies installed successfully!"
} catch {
    Write-Error-Custom "Failed to install dependencies!"
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Шаг 5: Сборка проекта
Write-Host ""
Write-Step "Building TypeScript project..."
Write-Host ""

try {
    npm run build
    Write-Host ""
    Write-Success "Build completed successfully!"
} catch {
    Write-Error-Custom "Build failed!"
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Шаг 6: Проверка результатов
Write-Host ""
Write-Step "Verifying build output..."

if (Test-Path "dist/index.js") {
    Write-Success "dist/index.js ✓"
} else {
    Write-Error-Custom "dist/index.js not found!"
}

if (Test-Path "dist/index.d.ts") {
    Write-Success "dist/index.d.ts ✓"
} else {
    Write-Error-Custom "dist/index.d.ts not found!"
}

# Шаг 7: Показываем структуру dist
Write-Host ""
Write-Step "Build output:"
Get-ChildItem -Path "dist" -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Replace($modulePath + "\dist\", "")
    Write-Host "  📄 $relativePath" -ForegroundColor Gray
}

# Финальное сообщение
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   ✨ Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open demo.html in a browser with a local server" -ForegroundColor White
Write-Host "  2. Or run: " -NoNewline -ForegroundColor White
Write-Host "npx serve ." -ForegroundColor Cyan
Write-Host "  3. Navigate to the demo page" -ForegroundColor White
Write-Host ""
Write-Host "Development:" -ForegroundColor Yellow
Write-Host "  - Watch mode: " -NoNewline -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor Cyan
Write-Host "  - Rebuild: " -NoNewline -ForegroundColor White
Write-Host "npm run build" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - README.md - Overview and basic usage" -ForegroundColor White
Write-Host "  - QUICKSTART.md - Quick start guide" -ForegroundColor White
Write-Host "  - DEVELOPMENT.md - Full developer guide" -ForegroundColor White
Write-Host "  - examples.ts - Code examples" -ForegroundColor White
Write-Host ""
