#!/bin/bash

# Screenpipe 启动脚本
# 自动启动 Screenpipe 服务并进行健康检查

set -e

echo "🚀 Starting Screenpipe..."
echo ""

# 检查 Screenpipe 是否已安装
if ! command -v screenpipe &> /dev/null; then
    echo "❌ Screenpipe is not installed!"
    echo ""
    echo "Please install it first:"
    echo "  curl -fsSL get.screenpi.pe/cli | sh"
    echo ""
    exit 1
fi

# 检查是否已经在运行
if curl -s http://localhost:3030/health > /dev/null 2>&1; then
    echo "✅ Screenpipe is already running!"
    echo ""
    echo "API: http://localhost:3030"
    echo "Database: ~/.screenpipe/db.sqlite"
    echo ""
    exit 0
fi

# 启动 Screenpipe（在后台）
echo "Starting Screenpipe in the background..."
nohup screenpipe > ~/.screenpipe/screenpipe.log 2>&1 &
SCREENPIPE_PID=$!

echo "Process ID: $SCREENPIPE_PID"
echo ""

# 等待服务启动（最多等待30秒）
echo "Waiting for Screenpipe to start..."
for i in {1..30}; do
    if curl -s http://localhost:3030/health > /dev/null 2>&1; then
        echo ""
        echo "✅ Screenpipe started successfully!"
        echo ""
        echo "📊 Status:"
        echo "  - API:      http://localhost:3030"
        echo "  - Database: ~/.screenpipe/db.sqlite"
        echo "  - Logs:     ~/.screenpipe/screenpipe.log"
        echo "  - PID:      $SCREENPIPE_PID"
        echo ""
        echo "💡 Quick commands:"
        echo "  - Test API:     curl http://localhost:3030/health"
        echo "  - View logs:    tail -f ~/.screenpipe/screenpipe.log"
        echo "  - Stop:         kill $SCREENPIPE_PID"
        echo ""
        echo "🎯 Try the examples:"
        echo "  node example-usage.js"
        echo ""
        exit 0
    fi
    
    sleep 1
    echo -n "."
done

echo ""
echo "⚠️ Screenpipe may be starting slowly..."
echo "Check logs: tail -f ~/.screenpipe/screenpipe.log"
echo ""

exit 0

