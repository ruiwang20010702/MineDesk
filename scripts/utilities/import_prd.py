#!/usr/bin/env python3
"""导入 MineDesk PRD 到 MineContext（使用正确的 API）"""

import requests
import json
import os
import sys
import time

# PRD 文档路径（绝对路径）
prd_path = os.path.abspath("MineDesk/MineDesk_PRD_v1.6.md")

# 检查文件是否存在
if not os.path.exists(prd_path):
    print(f"❌ 文件不存在: {prd_path}")
    exit(1)

print("📄 准备导入 MineDesk PRD 文档")
print(f"  文件路径: {prd_path}")
print(f"  文件大小: {os.path.getsize(prd_path)} 字节")

# 准备导入请求（MineContext 使用文件路径方式）
document_data = {
    "file_path": prd_path
}

# 发送导入请求
print("\n⏳ 正在导入...")

try:
    response = requests.post(
        "http://127.0.0.1:17860/api/documents/upload",
        json=document_data,
        timeout=120
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ 导入成功！")
        print(f"  响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
        print("\n💡 文档已加入处理队列，正在后台处理中...")
        print("  请稍等 10-15 秒，让系统完成文档处理和向量化...")
    else:
        print(f"❌ 导入失败: HTTP {response.status_code}")
        print(f"  响应: {response.text}")
        exit(1)
        
except requests.exceptions.RequestException as e:
    print(f"❌ 请求错误: {e}")
    exit(1)

# 等待文档处理完成
print("\n⏳ 等待 12 秒让系统处理文档...")
time.sleep(12)

print("\n" + "="*50)
print("🧪 测试 RAG 检索（仅1个快速查询）...")

# 简化测试：只做一个查询
query = "MineDesk 的产品定位是什么？"
print(f"\n问题: {query}")
try:
    response = requests.post(
        "http://127.0.0.1:17860/api/agent/chat",
        json={
            "query": query,
            "sessionId": "prd-quick-test"
        },
        timeout=30
    )
    
    if response.status_code == 200:
        result = response.json()
        answer = result.get("response", "无回答")
        context_count = len(result.get("context", []))
        print(f"✅ 检索成功!")
        print(f"  检索上下文: {context_count} 项")
        print(f"  回答: {answer[:300]}...")
    else:
        print(f"❌ 查询失败: HTTP {response.status_code}")
        
except requests.exceptions.RequestException as e:
    print(f"❌ 请求错误: {e}")

print("\n" + "="*50)
print("✅ 导入和测试完成！")
print("\n💡 您现在可以：")
print("  1. 访问 API 文档: http://127.0.0.1:17860/docs")
print("  2. 使用聊天接口询问关于 PRD 的任何问题")
print("  3. 导入更多文档（工作笔记、代码文档等）")

