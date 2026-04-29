@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     PATH# Development Server - Quick Start                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [1/3] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ npm install failed
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.
echo [2/3] Checking TypeScript compilation...
if not exist "apps\web\dist" (
    echo ⚠️  No dist folder found, compilation may occur on startup
)

echo.
echo [3/3] Starting development server...
echo.
echo 🚀 Server starting on http://localhost:3000
echo 📖 Documentation: docs/INDEX.md
echo 🔌 Plugin System: docs/extensions/PLUGINS_QUICK_REFERENCE.md
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
call npm run dev

if errorlevel 1 (
    echo.
    echo ❌ Server failed to start
    echo.
    echo Possible solutions:
    echo 1. Kill existing Node processes: taskkill /F /IM node.exe
    echo 2. Clear node_modules: rmdir /s /q node_modules
    echo 3. Run npm install again
    echo.
    pause
    exit /b 1
)

pause
