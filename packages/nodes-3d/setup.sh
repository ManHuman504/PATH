#!/bin/bash
# PathEngine 3D - Setup Script (Linux/Mac)
# Автоматическая установка и сборка модуля

echo "============================================"
echo "   PathEngine 3D - Setup & Build"
echo "============================================"
echo ""

set -e

MODULE_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Функции для вывода
write_step() {
    echo -e "\033[0;32m▶ $1\033[0m"
}

write_error() {
    echo -e "\033[0;31m✖ $1\033[0m"
}

write_success() {
    echo -e "\033[0;32m✔ $1\033[0m"
}

# Шаг 1: Проверка Node.js
write_step "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    write_success "Node.js found: $NODE_VERSION"
else
    write_error "Node.js not found! Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Шаг 2: Проверка npm
write_step "Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    write_success "npm found: v$NPM_VERSION"
else
    write_error "npm not found!"
    exit 1
fi

# Шаг 3: Переход в директорию модуля
write_step "Navigating to module directory..."
cd "$MODULE_PATH"
write_success "Current directory: $MODULE_PATH"

# Шаг 4: Установка зависимостей
echo ""
write_step "Installing dependencies..."
echo ""

npm install
echo ""
write_success "Dependencies installed successfully!"

# Шаг 5: Сборка проекта
echo ""
write_step "Building TypeScript project..."
echo ""

npm run build
echo ""
write_success "Build completed successfully!"

# Шаг 6: Проверка результатов
echo ""
write_step "Verifying build output..."

if [ -f "dist/index.js" ]; then
    write_success "dist/index.js ✓"
else
    write_error "dist/index.js not found!"
fi

if [ -f "dist/index.d.ts" ]; then
    write_success "dist/index.d.ts ✓"
else
    write_error "dist/index.d.ts not found!"
fi

# Шаг 7: Показываем структуру dist
echo ""
write_step "Build output:"
find dist -type f | while read file; do
    echo "  📄 ${file#dist/}"
done

# Финальное сообщение
echo ""
echo "============================================"
echo -e "\033[0;32m   ✨ Setup Complete!\033[0m"
echo "============================================"
echo ""
echo -e "\033[0;33mNext steps:\033[0m"
echo "  1. Open demo.html in a browser with a local server"
echo -e "  2. Or run: \033[0;36mnpx serve .\033[0m"
echo "  3. Navigate to the demo page"
echo ""
echo -e "\033[0;33mDevelopment:\033[0m"
echo -e "  - Watch mode: \033[0;36mnpm run dev\033[0m"
echo -e "  - Rebuild: \033[0;36mnpm run build\033[0m"
echo ""
echo -e "\033[0;33mDocumentation:\033[0m"
echo "  - README.md - Overview and basic usage"
echo "  - QUICKSTART.md - Quick start guide"
echo "  - DEVELOPMENT.md - Full developer guide"
echo "  - examples.ts - Code examples"
echo ""
