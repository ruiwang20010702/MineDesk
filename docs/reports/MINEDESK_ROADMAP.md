# 🚀 MineDesk 开发路线图与行动计划

> **项目愿景**：打造一个 Local-first + AI-native 的个人知识操作系统  
> **当前状态**：✅ 理解层就绪（MineContext + RAG）| 🟡 记忆层待启动 | 🔲 交互层待开发

---

## 📊 整体进度概览

根据 PRD v1.6 的 30 周路线图，当前所处位置：

| 阶段 | 目标 | 状态 | 进度 |
|------|------|------|------|
| **M0** (1-2周) | 架构设计与接口定义 | ✅ 已完成 | 100% |
| **M1** (3-5周) | macOS 原型 + screenpipe 通路 | 🟡 进行中 | 65% |
| **M2** (6-9周) | Graph + KB MVP | 🟡 部分完成 | 40% |
| **M2.5** (9-10周) | SQLite-VSS 升级 | 🔲 待开始 | 0% |
| **M3** (10-13周) | 隐私中心与混合同步 | 🔲 待开始 | 0% |
| **M4** (14-17周) | weekly_report 模块 | 🔲 待开始 | 0% |
| **M5** (18-21周) | MCP 平台（Notion/GitHub） | 🔲 待开始 | 0% |
| **M6** (22-26周) | CrewAI 协作 + Windows 适配 | 🔲 待开始 | 0% |
| **M7** (27-30周) | iOS 轻量版 | 🔲 待开始 | 0% |

**当前位置**：M1 阶段后期 → M2 阶段早期

---

## 🎯 MineDesk 架构全景

```
┌─────────────────────────────────────────────────────────────┐
│                    MineDesk 系统架构                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  交互层（UI Layer）   │  ← 快捷键、选区、OCR、对话
│  - Everywhere        │  
│  - Electron 前端     │  🔲 待开发
└──────────┬──────────┘
           ↓
┌──────────────────────┐
│  记忆层（Memory）     │  ← 桌面时间线、截图、OCR
│  - screenpipe        │  🟡 待启动
└──────────┬──────────┘
           ↓
┌──────────────────────┐
│  理解层（Intelligence）│  ← 语义理解、RAG、嵌入
│  - MineContext       │  ✅ 已部署（SiliconFlow）
│  - Vector Search     │  ✅ 已验证
└──────────┬──────────┘
           ↓
┌──────────────────────┐
│  知识层（Knowledge）  │  ← 本地图谱、知识库
│  - Graph + KB        │  🟡 部分实现（SQLite）
│  - NetworkX          │  🔲 待集成
└──────────┬──────────┘
           ↓
┌──────────────────────┐
│  执行层（Execution）  │  ← Agent 宿主、工作流
│  - AingDesk          │  🔲 待集成
│  - CrewAI Layer      │  🔲 待实现
└──────────┬──────────┘
           ↓
┌──────────────────────┐
│  产出层（Output）     │  ← 报告、导出、MCP
│  - weekly_report     │  🔲 待开发
│  - MCP Platform      │  🔲 待开发
└──────────────────────┘
```

---

## 🔥 第一阶段：验证与完善基础（本周，2-3 天）

### 目标
确保现有系统稳定运行，建立完整的"记忆→理解→检索"链路。

### 任务清单

#### ✅ 1.1 已完成的工作
- [x] MineContext 后端部署（FastAPI）
- [x] SiliconFlow API 配置（Qwen2.5-7B + BGE-Large-zh）
- [x] 基础 RAG 功能验证
- [x] 导入 MineDesk PRD 文档
- [x] 向量检索测试（< 2秒响应，相关度 0.7+）

#### 🔲 1.2 启动 Screenpipe（记忆层）⭐⭐⭐

**为什么重要**：这是 MineDesk 的核心差异化功能 - 自动捕获工作上下文

**具体步骤**：
```bash
cd "/Users/ruiwang/Desktop/killer app/screenpipe-main"

# 检查是否已编译
ls -la target/release/screenpipe

# 如果未编译，执行编译（需要 15-20 分钟）
cargo build --release

# 启动 Screenpipe
./target/release/screenpipe --data-dir ~/.screenpipe
```

**配置要点**：
1. **授予权限**（macOS 系统偏好设置）：
   - 屏幕录制权限
   - 辅助功能访问（可选）
   - 麦克风权限（可选）

2. **隐私配置**：
   ```bash
   # 配置红区遮罩（避免捕获敏感信息）
   # 编辑 ~/.screenpipe/config.toml
   [privacy]
   excluded_apps = ["1Password", "Keychain Access"]
   excluded_windows = [".*password.*", ".*secret.*"]
   ```

3. **验证数据采集**：
   ```bash
   # 等待 5-10 分钟后检查数据
   sqlite3 ~/.screenpipe/db.sqlite "
     SELECT COUNT(*) as total_frames FROM frames;
     SELECT COUNT(*) as total_ocr FROM ocr_text;
     SELECT app_name, COUNT(*) as count 
     FROM frames 
     GROUP BY app_name 
     ORDER BY count DESC 
     LIMIT 10;
   "
   ```

**预期结果**：
- 每分钟捕获 1-2 个屏幕快照
- OCR 文本识别成功率 > 80%
- CPU 占用 < 15%
- 磁盘增长 < 100MB/小时

---

#### 🔲 1.3 连接 Screenpipe 到 MineContext ⭐⭐⭐

**目标**：将 Screenpipe 采集的数据自动摄入 MineContext，实现语义检索

**实现方案**：创建同步脚本

```python
# 创建文件：screenpipe_sync.py
#!/usr/bin/env python3
"""
Screenpipe → MineContext 同步脚本
每小时自动同步一次桌面活动数据
"""

import sqlite3
import requests
from datetime import datetime, timedelta
import time
import json

SCREENPIPE_DB = "/Users/ruiwang/.screenpipe/db.sqlite"
MINECONTEXT_API = "http://127.0.0.1:17860"
SYNC_INTERVAL = 3600  # 1小时

def fetch_recent_activities(hours=1):
    """从 Screenpipe 获取最近的活动"""
    conn = sqlite3.connect(SCREENPIPE_DB)
    cursor = conn.cursor()
    
    since = datetime.now() - timedelta(hours=hours)
    since_ts = since.strftime("%Y-%m-%d %H:%M:%S")
    
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

def group_activities_by_context(activities):
    """将活动按上下文分组（同一应用+窗口）"""
    contexts = {}
    
    for timestamp, app, window, ocr_text in activities:
        key = f"{app}::{window}"
        
        if key not in contexts:
            contexts[key] = {
                "app": app,
                "window": window,
                "ocr_texts": [],
                "start_time": timestamp,
                "end_time": timestamp
            }
        
        contexts[key]["ocr_texts"].append(ocr_text)
        contexts[key]["end_time"] = timestamp
    
    return list(contexts.values())

def ingest_to_minecontext(contexts):
    """将上下文摄入 MineContext"""
    for ctx in contexts:
        # 合并 OCR 文本
        content = "\n".join(filter(None, ctx["ocr_texts"]))
        
        if not content.strip():
            continue  # 跳过空内容
        
        doc = {
            "documentId": f"screenpipe_{ctx['start_time']}",
            "source": "screenpipe",
            "mimeType": "text/plain",
            "title": f"{ctx['app']} - {ctx['window']}",
            "createdAt": ctx["start_time"],
            "content": content,
            "metadata": {
                "app": ctx["app"],
                "window": ctx["window"],
                "duration": ctx["end_time"] - ctx["start_time"],
                "type": "screen_capture"
            }
        }
        
        try:
            response = requests.post(
                f"{MINECONTEXT_API}/api/ingest/document/write",
                json=doc,
                timeout=30
            )
            
            if response.status_code == 200:
                print(f"✅ Synced: {ctx['app']} - {ctx['window']}")
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
        
        except Exception as e:
            print(f"❌ Error: {e}")

def main():
    """主循环：每小时同步一次"""
    print(f"🚀 Screenpipe → MineContext 同步服务已启动")
    print(f"📊 同步间隔: {SYNC_INTERVAL}秒 ({SYNC_INTERVAL/3600}小时)")
    print(f"📂 Screenpipe DB: {SCREENPIPE_DB}")
    print(f"🔗 MineContext API: {MINECONTEXT_API}")
    print("-" * 60)
    
    while True:
        try:
            print(f"\n⏰ [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 开始同步...")
            
            # 获取活动
            activities = fetch_recent_activities(hours=1)
            print(f"📥 获取到 {len(activities)} 条活动记录")
            
            # 分组
            contexts = group_activities_by_context(activities)
            print(f"🔄 分组为 {len(contexts)} 个上下文")
            
            # 摄入
            ingest_to_minecontext(contexts)
            
            print(f"✅ 同步完成！下次同步: {(datetime.now() + timedelta(seconds=SYNC_INTERVAL)).strftime('%H:%M:%S')}")
            
        except Exception as e:
            print(f"❌ 同步出错: {e}")
        
        # 等待下一次同步
        time.sleep(SYNC_INTERVAL)

if __name__ == "__main__":
    main()
```

**启动同步服务**：
```bash
cd "/Users/ruiwang/Desktop/killer app"

# 添加执行权限
chmod +x screenpipe_sync.py

# 后台运行（建议使用 tmux 或 screen）
nohup python3 screenpipe_sync.py > screenpipe_sync.log 2>&1 &

# 查看日志
tail -f screenpipe_sync.log
```

---

#### 🔲 1.4 验证完整链路 ⭐⭐

**测试场景**：
```bash
# 1. 等待 Screenpipe 运行 10 分钟
# 2. 在此期间正常使用电脑（浏览网页、编辑文档等）
# 3. 触发同步
# 4. 测试检索

curl -X POST http://127.0.0.1:17860/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "我最近在做什么工作？",
    "sessionId": "test-screenpipe-001"
  }'
```

**预期结果**：
- MineContext 能够检索到您的桌面活动
- 回答中包含最近使用的应用、查看的文档等
- 响应准确且上下文相关

---

## 🎨 第二阶段：前端开发（2-4 周）

### 目标
开发 Electron 桌面应用，提供优雅的用户界面。

### 任务清单

#### 🔲 2.1 前端架构选择 ⭐⭐⭐

**方案 A：基于 MineContext 现有前端**（推荐）

优点：
- ✅ 已有完整的 Electron + React + TypeScript 架构
- ✅ 已集成截图、OCR、快捷键功能
- ✅ 已有 MineContext API 接口
- ✅ 开发周期短（2-3 周）

缺点：
- ❌ UI 需要大幅定制
- ❌ 可能存在不需要的功能

**方案 B：从零开发新前端**

优点：
- ✅ 完全按照 PRD 设计
- ✅ 代码干净，易维护
- ✅ 更符合 MineDesk 愿景

缺点：
- ❌ 开发周期长（4-6 周）
- ❌ 需要重新实现基础功能

**推荐决策**：选择方案 A，理由如下：
1. 快速迭代，尽早验证产品价值
2. 可以边使用边优化
3. 节省 50% 以上开发时间

---

#### 🔲 2.2 启动前端开发 ⭐⭐⭐

```bash
cd "/Users/ruiwang/Desktop/killer app/MineContext-main/frontend"

# 检查 Node.js 版本（需要 18+）
node --version

# 安装依赖（使用 pnpm）
pnpm install

# 启动开发模式
pnpm dev

# 在另一个终端，确保后端运行
cd "/Users/ruiwang/Desktop/killer app"
./start_minecontext.sh
```

---

#### 🔲 2.3 核心功能实现

**优先级 P0（必须）**：

1. **全局快捷键唤起**（Cmd+Shift+Space）
   - 文件：`frontend/src/main/shortcuts.ts`
   - 实现：注册全局快捷键，唤起主窗口

2. **智能对话界面**
   - 文件：`frontend/src/renderer/components/Chat.tsx`
   - 功能：连接 MineContext API，流式响应

3. **上下文展示**
   - 显示检索到的文档片段
   - 高亮相关内容
   - 来源追溯

4. **设置面板**
   - LLM 配置（API Key、模型选择）
   - 隐私设置（红区遮罩、数据保留）
   - 同步设置

**优先级 P1（重要）**：

5. **截图 OCR**（已有基础）
   - 优化选区识别
   - 提升 OCR 准确率

6. **会话管理**
   - 保存历史对话
   - 按主题分类

7. **菜单栏悬浮窗**
   - 快速访问
   - 状态显示

---

#### 🔲 2.4 UI/UX 优化

参考优秀产品的设计：
- **Raycast**：快捷键唤起、命令面板
- **Notion**：知识库界面、搜索体验
- **Arc Browser**：侧边栏、空间管理

**设计要点**：
- 简洁、高效、快速响应
- 键盘优先（支持全键盘操作）
- 深色模式 + 浅色模式
- 动画流畅，性能优先

---

## 🤖 第三阶段：CrewAI 集成（3-5 周）

### 目标
实现多智能体协作，自动生成周报。

### 任务清单

#### 🔲 3.1 安装 CrewAI

```bash
cd "/Users/ruiwang/Desktop/killer app"

# 创建 CrewAI 项目目录
mkdir -p crewai_agents

# 安装依赖
/opt/homebrew/bin/python3.11 -m pip install crewai crewai-tools
```

---

#### 🔲 3.2 实现 Weekly Report Crew ⭐⭐⭐

根据 PRD 设计，实现 5 个 Agent：

```python
# crewai_agents/weekly_report.py
from crewai import Agent, Task, Crew, Process
from crewai_tools import tool
import requests
from datetime import datetime, timedelta

# ============ Tools ============

@tool("search_context")
def search_context(query: str, days: int = 7) -> str:
    """从 MineContext 检索最近的上下文"""
    since = (datetime.now() - timedelta(days=days)).isoformat()
    
    response = requests.post(
        "http://127.0.0.1:17860/api/search/vector",
        json={
            "query": query,
            "top_k": 20,
            "filters": {"since": since}
        }
    )
    
    results = response.json()
    return "\n\n".join([r["content"] for r in results.get("results", [])])

@tool("get_activities")
def get_activities(days: int = 7) -> str:
    """获取最近的桌面活动统计"""
    # 从 Screenpipe 数据库查询
    import sqlite3
    conn = sqlite3.connect("/Users/ruiwang/.screenpipe/db.sqlite")
    cursor = conn.cursor()
    
    since = datetime.now() - timedelta(days=days)
    
    query = """
    SELECT app_name, COUNT(*) as count, SUM(duration) as total_time
    FROM frames
    WHERE timestamp > ?
    GROUP BY app_name
    ORDER BY count DESC
    LIMIT 20
    """
    
    cursor.execute(query, (since.strftime("%Y-%m-%d %H:%M:%S"),))
    activities = cursor.fetchall()
    conn.close()
    
    return "\n".join([f"- {app}: {count} 次，共 {total_time:.1f} 分钟" 
                      for app, count, total_time in activities])

# ============ Agents ============

researcher = Agent(
    role='Context Researcher',
    goal='Retrieve all relevant activities and context from the past week',
    backstory='''You are an expert at finding and organizing information.
    You have access to the user's desktop activities, documents, and conversations.
    Your job is to gather all relevant facts and events.''',
    tools=[search_context, get_activities],
    verbose=True
)

analyst = Agent(
    role='Data Analyst',
    goal='Extract key metrics, insights, and achievements',
    backstory='''You are skilled at analyzing data and identifying patterns.
    You can spot important trends, accomplishments, and areas for improvement.
    You focus on quantifiable results and meaningful insights.''',
    verbose=True
)

writer = Agent(
    role='Report Writer',
    goal='Generate a clear, well-structured weekly report in Markdown',
    backstory='''You are an experienced technical writer.
    You write clear, concise, and engaging reports.
    Your reports are well-structured with sections, bullet points, and highlights.''',
    verbose=True
)

reviewer = Agent(
    role='Quality Reviewer',
    goal='Review the report for clarity, accuracy, and style consistency',
    backstory='''You are a meticulous editor with an eye for detail.
    You ensure the report is professional, accurate, and easy to read.
    You fix grammar, improve flow, and ensure consistency.''',
    verbose=True
)

exporter = Agent(
    role='Export Specialist',
    goal='Format and export the report to multiple formats',
    backstory='''You are an expert at document formatting and export.
    You can convert reports to PDF, Markdown, HTML, and push to external systems.''',
    verbose=True
)

# ============ Tasks ============

research_task = Task(
    description='''Gather all activities and context from the past week.
    
    Focus on:
    1. Desktop activities (apps used, time spent)
    2. Documents created or edited
    3. Meetings and conversations
    4. Code commits and reviews
    5. Any significant events or achievements
    
    Use the search_context and get_activities tools.
    Organize the information by date and category.''',
    agent=researcher,
    expected_output='A comprehensive list of activities organized by date and category'
)

analysis_task = Task(
    description='''Analyze the gathered activities and extract insights.
    
    Calculate:
    1. Total productive time
    2. Time distribution by project/activity
    3. Key accomplishments
    4. Blockers or challenges
    5. Trends compared to previous weeks
    
    Provide quantifiable metrics where possible.''',
    agent=analyst,
    expected_output='A structured analysis with metrics and insights'
)

writing_task = Task(
    description='''Write a weekly report in Markdown format.
    
    Structure:
    # Weekly Report: [Date Range]
    
    ## 📊 Summary
    - Brief overview (2-3 sentences)
    
    ## 🎯 Key Achievements
    - Bullet points of main accomplishments
    
    ## ⏱️ Time Distribution
    - Table or list of time spent by project
    
    ## 📈 Metrics
    - Quantifiable results
    
    ## 🚧 Challenges & Blockers
    - Issues encountered
    
    ## 📅 Next Week
    - Planned activities
    
    Use clear language, bullet points, and emoji for readability.''',
    agent=writer,
    expected_output='A complete weekly report in Markdown format'
)

review_task = Task(
    description='''Review the report for quality.
    
    Check:
    1. Grammar and spelling
    2. Clarity and flow
    3. Consistency in style and tone
    4. Accuracy of facts and numbers
    5. Proper formatting
    
    Make corrections and improvements as needed.''',
    agent=reviewer,
    expected_output='A polished, publication-ready report'
)

export_task = Task(
    description='''Export the report to multiple formats.
    
    1. Save Markdown to file
    2. Generate PDF (optional)
    3. Push to Notion (if configured)
    4. Send summary email (if configured)
    
    Return the file paths and URLs.''',
    agent=exporter,
    expected_output='Export confirmation with file paths and URLs'
)

# ============ Crew ============

weekly_report_crew = Crew(
    agents=[researcher, analyst, writer, reviewer, exporter],
    tasks=[research_task, analysis_task, writing_task, review_task, export_task],
    process=Process.sequential,
    verbose=True
)

# ============ Main ============

def generate_weekly_report():
    """生成周报"""
    print("🚀 开始生成周报...")
    print("-" * 60)
    
    result = weekly_report_crew.kickoff()
    
    print("\n" + "=" * 60)
    print("✅ 周报生成完成！")
    print("=" * 60)
    print(result)
    
    return result

if __name__ == "__main__":
    generate_weekly_report()
```

**运行周报生成**：
```bash
cd "/Users/ruiwang/Desktop/killer app"
python3 crewai_agents/weekly_report.py
```

---

#### 🔲 3.3 优化 Agent 配置

**LLM 配置**：
```python
# 为每个 Agent 配置不同的模型
researcher.llm = ChatOpenAI(
    base_url="https://api.siliconflow.cn/v1",
    api_key="sk-your-key",
    model="Qwen/Qwen2.5-7B-Instruct",
    temperature=0.3  # 较低温度，确保准确性
)

writer.llm = ChatOpenAI(
    base_url="https://api.siliconflow.cn/v1",
    api_key="sk-your-key",
    model="Qwen/Qwen2.5-7B-Instruct",
    temperature=0.7  # 较高温度，提升创造性
)
```

---

## 🔗 第四阶段：MCP 平台集成（4-7 周）

### 目标
连接外部系统（Notion、GitHub、Jira），实现数据互通。

### 任务清单

#### 🔲 4.1 MCP 适配器架构

```python
# mcp_platform/base_adapter.py
from abc import ABC, abstractmethod
from typing import Dict, List, Any

class MCPAdapter(ABC):
    """MCP 适配器基类"""
    
    @abstractmethod
    def connect(self, credentials: Dict[str, str]) -> bool:
        """连接到外部系统"""
        pass
    
    @abstractmethod
    def sync_from_external(self) -> List[Dict[str, Any]]:
        """从外部系统同步数据"""
        pass
    
    @abstractmethod
    def sync_to_external(self, data: Dict[str, Any]) -> bool:
        """推送数据到外部系统"""
        pass
    
    @abstractmethod
    def get_resources(self) -> List[Dict[str, Any]]:
        """获取可用资源列表"""
        pass
```

---

#### 🔲 4.2 Notion 适配器 ⭐⭐⭐

```python
# mcp_platform/notion_adapter.py
from notion_client import Client
from .base_adapter import MCPAdapter

class NotionAdapter(MCPAdapter):
    def __init__(self):
        self.client = None
    
    def connect(self, credentials: Dict[str, str]) -> bool:
        """连接 Notion"""
        try:
            self.client = Client(auth=credentials["api_key"])
            # 测试连接
            self.client.users.me()
            return True
        except Exception as e:
            print(f"Notion 连接失败: {e}")
            return False
    
    def sync_from_external(self) -> List[Dict[str, Any]]:
        """从 Notion 同步页面"""
        pages = []
        
        # 搜索所有页面
        results = self.client.search(filter={"property": "object", "value": "page"})
        
        for page in results.get("results", []):
            page_id = page["id"]
            
            # 获取页面内容
            blocks = self.client.blocks.children.list(block_id=page_id)
            content = self._extract_content(blocks)
            
            pages.append({
                "id": page_id,
                "title": page["properties"].get("title", {}).get("title", [{}])[0].get("plain_text", "Untitled"),
                "content": content,
                "url": page["url"],
                "created_time": page["created_time"],
                "last_edited_time": page["last_edited_time"]
            })
        
        return pages
    
    def sync_to_external(self, data: Dict[str, Any]) -> bool:
        """创建 Notion 页面"""
        try:
            parent_id = data.get("parent_database_id")
            
            page = self.client.pages.create(
                parent={"database_id": parent_id},
                properties={
                    "Name": {"title": [{"text": {"content": data["title"]}}]}
                },
                children=self._content_to_blocks(data["content"])
            )
            
            return True
        except Exception as e:
            print(f"创建 Notion 页面失败: {e}")
            return False
    
    def _extract_content(self, blocks) -> str:
        """从 Notion blocks 提取文本"""
        content = []
        for block in blocks.get("results", []):
            block_type = block["type"]
            if block_type in ["paragraph", "heading_1", "heading_2", "heading_3"]:
                rich_text = block[block_type].get("rich_text", [])
                text = "".join([t["plain_text"] for t in rich_text])
                content.append(text)
        return "\n\n".join(content)
    
    def _content_to_blocks(self, content: str) -> List[Dict]:
        """将文本转换为 Notion blocks"""
        paragraphs = content.split("\n\n")
        blocks = []
        
        for para in paragraphs:
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"type": "text", "text": {"content": para}}]
                }
            })
        
        return blocks
```

---

#### 🔲 4.3 GitHub 适配器 ⭐⭐

```python
# mcp_platform/github_adapter.py
from github import Github
from .base_adapter import MCPAdapter

class GitHubAdapter(MCPAdapter):
    def __init__(self):
        self.client = None
    
    def connect(self, credentials: Dict[str, str]) -> bool:
        """连接 GitHub"""
        try:
            self.client = Github(credentials["access_token"])
            # 测试连接
            self.client.get_user().login
            return True
        except Exception as e:
            print(f"GitHub 连接失败: {e}")
            return False
    
    def sync_from_external(self) -> List[Dict[str, Any]]:
        """同步 Issues 和 PRs"""
        items = []
        user = self.client.get_user()
        
        # 获取所有仓库
        for repo in user.get_repos():
            # Issues
            for issue in repo.get_issues(state="all"):
                items.append({
                    "type": "issue",
                    "repo": repo.full_name,
                    "number": issue.number,
                    "title": issue.title,
                    "body": issue.body,
                    "state": issue.state,
                    "url": issue.html_url,
                    "created_at": issue.created_at.isoformat()
                })
            
            # Pull Requests
            for pr in repo.get_pulls(state="all"):
                items.append({
                    "type": "pull_request",
                    "repo": repo.full_name,
                    "number": pr.number,
                    "title": pr.title,
                    "body": pr.body,
                    "state": pr.state,
                    "url": pr.html_url,
                    "created_at": pr.created_at.isoformat()
                })
        
        return items
```

---

## 🎯 当前最紧急的 3 个任务（本周必做）

### 1️⃣ 启动 Screenpipe（最高优先级）⭐⭐⭐

**为什么**：这是 MineDesk 的核心功能 - "记忆层"

**怎么做**：
```bash
cd "/Users/ruiwang/Desktop/killer app/screenpipe-main"
cargo build --release
./target/release/screenpipe
```

**验证**：运行 10 分钟后，检查数据库有数据

---

### 2️⃣ 实现 Screenpipe → MineContext 同步 ⭐⭐⭐

**为什么**：打通"记忆→理解"链路

**怎么做**：运行上面提供的 `screenpipe_sync.py` 脚本

**验证**：能够检索到桌面活动

---

### 3️⃣ 启动前端开发环境 ⭐⭐

**为什么**：为 UI 开发做准备

**怎么做**：
```bash
cd MineContext-main/frontend
pnpm install
pnpm dev
```

**验证**：前端界面能够打开并连接后端

---

## 📅 时间规划建议

### 本周（第 1 周）
- [x] MineContext 验证（已完成）
- [ ] Screenpipe 启动（2-3 小时）
- [ ] 同步脚本实现（2-3 小时）
- [ ] 前端环境搭建（1-2 小时）

**总计**：5-8 小时

---

### 第 2-3 周：前端核心功能
- [ ] 快捷键唤起（1 天）
- [ ] 智能对话界面（2 天）
- [ ] 上下文展示（1 天）
- [ ] 设置面板（1 天）

**总计**：10-15 小时

---

### 第 4-5 周：CrewAI 集成
- [ ] CrewAI 安装配置（0.5 天）
- [ ] Weekly Report Crew 实现（2 天）
- [ ] Agent 调优（1 天）
- [ ] 测试与优化（1 天）

**总计**：10-12 小时

---

### 第 6-8 周：MCP 平台
- [ ] MCP 架构设计（1 天）
- [ ] Notion 适配器（2 天）
- [ ] GitHub 适配器（2 天）
- [ ] 集成测试（1 天）

**总计**：15-20 小时

---

## 🚀 立即开始

**现在就做**（5 分钟）：
```bash
cd "/Users/ruiwang/Desktop/killer app/screenpipe-main"

# 检查是否需要编译
if [ ! -f "target/release/screenpipe" ]; then
    echo "需要编译 Screenpipe（预计 15-20 分钟）"
    echo "运行: cargo build --release"
else
    echo "✅ Screenpipe 已编译，可以直接启动"
    echo "运行: ./target/release/screenpipe"
fi
```

---

## 📚 相关文档

- **MineDesk PRD v1.6**：完整产品需求
- **下一步行动计划.md**：详细操作指南
- **README_START_HERE.md**：快速入门
- **QUICK_REFERENCE.md**：命令速查

---

## 💡 关键决策点

### 决策 1：前端方案选择
**推荐**：基于 MineContext 现有前端（节省 50% 时间）

### 决策 2：CrewAI vs 自研 Agent
**推荐**：使用 CrewAI（成熟框架，快速上手）

### 决策 3：存储后端
**推荐**：SQLite（轻量、本地优先，满足当前需求）

### 决策 4：开发节奏
**推荐**：快速迭代，边用边优化（2 周一个版本）

---

## ✅ 成功标准

### M1 完成标志（2 周内）
- [x] MineContext 运行稳定
- [ ] Screenpipe 持续采集数据
- [ ] 同步链路打通
- [ ] 前端基础界面可用

### M2 完成标志（6 周内）
- [ ] 智能对话体验优秀
- [ ] 上下文检索准确
- [ ] UI/UX 符合预期
- [ ] CrewAI 周报生成

### M3 完成标志（10 周内）
- [ ] MCP 平台上线
- [ ] Notion/GitHub 集成
- [ ] 隐私功能完善
- [ ] 性能达标（P50 < 20ms）

---

**祝开发顺利！🚀**

有任何问题，随时参考文档或查看日志。

