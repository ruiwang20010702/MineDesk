#!/bin/bash
# 快速测试脚本

echo "🧪 Screenpipe Integration Test"
echo ""

# 检查安装
if [ -x "$HOME/.screenpipe/bin/screenpipe" ]; then
    echo "✅ Screenpipe binary found"
    echo "   Version: $($HOME/.screenpipe/bin/screenpipe --version)"
else
    echo "❌ Screenpipe not found at ~/.screenpipe/bin/screenpipe"
    exit 1
fi

# 检查 API
if curl -s http://localhost:3030/health > /dev/null 2>&1; then
    echo "✅ Screenpipe API is running"
    echo "   Endpoint: http://localhost:3030"
else
    echo "⚠️  Screenpipe API not running"
    echo "   Start it with: ./start-screenpipe.sh"
fi

# 检查 Node.js 文件
echo ""
echo "📄 Integration files:"
for file in screenpipe-integration.js example-usage.js SCREENPIPE_README.md QUICKSTART.md; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
    fi
done

echo ""
echo "🎯 Quick start commands:"
echo "   ./start-screenpipe.sh                    # Start Screenpipe"
echo "   node example-usage.js                    # Show usage examples"
echo "   node example-usage.js summary 4          # Generate work summary"
echo "   curl http://localhost:3030/search?limit=5 # Test API"
echo ""
