#!/bin/bash

# Start CrewAI Service for MineDesk
# This script starts the CrewAI FastAPI service

set -e

echo "🚀 Starting CrewAI Service for MineDesk..."
echo ""

cd "$(dirname "$0")/../crewai_service"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo ""
    echo "📝 Please edit .env and add your SILICONFLOW_API_KEY"
    echo "   Then run this script again."
    exit 1
fi

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📥 Installing/upgrading dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Starting service on http://localhost:18000"
echo "📚 API Documentation: http://localhost:18000/docs"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Start the service
python main.py

