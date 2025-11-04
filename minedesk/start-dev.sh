#!/bin/bash

# MineDesk Development Server Startup Script
# This script starts the Electron development environment

cd "$(dirname "$0")"

echo "🚀 Starting MineDesk development environment..."
echo ""
echo "📦 Checking dependencies..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Running pnpm install..."
    pnpm install
fi

echo ""
echo "✅ Dependencies OK"
echo ""
echo "🔧 Starting development server..."
echo "   - Main process will be built"
echo "   - Preload scripts will be built"
echo "   - Renderer dev server will start on http://localhost:5173"
echo "   - Electron window will open automatically"
echo ""
echo "Press Ctrl+C to stop the development server"
echo ""

pnpm dev

