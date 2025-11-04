#!/usr/bin/env python3
"""导入小文档进行快速测试"""

import requests
import json
import os
import time

# 小测试文档
test_doc_path = os.path.abspath("test_doc.md")

print("📄 导入小测试文档")
print(f"  路径: {test_doc_path}")
print(f"  大小: {os.path.getsize(test_doc_path)} 字节\n")

# 导入文档
try:
    response = requests.post(
        "http://127.0.0.1:17860/api/documents/upload",
        json={"file_path": test_doc_path},
        timeout=30
    )
    
    if response.status_code == 200:
        print("✅ 导入成功！")
        print(f"   响应: {response.json()}\n")
        
        # 等待处理
        print("⏳ 等待 8 秒让系统处理...")
        time.sleep(8)
        
        # 测试查询
        print("\n🔍 测试查询...")
        query = "MineDesk 的核心特性是什么？"
        print(f"  问题: {query}")
        
        query_response = requests.post(
            "http://127.0.0.1:17860/api/agent/chat",
            json={
                "query": query,
                "sessionId": "small-doc-test"
            },
            timeout=45
        )
        
        if query_response.status_code == 200:
            result = query_response.json()
            print("\n✅ 查询成功！")
            print("=" * 70)
            print(result.get("response", "无回答"))
            print("=" * 70)
            print(f"\n📚 检索到 {len(result.get('context', []))} 条上下文")
        else:
            print(f"\n❌ 查询失败: HTTP {query_response.status_code}")
            print(f"   {query_response.text}")
            
    else:
        print(f"❌ 导入失败: HTTP {response.status_code}")
        print(f"   {response.text}")
        
except requests.exceptions.Timeout as e:
    print(f"⏱️ 请求超时: {e}")
    print("\n💡 系统响应很慢，可能是:")
    print("   1. SiliconFlow API 调用慢")
    print("   2. 文档处理队列堵塞")
    print("   3. 资源不足")
    
except Exception as e:
    print(f"❌ 错误: {e}")

