#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Screenpipe 集成验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PASS=0
FAIL=0

check() {
    if eval "$2" > /dev/null 2>&1; then
        echo "✅ $1"
        ((PASS++))
    else
        echo "❌ $1"
        ((FAIL++))
    fi
}

echo "📦 1. 检查 Screenpipe 安装"
echo "────────────────────────────────────────"
check "Screenpipe 二进制文件" "test -x ~/.screenpipe/bin/screenpipe"
check "FFmpeg 已安装" "command -v ffmpeg"
check "Bun 已安装" "command -v bun"
echo ""

echo "📁 2. 检查项目文件"
echo "────────────────────────────────────────"
check "核心 SDK (screenpipe-integration.js)" "test -f screenpipe-integration.js"
check "使用示例 (example-usage.js)" "test -f example-usage.js"
check "交互演示 (demo.js)" "test -f demo.js"
check "启动脚本 (start-screenpipe.sh)" "test -x start-screenpipe.sh"
check "测试脚本 (test-screenpipe.sh)" "test -x test-screenpipe.sh"
echo ""

echo "📖 3. 检查文档"
echo "────────────────────────────────────────"
check "快速开始指南 (SCREENPIPE_START_HERE.md)" "test -f SCREENPIPE_START_HERE.md"
check "快速入门 (QUICKSTART.md)" "test -f QUICKSTART.md"
check "完整文档 (SCREENPIPE_README.md)" "test -f SCREENPIPE_README.md"
check "项目总结 (PROJECT_SUMMARY.md)" "test -f PROJECT_SUMMARY.md"
check "最终报告 (FINAL_REPORT.md)" "test -f FINAL_REPORT.md"
echo ""

echo "🔧 4. 检查 Screenpipe 版本"
echo "────────────────────────────────────────"
if [ -x ~/.screenpipe/bin/screenpipe ]; then
    VERSION=$(~/.screenpipe/bin/screenpipe --version 2>&1)
    echo "✅ $VERSION"
    ((PASS++))
else
    echo "❌ 无法获取版本"
    ((FAIL++))
fi
echo ""

echo "🌐 5. 检查 API 状态"
echo "────────────────────────────────────────"
if curl -s --connect-timeout 2 http://localhost:3030/health > /dev/null 2>&1; then
    echo "✅ Screenpipe API 正在运行"
    echo "   端点: http://localhost:3030"
    ((PASS++))
else
    echo "⚠️  Screenpipe API 未运行"
    echo "   提示: 运行 ./start-screenpipe.sh 启动"
    ((FAIL++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 验证结果"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   通过: $PASS 项"
echo "   失败: $FAIL 项"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 所有检查通过！"
    echo ""
    echo "🚀 快速开始:"
    echo "   ./start-screenpipe.sh    # 启动 Screenpipe"
    echo "   node demo.js             # 运行交互式演示"
    echo ""
    exit 0
elif [ $FAIL -eq 1 ] && ! curl -s --connect-timeout 2 http://localhost:3030/health > /dev/null 2>&1; then
    echo "✅ 安装完成！只需启动 Screenpipe:"
    echo ""
    echo "   ./start-screenpipe.sh"
    echo ""
    exit 0
else
    echo "⚠️  发现 $FAIL 个问题，请检查上述输出"
    echo ""
    exit 1
fi
