#!/usr/bin/env python3
"""简单的查询测试脚本 - 更长的超时时间"""

import requests
import json

# 测试查询
query = "MineDesk 是什么？它的核心功能有哪些？"

print("🔍 发送查询...")
print(f"  问题: {query}")
print(f"  超时设置: 60 秒\n")

try:
    response = requests.post(
        "http://127.0.0.1:17860/api/agent/chat",
        json={
            "query": query,
            "sessionId": "manual-test-001"
        },
        timeout=60  # 增加到 60 秒
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ 查询成功！\n")
        
        # 显示回答
        answer = result.get("response", "无回答")
        print("=" * 70)
        print("💬 回答:")
        print("=" * 70)
        print(answer)
        print("=" * 70)
        
        # 显示上下文信息
        context = result.get("context", [])
        print(f"\n📚 检索到 {len(context)} 条相关上下文")
        
        if context and len(context) > 0:
            print("\n前 3 条上下文片段:")
            for i, ctx in enumerate(context[:3], 1):
                content = ctx.get("content", "")[:150]
                source = ctx.get("metadata", {}).get("source", "未知")
                print(f"  [{i}] {content}... (来源: {source})")
        
        # 显示完整响应（用于调试）
        print(f"\n🔍 完整响应（JSON）:")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    else:
        print(f"❌ 查询失败: HTTP {response.status_code}")
        print(f"  响应: {response.text}")
        
except requests.exceptions.Timeout:
    print("⏱️ 请求超时！")
    print("\n可能原因：")
    print("  1. 文档还在处理中（21页需要时间）")
    print("  2. SiliconFlow API 响应慢")
    print("  3. 首次查询需要生成嵌入")
    print("\n💡 建议：再等 1-2 分钟，然后重试")
    
except requests.exceptions.RequestException as e:
    print(f"❌ 请求错误: {e}")

