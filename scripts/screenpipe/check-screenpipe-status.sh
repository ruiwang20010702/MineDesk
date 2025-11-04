#!/bin/bash

# Screenpipe 状态检查脚本
# 快速检查 Screenpipe 的运行状态和权限

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           🔍 Screenpipe 状态检查                             ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. 检查安装
echo "📦 检查安装..."
if command -v screenpipe &> /dev/null; then
    VERSION=$(screenpipe --version 2>&1 || echo "unknown")
    echo "  ✅ Screenpipe 已安装: $VERSION"
else
    echo "  ❌ Screenpipe 未安装"
    echo ""
    echo "安装命令:"
    echo "  curl -fsSL get.screenpi.pe/cli | sh"
    exit 1
fi
echo ""

# 2. 检查进程
echo "🔄 检查进程..."
if pgrep -x "screenpipe" > /dev/null; then
    PID=$(pgrep -x "screenpipe")
    echo "  ✅ Screenpipe 正在运行 (PID: $PID)"
    
    # 显示资源使用
    echo ""
    echo "  📊 资源使用:"
    ps aux | grep screenpipe | grep -v grep | awk '{printf "     CPU: %s%%  内存: %s%%\n", $3, $4}'
else
    echo "  ❌ Screenpipe 未运行"
    echo ""
    echo "启动命令:"
    echo "  ./scripts/screenpipe/start-screenpipe.sh"
fi
echo ""

# 3. 检查 API
echo "🔌 检查 API..."
if curl -s http://localhost:3030/health > /dev/null 2>&1; then
    echo "  ✅ API 可访问: http://localhost:3030"
    echo ""
    
    # 获取详细状态
    HEALTH=$(curl -s http://localhost:3030/health)
    
    # 解析状态
    STATUS=$(echo "$HEALTH" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    FRAME_STATUS=$(echo "$HEALTH" | grep -o '"frame_status":"[^"]*"' | cut -d'"' -f4)
    AUDIO_STATUS=$(echo "$HEALTH" | grep -o '"audio_status":"[^"]*"' | cut -d'"' -f4)
    
    echo "  📊 系统状态:"
    
    # 总体状态
    if [ "$STATUS" = "ok" ]; then
        echo "     总体: ✅ $STATUS"
    else
        echo "     总体: ⚠️  $STATUS"
    fi
    
    # 屏幕录制
    if [ "$FRAME_STATUS" = "ok" ]; then
        echo "     屏幕: ✅ $FRAME_STATUS"
    else
        echo "     屏幕: ❌ $FRAME_STATUS (需要配置权限)"
    fi
    
    # 音频录制
    if [ "$AUDIO_STATUS" = "ok" ]; then
        echo "     音频: ✅ $AUDIO_STATUS"
    else
        echo "     音频: ⚠️  $AUDIO_STATUS"
    fi
else
    echo "  ❌ API 不可访问"
    echo "     预期地址: http://localhost:3030"
fi
echo ""

# 4. 检查数据库
echo "💾 检查数据库..."
if [ -f ~/.screenpipe/db.sqlite ]; then
    SIZE=$(du -h ~/.screenpipe/db.sqlite | cut -f1)
    RECORDS=$(sqlite3 ~/.screenpipe/db.sqlite "SELECT COUNT(*) FROM frames;" 2>/dev/null || echo "0")
    echo "  ✅ 数据库存在: ~/.screenpipe/db.sqlite"
    echo "     大小: $SIZE"
    echo "     记录数: $RECORDS 个屏幕帧"
else
    echo "  ⚠️  数据库不存在（首次运行或刚启动）"
fi
echo ""

# 5. 检查日志
echo "📋 检查日志..."
if [ -f ~/.screenpipe/screenpipe.log ]; then
    SIZE=$(du -h ~/.screenpipe/screenpipe.log | cut -f1)
    LINES=$(wc -l < ~/.screenpipe/screenpipe.log)
    echo "  ✅ 日志文件: ~/.screenpipe/screenpipe.log"
    echo "     大小: $SIZE"
    echo "     行数: $LINES"
    echo ""
    echo "  📝 最近 5 条日志:"
    tail -5 ~/.screenpipe/screenpipe.log | sed 's/^/     /'
else
    echo "  ⚠️  日志文件不存在"
fi
echo ""

# 6. 总结和建议
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           📊 诊断总结                                        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 判断是否需要配置权限
if curl -s http://localhost:3030/health 2>/dev/null | grep -q '"frame_status":"not_started"\|"frame_status":"error"'; then
    echo "⚠️  需要配置屏幕录制权限"
    echo ""
    echo "配置步骤（macOS）："
    echo "  1. 打开"系统设置" → "隐私与安全性""
    echo "  2. 选择"屏幕录制""
    echo "  3. 启用 screenpipe 或相关终端应用"
    echo "  4. 重启 Screenpipe: killall screenpipe && nohup screenpipe > ~/.screenpipe/screenpipe.log 2>&1 &"
    echo ""
elif curl -s http://localhost:3030/health 2>/dev/null | grep -q '"status":"ok"'; then
    echo "✅ Screenpipe 运行正常！"
    echo ""
    echo "下一步："
    echo "  • 运行演示: node demos/demo.js"
    echo "  • 查看文档: cat docs/guides/SCREENPIPE_START_HERE.md"
    echo "  • 实时日志: tail -f ~/.screenpipe/screenpipe.log"
    echo ""
else
    echo "ℹ️  Screenpipe 正在启动或需要配置"
    echo ""
    echo "建议操作："
    echo "  • 查看日志: tail -f ~/.screenpipe/screenpipe.log"
    echo "  • 检查进程: ps aux | grep screenpipe"
    echo "  • 重新运行检查: ./scripts/screenpipe/check-screenpipe-status.sh"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0

