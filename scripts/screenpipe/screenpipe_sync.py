#!/usr/bin/env python3
"""
Screenpipe → MineContext 同步脚本
每小时自动同步一次桌面活动数据，实现完整的"记忆→理解"链路
"""

import sqlite3
import requests
from datetime import datetime, timedelta
import time
import json
import os
from pathlib import Path

# ============ 配置 ============
SCREENPIPE_DB = os.path.expanduser("~/.screenpipe/db.sqlite")
MINECONTEXT_API = "http://127.0.0.1:17860"
SYNC_INTERVAL = 3600  # 1小时（秒）
MIN_CONTEXT_LENGTH = 50  # 最小上下文长度（字符）
MAX_CONTEXT_LENGTH = 2000  # 最大上下文长度（字符）

# ============ 工具函数 ============

def check_screenpipe_db():
    """检查 Screenpipe 数据库是否存在"""
    if not os.path.exists(SCREENPIPE_DB):
        print(f"❌ 错误: 找不到 Screenpipe 数据库: {SCREENPIPE_DB}")
        print(f"💡 请先启动 Screenpipe:")
        print(f"   cd screenpipe-main && ./target/release/screenpipe")
        return False
    return True

def check_minecontext_api():
    """检查 MineContext API 是否可用"""
    try:
        response = requests.get(f"{MINECONTEXT_API}/api/health", timeout=5)
        if response.status_code == 200:
            return True
        else:
            print(f"❌ MineContext API 返回错误: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 无法连接到 MineContext API: {e}")
        print(f"💡 请先启动 MineContext:")
        print(f"   cd '/Users/ruiwang/Desktop/killer app' && ./start_minecontext.sh")
        return False

# ============ 数据获取 ============

def fetch_recent_activities(hours=1):
    """从 Screenpipe 获取最近的活动"""
    try:
        conn = sqlite3.connect(SCREENPIPE_DB)
        cursor = conn.cursor()
        
        since = datetime.now() - timedelta(hours=hours)
        since_ts = since.strftime("%Y-%m-%d %H:%M:%S")
        
        # 查询最近的 frames 和 OCR 文本
        query = """
        SELECT 
            f.timestamp,
            f.app_name,
            f.window_name,
            o.text as ocr_text
        FROM frames f
        LEFT JOIN ocr_text o ON f.id = o.frame_id
        WHERE f.timestamp > ?
        ORDER BY f.timestamp DESC
        """
        
        cursor.execute(query, (since_ts,))
        activities = cursor.fetchall()
        conn.close()
        
        return activities
    
    except sqlite3.Error as e:
        print(f"❌ 查询 Screenpipe 数据库失败: {e}")
        return []

# ============ 数据处理 ============

def group_activities_by_context(activities):
    """
    将活动按上下文分组
    同一应用+窗口的连续活动合并为一个上下文
    """
    contexts = {}
    
    for timestamp, app, window, ocr_text in activities:
        # 跳过空值
        if not app:
            continue
        
        # 生成上下文键
        key = f"{app}::{window or 'Unknown Window'}"
        
        if key not in contexts:
            contexts[key] = {
                "app": app,
                "window": window or "Unknown Window",
                "ocr_texts": [],
                "start_time": timestamp,
                "end_time": timestamp,
                "count": 0
            }
        
        # 添加 OCR 文本（去重）
        if ocr_text and ocr_text.strip():
            if ocr_text not in contexts[key]["ocr_texts"]:
                contexts[key]["ocr_texts"].append(ocr_text.strip())
        
        contexts[key]["end_time"] = timestamp
        contexts[key]["count"] += 1
    
    return list(contexts.values())

def filter_contexts(contexts):
    """过滤上下文，移除无意义的内容"""
    filtered = []
    
    for ctx in contexts:
        # 合并 OCR 文本
        content = "\n\n".join(ctx["ocr_texts"])
        
        # 跳过过短的内容
        if len(content) < MIN_CONTEXT_LENGTH:
            continue
        
        # 截断过长的内容
        if len(content) > MAX_CONTEXT_LENGTH:
            content = content[:MAX_CONTEXT_LENGTH] + "\n\n[内容过长，已截断...]"
        
        ctx["merged_content"] = content
        filtered.append(ctx)
    
    return filtered

# ============ 数据摄入 ============

def ingest_to_minecontext(contexts):
    """将上下文摄入 MineContext"""
    success_count = 0
    fail_count = 0
    
    for ctx in contexts:
        content = ctx["merged_content"]
        
        # 构造文档
        doc_id = f"screenpipe_{ctx['app']}_{ctx['start_time'].replace(':', '-').replace(' ', '_')}"
        
        doc = {
            "documentId": doc_id,
            "source": "screenpipe",
            "mimeType": "text/plain",
            "title": f"{ctx['app']} - {ctx['window']}",
            "createdAt": ctx["start_time"],
            "content": content,
            "metadata": {
                "app": ctx["app"],
                "window": ctx["window"],
                "start_time": ctx["start_time"],
                "end_time": ctx["end_time"],
                "frame_count": ctx["count"],
                "type": "screen_capture",
                "source": "screenpipe"
            }
        }
        
        try:
            response = requests.post(
                f"{MINECONTEXT_API}/api/ingest/document/write",
                json=doc,
                timeout=30
            )
            
            if response.status_code == 200:
                print(f"  ✅ {ctx['app'][:20]:20s} | {ctx['window'][:30]:30s} | {len(content):4d} 字符")
                success_count += 1
            else:
                print(f"  ❌ {ctx['app'][:20]:20s} | 失败: {response.status_code}")
                fail_count += 1
        
        except Exception as e:
            print(f"  ❌ {ctx['app'][:20]:20s} | 错误: {str(e)[:40]}")
            fail_count += 1
    
    return success_count, fail_count

# ============ 主循环 ============

def sync_once(hours=1):
    """执行一次同步"""
    print(f"\n⏰ [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 开始同步...")
    
    # 1. 获取活动
    activities = fetch_recent_activities(hours=hours)
    print(f"📥 获取到 {len(activities)} 条活动记录")
    
    if not activities:
        print("💤 暂无新活动")
        return 0, 0
    
    # 2. 分组
    contexts = group_activities_by_context(activities)
    print(f"🔄 分组为 {len(contexts)} 个上下文")
    
    # 3. 过滤
    filtered = filter_contexts(contexts)
    print(f"✨ 过滤后剩余 {len(filtered)} 个有效上下文")
    
    if not filtered:
        print("💤 没有有效内容可同步")
        return 0, 0
    
    # 4. 摄入
    print(f"📤 开始摄入 MineContext:")
    success, fail = ingest_to_minecontext(filtered)
    
    print(f"\n✅ 同步完成: {success} 成功, {fail} 失败")
    return success, fail

def main_loop():
    """主循环：定时同步"""
    print("=" * 70)
    print("🚀 Screenpipe → MineContext 同步服务")
    print("=" * 70)
    print(f"📊 同步间隔: {SYNC_INTERVAL}秒 ({SYNC_INTERVAL/3600:.1f}小时)")
    print(f"📂 Screenpipe DB: {SCREENPIPE_DB}")
    print(f"🔗 MineContext API: {MINECONTEXT_API}")
    print(f"📏 内容长度: {MIN_CONTEXT_LENGTH} - {MAX_CONTEXT_LENGTH} 字符")
    print("=" * 70)
    
    # 检查依赖
    if not check_screenpipe_db():
        return
    
    if not check_minecontext_api():
        return
    
    print("\n✅ 所有依赖检查通过，开始监控...")
    print("💡 按 Ctrl+C 停止\n")
    
    # 首次同步
    sync_once(hours=1)
    
    # 定时循环
    while True:
        try:
            next_sync = datetime.now() + timedelta(seconds=SYNC_INTERVAL)
            print(f"\n⏳ 下次同步: {next_sync.strftime('%H:%M:%S')}")
            print(f"💤 休眠 {SYNC_INTERVAL} 秒...")
            
            time.sleep(SYNC_INTERVAL)
            
            # 执行同步
            sync_once(hours=1)
        
        except KeyboardInterrupt:
            print("\n\n⏹️  收到停止信号，退出...")
            break
        
        except Exception as e:
            print(f"\n❌ 同步出错: {e}")
            print("⏳ 等待 60 秒后重试...")
            time.sleep(60)

# ============ 命令行工具 ============

def run_once():
    """运行一次同步（用于测试）"""
    print("🧪 测试模式: 执行一次同步\n")
    
    if not check_screenpipe_db():
        return
    
    if not check_minecontext_api():
        return
    
    success, fail = sync_once(hours=1)
    
    if success > 0:
        print("\n✅ 测试成功！您可以在 MineContext 中搜索刚才的活动了。")
        print(f"💡 尝试运行: python3 demo_rag_success.py")
    else:
        print("\n⚠️  没有同步任何内容，请检查 Screenpipe 是否正在运行。")

if __name__ == "__main__":
    import sys
    
    # 检查命令行参数
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        run_once()
    else:
        main_loop()

