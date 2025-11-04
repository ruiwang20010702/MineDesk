#!/usr/bin/env python3
"""测试向量搜索 - 绕过 Agent，直接查询向量数据库"""

import requests
import json

# 测试向量搜索
query = "MineDesk 的核心特性"

print("🔍 直接向量搜索（不使用 Agent/LLM）")
print(f"  查询: {query}")
print(f"  超时: 15 秒\n")

try:
    response = requests.post(
        "http://127.0.0.1:17860/api/vector_search",
        json={
            "query": query,
            "top_k": 5,
            "context_types": [],  # 空列表表示搜索所有类型
            "filters": None
        },
        timeout=15
    )
    
    if response.status_code == 200:
        result = response.json()
        
        if result.get("code") == 0:
            data = result.get("data", {})
            results = data.get("results", [])
            total = data.get("total", 0)
            
            print(f"✅ 搜索成功！")
            print(f"  找到 {total} 条相关结果\n")
            
            # 打印完整响应（调试用）
            print("🔍 完整响应:")
            print(json.dumps(result, ensure_ascii=False, indent=2))
            print("\n")
            
            if total > 0:
                print("=" * 70)
                print("📋 检索结果:")
                print("=" * 70)
                
                for i, item in enumerate(results, 1):
                    content = item.get("content", "")
                    metadata = item.get("metadata", {})
                    context_type = item.get("context_type", "未知")
                    
                    print(f"\n[{i}] 类型: {context_type}")
                    print(f"    内容: {content[:200]}...")
                    print(f"    元数据: {json.dumps(metadata, ensure_ascii=False)}")
                
                print("=" * 70)
            else:
                print("⚠️ 没有找到相关结果")
                print("\n可能原因:")
                print("  1. 文档还在处理中")
                print("  2. 向量化尚未完成")
                print("  3. 查询词与文档内容不匹配")
        else:
            print(f"❌ 搜索失败: {result.get('message', '未知错误')}")
    else:
        print(f"❌ HTTP 错误: {response.status_code}")
        print(f"   响应: {response.text}")
        
except requests.exceptions.Timeout:
    print("⏱️ 请求超时（15秒）")
    print("  这不应该发生 - 向量搜索应该很快")
    
except Exception as e:
    print(f"❌ 错误: {e}")

print("\n" + "="*70)
print("💡 提示:")
print("  - 向量搜索直接查询 ChromaDB，不需要 LLM")
print("  - 如果没有结果，说明文档可能还在处理")
print("  - 查看日志: tail -f MineContext-main/logs/opencontext_2025-11-04.log")

