#!/bin/bash

# 🚀 一键安装并切换到 Ollama
# 自动完成所有步骤

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🚀 一键切换到 Ollama 本地模型                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# 步骤 1: 检查/安装 Ollama
echo -e "${BLUE}[1/5]${NC} 检查 Ollama 安装..."
if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}Ollama 未安装，正在安装...${NC}"
    curl -fsSL https://ollama.com/install.sh | sh
    echo -e "${GREEN}✅ Ollama 安装完成${NC}"
else
    echo -e "${GREEN}✅ Ollama 已安装${NC}"
fi

# 步骤 2: 启动 Ollama 服务
echo ""
echo -e "${BLUE}[2/5]${NC} 启动 Ollama 服务..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ollama 服务已运行${NC}"
else
    echo -e "${YELLOW}正在启动 Ollama 服务...${NC}"
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    sleep 3
    
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ollama 服务启动成功${NC}"
    else
        echo -e "${YELLOW}⚠️  Ollama 可能需要手动启动: ollama serve${NC}"
    fi
fi

# 步骤 3: 选择并下载模型
echo ""
echo -e "${BLUE}[3/5]${NC} 选择模型..."
echo ""
echo "推荐模型（请输入编号）:"
echo "  1. qwen2.5:7b      - 平衡性能和质量（推荐，~4.7GB）"
echo "  2. qwen2.5:1.5b    - 最快速度（~1GB）"
echo "  3. llama3.2:3b     - Meta 出品，质量好（~2GB）"
echo "  4. gemma2:2b       - Google 出品，轻量级（~1.6GB）"
echo ""
read -p "请选择 [1-4] (默认 1): " choice
choice=${choice:-1}

case $choice in
    1) MODEL="qwen2.5:7b" ;;
    2) MODEL="qwen2.5:1.5b" ;;
    3) MODEL="llama3.2:3b" ;;
    4) MODEL="gemma2:2b" ;;
    *) MODEL="qwen2.5:7b" ;;
esac

echo ""
echo -e "${BLUE}选择的模型: ${GREEN}$MODEL${NC}"
echo ""

if ollama list | grep -q "$MODEL"; then
    echo -e "${GREEN}✅ 模型 $MODEL 已下载${NC}"
else
    echo -e "${YELLOW}正在下载模型 $MODEL（这可能需要几分钟）...${NC}"
    ollama pull "$MODEL"
    echo -e "${GREEN}✅ 模型下载完成${NC}"
fi

# 步骤 4: 测试模型
echo ""
echo -e "${BLUE}[4/5]${NC} 测试模型..."
echo ""
echo -e "${YELLOW}测试问题: 你好，请用一句话介绍你自己${NC}"
echo ""
ollama run "$MODEL" "你好，请用一句话介绍你自己" 2>/dev/null || echo "测试跳过"
echo ""

# 步骤 5: 切换 MineContext 配置
echo ""
echo -e "${BLUE}[5/5]${NC} 切换 MineContext 配置..."

cd "/Users/ruiwang/Desktop/killer app"
./switch_llm.sh ollama "$MODEL"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║               ✅ 切换完成！                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📋 配置总结:"
echo "  • LLM 模型: $MODEL (本地)"
echo "  • 预期速度: 3-10秒（比 API 快 3-6倍）"
echo "  • 隐私: 完全本地，无数据上传"
echo "  • 成本: 免费，无配额限制"
echo ""
echo -e "${YELLOW}⚠️  下一步操作:${NC}"
echo ""
echo "  1. 重启 MineContext 服务:"
echo -e "     ${BLUE}cd '/Users/ruiwang/Desktop/killer app'${NC}"
echo -e "     ${BLUE}source MineContext_Commands.sh${NC}"
echo -e "     ${BLUE}restart${NC}"
echo ""
echo "  2. 运行测试:"
echo -e "     ${BLUE}python3 quick_rag_test.py${NC}"
echo ""
echo -e "${GREEN}享受超快的本地 AI 体验！🚀${NC}"
echo ""

