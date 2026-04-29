#!/bin/bash
# Start PATH# Development Server (Linux/macOS)
# Simple one-click launcher for localhost:3000

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                   PATH# Dev Server                      ║"
echo "║         Starting Express Server on Port 3000            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node_modules exists, install if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[!] Dependencies not found. Installing npm packages...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${RED}❌ ERROR: npm install failed${NC}"
        echo ""
        echo "Troubleshooting:"
        echo "  1. Make sure Node.js and npm are installed"
        echo "  2. Run: node --version"
        echo "  3. Run: npm --version"
        echo "  4. Try: npm cache clean --force"
        echo "  5. Delete node_modules folder and try again"
        echo ""
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# Kill any existing Node processes on port 3000
echo -e "${YELLOW}[✓] Checking for existing processes on port 3000...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}[!] Found existing process on port 3000, stopping it...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Check if required directories exist
echo -e "${YELLOW}[✓] Verifying project structure...${NC}"
if [ ! -d "engine/core" ] || [ ! -d "modules/modules" ] || [ ! -d "plugins/extensions" ] || [ ! -d "apps/web" ]; then
    echo -e "${RED}❌ ERROR: Required project directories not found${NC}"
    echo ""
    echo "Required directories:"
    echo "  • engine/core"
    echo "  • modules/modules"
    echo "  • plugins/extensions"
    echo "  • apps/web"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Project structure verified${NC}"
echo ""

# Check for TypeScript compilation if needed
if [ -f "apps/web/src/server.ts" ]; then
    echo -e "${YELLOW}[✓] Compiling TypeScript...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Compilation issues detected${NC}"
        echo "Attempting to start anyway..."
        echo ""
    fi
fi

# Start the development server
echo ""
echo -e "${YELLOW}[▶] Starting server...${NC}"
echo ""

npm run dev

# Error handling
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Server failed to start${NC}"
    echo ""
    echo "Common issues:"
    echo "  • Port 3000 is already in use"
    echo "  • Missing dependencies - run: npm install"
    echo "  • TypeScript errors - check compilation above"
    echo ""
    echo "Solutions:"
    echo "  1. Kill process on port 3000:"
    echo "     lsof -ti:3000 | xargs kill -9"
    echo "  2. Clean install: delete node_modules, run npm install"
    echo "  3. Check package.json for 'dev' script"
    echo ""
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Server running at http://localhost:3000${NC}"
echo ""
