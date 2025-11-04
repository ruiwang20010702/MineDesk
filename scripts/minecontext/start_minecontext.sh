#!/bin/bash
# MineContext 快速启动脚本

echo "🚀 启动 MineContext RAG 系统..."
echo ""

# 进入 MineContext 目录
cd "$(dirname "$0")/MineContext-main" || exit 1

# 检查配置文件
if [ ! -f "config/user_setting.yaml" ]; then
    echo "❌ 配置文件不存在: config/user_setting.yaml"
    exit 1
fi

echo "✅ 配置文件检查通过"
echo "📍 工作目录: $(pwd)"
echo "🔧 配置文件: config/user_setting.yaml"
echo ""

# 启动服务
echo "⏳ 正在启动服务..."
echo "   监听地址: http://127.0.0.1:17860"
echo "   API 文档: http://127.0.0.1:17860/docs"
echo ""
echo "💡 提示: 按 Ctrl+C 停止服务"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 启动 MineContext
/opt/homebrew/bin/python3.11 -m opencontext start \
    --host 127.0.0.1 \
    --port 17860 \
    --workers 1

# 捕获退出信号
trap 'echo ""; echo "👋 服务已停止"; exit 0' INT TERM

