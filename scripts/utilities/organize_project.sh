#!/bin/bash

echo "🧹 开始整理项目文件..."
echo ""

# 创建目录结构
echo "📁 创建目录结构..."
mkdir -p docs/{guides,technical,reports}
mkdir -p scripts/{minecontext,screenpipe,tests,utilities}
mkdir -p demos
mkdir -p source-projects
mkdir -p config

# 移动文档类文件
echo "📖 整理文档..."
mv -f *.md docs/ 2>/dev/null || true
mv -f docs/README_START_HERE.md . 2>/dev/null || true  # 主README保留在根目录

# 整理文档到子文件夹
mv -f docs/*SUMMARY.md docs/reports/ 2>/dev/null || true
mv -f docs/*REPORT.md docs/reports/ 2>/dev/null || true
mv -f docs/*ROADMAP.md docs/reports/ 2>/dev/null || true
mv -f docs/*REFERENCE.md docs/guides/ 2>/dev/null || true
mv -f docs/*START*.md docs/guides/ 2>/dev/null || true
mv -f docs/*QUICK*.md docs/guides/ 2>/dev/null || true
mv -f docs/SCREENPIPE*.md docs/guides/ 2>/dev/null || true
mv -f docs/*.md docs/technical/ 2>/dev/null || true

# 移动脚本文件
echo "🔧 整理脚本..."
mv -f *_rag*.py demos/ 2>/dev/null || true
mv -f demo*.py demos/ 2>/dev/null || true
mv -f demo*.js demos/ 2>/dev/null || true
mv -f demo*.sh demos/ 2>/dev/null || true
mv -f test*.py scripts/tests/ 2>/dev/null || true
mv -f test*.sh scripts/tests/ 2>/dev/null || true
mv -f *screenpipe*.sh scripts/screenpipe/ 2>/dev/null || true
mv -f *screenpipe*.py scripts/screenpipe/ 2>/dev/null || true
mv -f screenpipe-integration.js scripts/screenpipe/ 2>/dev/null || true
mv -f example-usage.js scripts/screenpipe/ 2>/dev/null || true
mv -f *minecontext*.sh scripts/minecontext/ 2>/dev/null || true
mv -f MineContext_Commands.sh scripts/minecontext/ 2>/dev/null || true
mv -f switch*.sh scripts/utilities/ 2>/dev/null || true
mv -f import*.py scripts/utilities/ 2>/dev/null || true
mv -f 快速*.sh scripts/utilities/ 2>/dev/null || true

# 移动源代码项目
echo "📦 整理源代码项目..."
mv -f *-main/ source-projects/ 2>/dev/null || true
mv -f MineDesk/ source-projects/ 2>/dev/null || true
mv -f AingDesk-main/ source-projects/ 2>/dev/null || true
mv -f Everywhere-main/ source-projects/ 2>/dev/null || true

# 清理临时文件
echo "🗑️  清理临时文件..."
rm -f SETUP_COMPLETE.txt 2>/dev/null || true
rm -f test_doc.md 2>/dev/null || true

echo ""
echo "✅ 整理完成！"
echo ""
echo "📁 新的目录结构:"
echo ""
echo "killer app/"
echo "├── README_START_HERE.md       ← 从这里开始"
echo "├── docs/"
echo "│   ├── guides/                ← 使用指南"
echo "│   ├── technical/             ← 技术文档"
echo "│   └── reports/               ← 项目报告"
echo "├── scripts/"
echo "│   ├── minecontext/           ← MineContext 脚本"
echo "│   ├── screenpipe/            ← Screenpipe 脚本"
echo "│   ├── tests/                 ← 测试脚本"
echo "│   └── utilities/             ← 工具脚本"
echo "├── demos/                     ← 演示文件"
echo "├── source-projects/           ← 源代码项目"
echo "└── config/                    ← 配置文件"
echo ""

