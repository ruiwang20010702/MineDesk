#!/bin/bash
# MineContext 常用命令速查表
# 使用方法：chmod +x MineContext_Commands.sh 然后运行对应函数

MINECONTEXT_DIR="/Users/ruiwang/Desktop/killer app/MineContext-main"
PYTHON311="/opt/homebrew/bin/python3.11"

# 启动服务（前台）
start() {
    echo "🚀 启动 MineContext 服务..."
    cd "$MINECONTEXT_DIR"
    $PYTHON311 -m opencontext.cli start --host 127.0.0.1 --port 17860
}

# 启动服务（后台）
start_bg() {
    echo "🚀 后台启动 MineContext 服务..."
    cd "$MINECONTEXT_DIR"
    nohup $PYTHON311 -m opencontext.cli start --host 127.0.0.1 --port 17860 > "$MINECONTEXT_DIR/minecontext.log" 2>&1 &
    echo $! > "$MINECONTEXT_DIR/minecontext.pid"
    echo "✅ 服务已启动，PID: $(cat $MINECONTEXT_DIR/minecontext.pid)"
    echo "📋 日志文件: $MINECONTEXT_DIR/minecontext.log"
}

# 停止服务
stop() {
    echo "🛑 停止 MineContext 服务..."
    if [ -f "$MINECONTEXT_DIR/minecontext.pid" ]; then
        PID=$(cat "$MINECONTEXT_DIR/minecontext.pid")
        kill $PID 2>/dev/null && echo "✅ 进程 $PID 已停止" || echo "⚠️  进程 $PID 不存在"
        rm "$MINECONTEXT_DIR/minecontext.pid"
    else
        pkill -f "opencontext.cli" && echo "✅ 服务已停止" || echo "⚠️  未找到运行中的服务"
    fi
}

# 重启服务
restart() {
    echo "🔄 重启 MineContext 服务..."
    stop
    sleep 2
    start_bg
}

# 查看状态
status() {
    echo "📊 MineContext 服务状态："
    echo ""
    
    # 检查进程
    if ps aux | grep "opencontext.cli" | grep -v grep > /dev/null; then
        PID=$(ps aux | grep "opencontext.cli" | grep -v grep | awk '{print $2}')
        echo "✅ 进程运行中 (PID: $PID)"
    else
        echo "❌ 进程未运行"
        return 1
    fi
    
    # 检查端口
    if lsof -i :17860 2>/dev/null | grep LISTEN > /dev/null; then
        echo "✅ 端口 17860 监听中"
    else
        echo "❌ 端口未监听"
    fi
    
    # 健康检查
    echo ""
    echo "🏥 健康检查："
    curl -s http://127.0.0.1:17860/api/debug/health | python3 -m json.tool 2>/dev/null || echo "❌ API 无响应"
}

# 查看日志
logs() {
    echo "📋 查看最新日志（Ctrl+C 退出）："
    tail -f "$MINECONTEXT_DIR/minecontext.log" 2>/dev/null || \
    tail -f /tmp/minecontext.log 2>/dev/null || \
    echo "❌ 日志文件不存在"
}

# 查看最近日志
logs_recent() {
    echo "📋 最近 50 行日志："
    tail -50 "$MINECONTEXT_DIR/minecontext.log" 2>/dev/null || \
    tail -50 /tmp/minecontext.log 2>/dev/null || \
    echo "❌ 日志文件不存在"
}

# 测试 API
test_api() {
    echo "🧪 测试 MineContext API："
    echo ""
    
    echo "1️⃣  健康检查..."
    curl -s http://127.0.0.1:17860/api/debug/health | python3 -m json.tool
    echo ""
    
    echo "2️⃣  测试文档插入..."
    curl -s -X POST http://127.0.0.1:17860/api/context/ingest \
      -H "Content-Type: application/json" \
      -d '{
        "source": "cli_test",
        "mimeType": "text/plain",
        "content": "测试文档内容 - '"$(date)"'",
        "metadata": {"test": true, "timestamp": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}
      }' | python3 -m json.tool
    echo ""
    
    echo "3️⃣  获取设置..."
    curl -s http://127.0.0.1:17860/api/settings | python3 -m json.tool | head -20
}

# 安装/更新依赖
install() {
    echo "📦 安装/更新 MineContext 依赖..."
    cd "$MINECONTEXT_DIR"
    $PYTHON311 -m pip install -e . --upgrade
}

# 清理数据库
clean_db() {
    echo "⚠️  警告：此操作将删除所有数据！"
    read -p "确认清理数据库? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        echo "🗑️  清理数据库..."
        rm -rf "$MINECONTEXT_DIR/persist/chromadb"
        rm -rf "$MINECONTEXT_DIR/persist/sqlite"
        echo "✅ 数据库已清理"
    else
        echo "❌ 操作已取消"
    fi
}

# 显示帮助
help() {
    echo "🧠 MineContext 服务管理工具"
    echo ""
    echo "使用方法："
    echo "  source MineContext_Commands.sh"
    echo "  <命令>"
    echo ""
    echo "可用命令："
    echo "  start          - 前台启动服务"
    echo "  start_bg       - 后台启动服务"
    echo "  stop           - 停止服务"
    echo "  restart        - 重启服务"
    echo "  status         - 查看服务状态"
    echo "  logs           - 实时查看日志"
    echo "  logs_recent    - 查看最近日志"
    echo "  test_api       - 测试 API 接口"
    echo "  install        - 安装/更新依赖"
    echo "  clean_db       - 清理数据库（谨慎）"
    echo "  help           - 显示此帮助"
    echo ""
    echo "快速测试："
    echo "  1. start_bg    # 后台启动"
    echo "  2. status      # 检查状态"
    echo "  3. test_api    # 测试 API"
    echo "  4. logs        # 查看日志"
    echo ""
    echo "服务地址: http://127.0.0.1:17860"
    echo "API 文档: http://127.0.0.1:17860/docs"
}

# 如果直接运行脚本，显示帮助
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    help
    echo ""
    echo "💡 提示：请使用 'source MineContext_Commands.sh' 加载命令"
fi

