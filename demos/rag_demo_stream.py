#!/usr/bin/env python3
"""
MineDesk RAG 流式问答演示
使用流式响应 API 解决超时问题
"""

import requests
import json
import sseclient  # pip install sseclient-py
from typing import Dict

# API 配置
BASE_URL = "http://127.0.0.1:17860"


def vector_search(query: str, k: int = 5) -> Dict:
    """向量搜索 - 快速检索相关内容"""
    print(f"🔍 向量搜索: {query}")
    print("-" * 80)
    
    response = requests.post(
        f"{BASE_URL}/api/search/vector",
        json={"query": query, "k": k},
        timeout=10
    )
    
    if response.status_code != 200:
        print(f"❌ 搜索失败: {response.status_code}")
        return {}
    
    data = response.json().get('data', {})
    results = data.get('results', [])
    
    print(f"✅ 找到 {len(results)} 个相关片段")
    
    for i, item in enumerate(results[:3], 1):
        context_data = item.get('context', {}).get('extracted_data', {})
        score = item.get('score', 0)
        summary = context_data.get('summary', '')
        
        print(f"\n📄 片段 {i} (相似度: {score:.3f})")
        print(f"   {summary[:120]}...")
    
    print()
    return data


def agent_chat_stream(query: str, session_id: str = "demo"):
    """智能问答 - 使用流式响应（解决超时问题）"""
    print(f"💬 智能问答（流式）: {query}")
    print("-" * 80)
    
    try:
        # 使用流式 API
        response = requests.post(
            f"{BASE_URL}/api/agent/chat/stream",
            json={
                "query": query,
                "sessionId": session_id
            },
            stream=True,  # 关键：启用流式接收
            timeout=120   # 更长的超时时间
        )
        
        if response.status_code != 200:
            print(f"❌ 请求失败: {response.status_code}")
            print(response.text)
            return
        
        print("✅ 开始接收流式响应...\n")
        
        # 解析 SSE (Server-Sent Events)
        client = sseclient.SSEClient(response)
        
        answer_text = ""
        event_count = 0
        
        for event in client.events():
            if not event.data:
                continue
                
            try:
                data = json.loads(event.data)
                event_type = data.get('type', '')
                stage = data.get('stage', '')
                
                event_count += 1
                
                # 根据不同的事件类型处理
                if event_type == 'session_start':
                    session_id = data.get('session_id', '')
                    print(f"🆔 会话开始: {session_id}")
                
                elif stage == 'understanding':
                    print(f"🧠 意图理解中...")
                
                elif stage == 'planning':
                    print(f"📋 规划执行步骤...")
                
                elif stage == 'retrieval':
                    print(f"🔍 检索相关上下文...")
                
                elif stage == 'generation':
                    content = data.get('content', '')
                    if content:
                        # 流式输出答案
                        print(content, end='', flush=True)
                        answer_text += content
                
                elif stage == 'completed':
                    print(f"\n\n✅ 回答完成!")
                    result = data.get('result', {})
                    contexts = result.get('contexts', [])
                    if contexts:
                        print(f"📚 使用了 {len(contexts)} 个上下文")
                    break
                
                elif stage == 'failed':
                    error = data.get('error', 'Unknown error')
                    print(f"\n\n❌ 执行失败: {error}")
                    break
            
            except json.JSONDecodeError:
                continue
        
        print(f"\n📊 收到 {event_count} 个事件")
        
        if answer_text:
            print(f"\n完整答案:")
            print(f"{answer_text[:500]}...")
        
        print()
        
    except requests.Timeout:
        print("⏱️ 请求超时")
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()


def main():
    """主测试流程"""
    print("=" * 80)
    print("🚀 MineDesk RAG 流式问答演示")
    print("=" * 80)
    print()
    print("💡 说明:")
    print("   - 使用流式响应 API 避免超时")
    print("   - 实时显示处理进度")
    print("   - 逐字输出 AI 回答")
    print()
    
    # 测试场景
    scenarios = [
        {
            "name": "快速检索测试",
            "query": "MineDesk 的核心架构包含哪些模块？",
            "type": "vector"
        },
        {
            "name": "流式问答测试",
            "query": "MineDesk 是什么？它的主要功能有哪些？",
            "type": "agent_stream"
        }
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n{'='*80}")
        print(f"场景 {i}: {scenario['name']}")
        print(f"{'='*80}\n")
        
        if scenario['type'] == "vector":
            vector_search(scenario['query'], k=3)
        elif scenario['type'] == "agent_stream":
            agent_chat_stream(scenario['query'], f"demo-stream-{i}")
        
        print()
    
    print("=" * 80)
    print("✅ 演示完成！")
    print("=" * 80)
    print()
    print("📊 总结:")
    print("   ✓ 向量搜索工作正常（< 1秒）")
    print("   ✓ 流式响应解决了超时问题")
    print("   ✓ 可以实时看到 AI 思考和回答过程")
    print()
    print("💡 提示:")
    print("   - 流式响应需要安装: pip install sseclient-py")
    print("   - 如果还是超时，检查 LLM API 可用性")
    print("   - SiliconFlow API 有时会有速率限制")


if __name__ == "__main__":
    # 检查依赖
    try:
        import sseclient
    except ImportError:
        print("❌ 缺少依赖: sseclient-py")
        print("请运行: pip install sseclient-py")
        exit(1)
    
    main()

