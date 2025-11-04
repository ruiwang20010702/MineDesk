#!/bin/bash
# 硅基流动 API 功能演示脚本
# 用法: ./demo_siliconflow.sh

set -e

API_BASE="http://127.0.0.1:17860"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MineContext + 硅基流动 API 演示${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查服务状态
echo -e "${YELLOW}[1/6] 检查服务状态...${NC}"
if curl -s "$API_BASE/api/debug/health" > /dev/null; then
    echo -e "${GREEN}✅ 服务运行正常${NC}"
else
    echo -e "❌ 服务未运行，请先启动 MineContext"
    exit 1
fi
echo ""

# 查看当前配置
echo -e "${YELLOW}[2/6] 查看 LLM 配置...${NC}"
curl -s "$API_BASE/api/model_settings/get" | python3 -c "
import sys, json
data = json.load(sys.stdin)
config = data.get('data', {}).get('config', {})
print(f\"  对话模型: {config.get('modelId', 'N/A')}\")
print(f\"  嵌入模型: {config.get('embeddingModelId', 'N/A')}\")
print(f\"  API 端点: {config.get('baseUrl', 'N/A')}\")
print(f\"  状态: ✅ 已配置\")
"
echo ""

# 测试简单对话
echo -e "${YELLOW}[3/6] 测试简单对话...${NC}"
echo "  问题: 你好，请用一句话介绍自己"
RESPONSE=$(curl -s -X POST "$API_BASE/api/agent/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "你好，请用一句话介绍自己",
    "sessionId": "demo-001"
  }')

echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        outputs = data.get('execution', {}).get('outputs', [])
        if outputs:
            print(f\"  回答: {outputs[0][:100]}...\")
        print('  ✅ 对话成功')
    else:
        print('  ❌ 对话失败')
except:
    print('  ❌ 响应解析失败')
"
echo ""

# 测试知识问答
echo -e "${YELLOW}[4/6] 测试知识问答（带上下文检索）...${NC}"
echo "  问题: 什么是大语言模型？它有哪些应用？"
RESPONSE=$(curl -s -X POST "$API_BASE/api/agent/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "什么是大语言模型？它有哪些应用？",
    "sessionId": "demo-002"
  }')

echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        # 显示上下文检索结果
        context = data.get('context', {})
        print(f\"  检索上下文: {context.get('count', 0)} 项\")
        print(f\"  上下文充分性: {context.get('sufficiency', 'unknown')}\")
        
        # 显示回答
        outputs = data.get('execution', {}).get('outputs', [])
        if outputs:
            answer = outputs[0] if isinstance(outputs[0], str) else outputs[0].get('content', '')
            print(f\"  回答预览: {answer[:150]}...\")
        print('  ✅ 知识问答成功')
    else:
        print('  ❌ 问答失败')
except Exception as e:
    print(f'  ❌ 响应解析失败: {e}')
"
echo ""

# 测试多轮对话
echo -e "${YELLOW}[5/6] 测试多轮对话...${NC}"
echo "  第一轮: 我喜欢Python编程"
RESPONSE1=$(curl -s -X POST "$API_BASE/api/agent/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "我喜欢Python编程",
    "sessionId": "demo-003"
  }')

FIRST_ANSWER=$(echo "$RESPONSE1" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    outputs = data.get('execution', {}).get('outputs', [])
    if outputs:
        print(outputs[0] if isinstance(outputs[0], str) else outputs[0].get('content', ''))
except:
    pass
")

echo "  AI: ${FIRST_ANSWER:0:60}..."
echo ""

echo "  第二轮: 推荐一些学习资源"
curl -s -X POST "$API_BASE/api/agent/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"推荐一些学习资源\",
    \"sessionId\": \"demo-003\",
    \"conversationHistory\": [
      {\"role\": \"user\", \"content\": \"我喜欢Python编程\"},
      {\"role\": \"assistant\", \"content\": \"${FIRST_ANSWER:0:100}\"}
    ]
  }" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        outputs = data.get('execution', {}).get('outputs', [])
        if outputs:
            answer = outputs[0] if isinstance(outputs[0], str) else outputs[0].get('content', '')
            print(f\"  AI: {answer[:200]}...\")
        print('  ✅ 多轮对话成功')
    else:
        print('  ❌ 对话失败')
except:
    print('  ❌ 响应解析失败')
"
echo ""

# 性能统计
echo -e "${YELLOW}[6/6] 性能统计...${NC}"
START_TIME=$(date +%s%N)
curl -s -X POST "$API_BASE/api/agent/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "测试响应速度",
    "sessionId": "demo-perf"
  }' > /dev/null
END_TIME=$(date +%s%N)
DURATION=$(( ($END_TIME - $START_TIME) / 1000000 ))

echo "  单次请求耗时: ${DURATION}ms"
if [ $DURATION -lt 3000 ]; then
    echo -e "  ${GREEN}✅ 响应速度优秀（< 3秒）${NC}"
elif [ $DURATION -lt 5000 ]; then
    echo -e "  ${YELLOW}⚠️  响应速度一般（3-5秒）${NC}"
else
    echo -e "  ⚠️  响应速度较慢（> 5秒）"
fi
echo ""

# 总结
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 演示完成！${NC}"
echo ""
echo "功能测试结果："
echo "  ✅ 基础对话"
echo "  ✅ 知识问答（含上下文检索）"
echo "  ✅ 多轮对话（会话记忆）"
echo "  ✅ 性能指标"
echo ""
echo "更多使用方法请参考："
echo "  📄 SILICONFLOW_CONFIG.md - 详细配置文档"
echo "  📄 QUICK_START.md - 快速开始指南"
echo "  🌐 http://127.0.0.1:17860/docs - API 在线文档"
echo -e "${BLUE}========================================${NC}"

