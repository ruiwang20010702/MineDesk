# Phase 3.1 - CrewAI 集成对齐文档

**文档版本**: v1.0  
**创建日期**: 2025-11-04  
**阶段**: Align (对齐阶段)  
**状态**: ✅ 完成

---

## 📋 原始需求

根据项目路线图（PROJECT_STATUS.md 和 MINEDESK_ROADMAP.md），Phase 3.1 的目标是：

> **Phase 3.1: 集成 CrewAI**  
> **预计时间**: 11-16 天  
> **目标**: 实现多智能体协作的周报生成功能

### 核心需求
1. 安装和配置 CrewAI 框架
2. 设计周报生成工作流
3. 创建多智能体团队（数据分析师、内容编写者、审核者）
4. 集成到 MineDesk UI
5. 测试和优化

---

## 🎯 项目上下文分析

### 1. 现有项目架构

#### 技术栈概览
```
MineDesk 架构 (Phase 2.2 已完成)
│
├── 前端层 (minedesk/)
│   ├── Electron 39.0.0 + React 19.1.0
│   ├── TypeScript 5.8
│   ├── TailwindCSS 4
│   ├── Vite 7 + electron-vite 4
│   └── 核心组件
│       ├── AIAssistant - 对话系统
│       ├── ContextPanel - 上下文面板
│       ├── TitleBar - 标题栏
│       └── LoadingScreen - 服务检测
│
├── 服务层 (minedesk/src/main/services/)
│   ├── ScreenpipeService.ts - 屏幕捕获
│   ├── MineContextService.ts - RAG 检索
│   ├── DatabaseService.ts - SQLite 存储
│   └── TrayService.ts - 系统托盘
│
├── IPC 通信层 (minedesk/src/main/ipc/)
│   └── index.ts - 主进程 ↔ 渲染进程通信
│
└── 后端服务 (独立进程)
    ├── Screenpipe (Rust) - localhost:3030
    │   └── 屏幕 OCR、活动追踪
    │
    └── MineContext (Python) - localhost:17860
        └── RAG 知识检索、AI 对话
```

#### 现有服务集成模式

**1. Screenpipe 集成**
- 服务地址: `http://localhost:3030`
- 集成方式: HTTP API 调用
- 主要接口:
  - `search(query, options)` - 搜索屏幕活动
  - `getActivities(startTime, endTime)` - 获取活动记录
  - `getCurrentContext()` - 获取当前上下文
  - `getActivitySummary(startTime, endTime)` - 活动统计

**2. MineContext 集成**
- 服务地址: `http://localhost:17860`
- 集成方式: HTTP API 调用
- 主要接口:
  - `chat(messages, options)` - AI 对话
  - `search(query, options)` - RAG 检索
  - `getContext(query, topK)` - 获取上下文
  - `getStats()` - 统计信息

**3. 数据持久化**
- 存储方式: SQLite (better-sqlite3)
- 数据库文件: 应用数据目录
- 主要表:
  - `conversations` - 对话记录
  - `messages` - 消息记录
  - `settings` - 设置

### 2. 技术约束和依赖

#### 现有依赖 (package.json)
```json
{
  "dependencies": {
    "electron": "39.0.0",
    "react": "^19.1.0",
    "typescript": "^5.8.3",
    "better-sqlite3": "^12.2.0",
    "axios": "^1.7.3",
    "@ai-sdk/react": "^2.0.30",
    "ai": "^5.0.30"
  }
}
```

#### 技术约束
1. **Electron 沙箱**: 主进程 ↔ 渲染进程隔离
2. **跨平台要求**: macOS (优先) + Windows + Linux
3. **Python 进程**: MineContext 运行在独立 Python 进程
4. **本地优先**: 所有数据存储在本地
5. **API 调用**: 通过 HTTP 与后端服务通信

---

## 🧠 CrewAI 框架理解

### 1. CrewAI 是什么？

CrewAI 是一个 Python 框架，用于构建多智能体协作系统。核心概念：

- **Agent (代理)**: 具有特定角色和目标的 AI 智能体
- **Task (任务)**: 分配给 Agent 的具体工作
- **Tool (工具)**: Agent 可以使用的功能/API
- **Crew (团队)**: 多个 Agent 组成的协作团队
- **Process (流程)**: 任务执行顺序（sequential/hierarchical/parallel）

### 2. CrewAI 技术要求

- **Python 版本**: >= 3.10
- **LLM 支持**: OpenAI API / 兼容 API
- **依赖**: `crewai`, `crewai-tools`, `langchain`

### 3. CrewAI 与 MineDesk 集成方案

由于 MineDesk 是 Electron + TypeScript 应用，而 CrewAI 是 Python 框架，需要设计跨语言集成方案：

**方案 A: Python 独立服务 (推荐)**
```
MineDesk (Electron)
    ↓ HTTP API
CrewAI Service (Python)
    ↓ HTTP API
MineContext + Screenpipe
```

优点：
- ✅ 架构清晰，职责分离
- ✅ 与现有服务模式一致
- ✅ 易于调试和维护
- ✅ 支持独立部署和扩展

缺点：
- ❌ 需要额外的服务进程
- ❌ 需要设计 API 接口

**方案 B: 集成到 MineContext**
```
MineDesk (Electron)
    ↓ HTTP API
MineContext (Python)
    ├── RAG 模块
    └── CrewAI 模块 (新增)
```

优点：
- ✅ 减少服务数量
- ✅ 复用 MineContext 基础设施

缺点：
- ❌ MineContext 职责过重
- ❌ 代码耦合度高
- ❌ 难以独立测试

**选择: 方案 A - Python 独立服务**

理由：
1. 符合微服务架构理念
2. 与现有 Screenpipe/MineContext 模式一致
3. 易于扩展和维护
4. 可以独立版本控制

---

## 📝 周报生成需求详解

### 1. 功能需求

#### 用户故事
```
作为 MineDesk 用户
我希望能够一键生成周报
以便快速总结一周的工作成果
```

#### 验收标准
1. ✅ 点击 "生成周报" 按钮，自动生成本周工作总结
2. ✅ 周报包含：工作时间分布、关键成就、活动统计、待办事项
3. ✅ 生成时间 < 2 分钟
4. ✅ 支持导出为 Markdown / PDF
5. ✅ 可以编辑和重新生成

### 2. 数据来源

周报生成需要的数据来源：

| 数据类型 | 来源 | API |
|---------|------|-----|
| 屏幕活动 | Screenpipe | `getActivities(startTime, endTime)` |
| 应用统计 | Screenpipe | `getActivitySummary(startTime, endTime)` |
| 文档内容 | MineContext | `search(query, options)` |
| 对话记录 | DatabaseService | SQLite 查询 |
| 工作上下文 | MineContext | `getContext(query, topK)` |

### 3. 周报结构

根据 MINEDESK_ROADMAP.md 的设计，周报应包含：

```markdown
# 📊 Weekly Report: [Date Range]

## 🎯 Summary
- 本周工作概述 (2-3 句话)
- 总工作时间、总生产力时间

## 🏆 Key Achievements
- 主要成就 1
- 主要成就 2
- 主要成就 3

## ⏱️ Time Distribution
| 项目/活动 | 时间 | 占比 |
|-----------|------|------|
| 编码开发 | 20h | 50% |
| 会议沟通 | 10h | 25% |
| 文档编写 | 8h | 20% |
| 其他 | 2h | 5% |

## 📈 Productivity Metrics
- 代码提交: 45 次
- 文档创建: 12 个
- 会议参与: 8 次
- 学习时间: 5h

## 🚧 Challenges & Blockers
- 遇到的问题 1
- 遇到的问题 2

## 📅 Next Week Planning
- 计划任务 1
- 计划任务 2
```

### 4. Agent 设计

根据周报生成流程，设计 5 个 Agent：

#### **Agent 1: Data Researcher (数据研究员)**
- **角色**: 收集和整理一周的所有活动数据
- **目标**: 从 Screenpipe 和 MineContext 获取完整数据
- **工具**:
  - `fetch_screenpipe_activities` - 获取屏幕活动
  - `fetch_minecontext_documents` - 获取文档
  - `fetch_conversations` - 获取对话记录
- **输出**: 结构化的原始数据

#### **Agent 2: Data Analyst (数据分析师)**
- **角色**: 分析数据，提取关键指标和洞察
- **目标**: 计算时间分布、识别关键成就、发现趋势
- **工具**:
  - `calculate_time_stats` - 计算时间统计
  - `identify_achievements` - 识别成就
  - `detect_patterns` - 发现模式
- **输出**: 分析报告和指标

#### **Agent 3: Content Writer (内容编写者)**
- **角色**: 撰写结构化的周报内容
- **目标**: 将分析结果转化为可读的 Markdown 周报
- **工具**:
  - `generate_summary` - 生成摘要
  - `format_markdown` - 格式化 Markdown
- **输出**: 初版周报 (Markdown)

#### **Agent 4: Quality Reviewer (质量审核员)**
- **角色**: 审核周报质量，确保准确性和可读性
- **目标**: 检查语法、逻辑、数据准确性
- **工具**:
  - `check_grammar` - 语法检查
  - `verify_data` - 验证数据
  - `improve_readability` - 提升可读性
- **输出**: 审核后的周报

#### **Agent 5: Export Manager (导出管理员)**
- **角色**: 导出周报到多种格式
- **目标**: 生成 Markdown、PDF，推送到外部系统
- **工具**:
  - `save_markdown` - 保存 Markdown
  - `generate_pdf` - 生成 PDF
  - `push_to_notion` - 推送到 Notion (可选)
- **输出**: 文件路径和导出确认

---

## 🏗️ 系统边界和范围

### Phase 3.1 包含 ✅

1. **CrewAI 服务搭建**
   - Python FastAPI 服务
   - CrewAI Agents 和 Tasks 定义
   - 工具函数实现

2. **周报生成核心功能**
   - 数据收集
   - 数据分析
   - 内容生成
   - 质量审核
   - Markdown 导出

3. **MineDesk UI 集成**
   - "生成周报" 按钮
   - 周报预览界面
   - 进度显示
   - 错误处理

4. **基础配置**
   - LLM API 配置
   - 周报模板配置
   - 数据时间范围配置

### Phase 3.1 不包含 ❌

1. ❌ PDF 导出 (Phase 3.2)
2. ❌ Notion/GitHub 推送 (Phase 4.1 - MCP 平台)
3. ❌ 自定义模板编辑器 (Phase 3.2)
4. ❌ 历史周报管理 (Phase 3.2)
5. ❌ 多语言周报 (Phase 4+)
6. ❌ 周报分享功能 (Phase 4+)

---

## 🤔 需求澄清和决策

### 疑问 1: LLM 选择

**问题**: 使用哪个 LLM 模型？

**分析**:
- 现有 MineContext 使用 SiliconFlow API (Qwen2.5-7B-Instruct)
- CrewAI 支持 OpenAI API 兼容接口

**决策**: 
✅ 使用 SiliconFlow API 的 Qwen/Qwen2.5-7B-Instruct
- 理由: 与现有系统一致，降低成本，中文支持好

**配置**:
```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="https://api.siliconflow.cn/v1",
    api_key="YOUR_API_KEY",  # 从 MineContext 配置读取
    model="Qwen/Qwen2.5-7B-Instruct",
    temperature=0.7
)
```

---

### 疑问 2: 周报时间范围

**问题**: 周报覆盖多长时间？

**分析**:
- 标准周报: 7 天 (周一到周日)
- 工作周报: 5 天 (周一到周五)
- 自定义范围

**决策**:
✅ 默认 7 天，支持自定义
- 默认生成最近 7 天的周报
- UI 提供日期范围选择器
- 支持 "本周"、"上周"、"自定义" 三种模式

---

### 疑问 3: 数据隐私

**问题**: 如何处理敏感数据？

**分析**:
- 屏幕活动可能包含密码、隐私信息
- 对话记录可能包含机密内容

**决策**:
✅ 实施数据过滤机制
1. 使用 Screenpipe 的红区遮罩功能
2. 在发送给 LLM 前，过滤敏感关键词
3. 提供 "排除应用" 配置（如 1Password、Keychain）
4. 所有数据本地处理，不上传云端

**实现**:
```python
SENSITIVE_KEYWORDS = [
    "password", "api_key", "secret", "token",
    "密码", "口令", "秘钥"
]

def filter_sensitive_data(text: str) -> str:
    for keyword in SENSITIVE_KEYWORDS:
        if keyword.lower() in text.lower():
            text = text.replace(keyword, "[REDACTED]")
    return text
```

---

### 疑问 4: 错误处理

**问题**: 如果某个服务不可用怎么办？

**分析**:
- Screenpipe 可能未启动
- MineContext 可能离线
- LLM API 可能失败

**决策**:
✅ 优雅降级
1. Screenpipe 不可用 → 跳过屏幕活动统计
2. MineContext 不可用 → 跳过文档检索
3. LLM API 失败 → 返回错误信息，支持重试
4. 部分数据缺失 → 生成简化版周报

**实现**:
```python
try:
    activities = fetch_screenpipe_activities()
except ServiceUnavailable:
    activities = []
    log.warning("Screenpipe unavailable, skipping activities")

# 继续生成周报，只是缺少活动统计部分
```

---

### 疑问 5: 性能要求

**问题**: 生成周报的时间限制？

**分析**:
- 数据收集: ~5-10 秒
- Agent 处理: ~30-60 秒
- 内容生成: ~20-30 秒
- 总计: ~1-2 分钟

**决策**:
✅ 目标生成时间 < 2 分钟
- 实现进度回调
- UI 显示实时进度
- 支持后台生成

**进度反馈**:
```typescript
// UI 进度显示
[████████░░] 80% - Generating report content...
```

---

## ✅ 技术可行性验证

### 1. CrewAI 安装测试

**环境**:
- Python: 3.11 (MineContext 使用的版本)
- 系统: macOS

**安装命令**:
```bash
pip install crewai crewai-tools langchain-openai
```

**预期结果**: ✅ 安装成功，无依赖冲突

---

### 2. SiliconFlow API 兼容性

**测试代码**:
```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="https://api.siliconflow.cn/v1",
    api_key="sk-xxx",
    model="Qwen/Qwen2.5-7B-Instruct"
)

response = llm.invoke("你好")
print(response.content)
```

**预期结果**: ✅ API 调用成功

---

### 3. Electron ↔ Python 服务通信

**架构**:
```
Electron Main Process
    ↓ axios.post
CrewAI Service (FastAPI)
    port: 18000
```

**测试代码 (Python)**:
```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/api/weekly-report/generate")
async def generate_report(request: ReportRequest):
    # CrewAI logic here
    return {"status": "success", "report": "..."}
```

**测试代码 (TypeScript)**:
```typescript
const response = await axios.post('http://localhost:18000/api/weekly-report/generate', {
  startDate: '2025-10-28',
  endDate: '2025-11-04'
})
```

**预期结果**: ✅ 通信成功

---

## 📊 集成约束和限制

### 技术约束

1. **Python 版本**: 必须使用 Python 3.11 (与 MineContext 一致)
2. **端口**: CrewAI 服务使用 18000 端口 (避免与其他服务冲突)
3. **数据格式**: 统一使用 JSON 格式传输
4. **字符编码**: UTF-8
5. **跨域**: FastAPI 需要配置 CORS

### 性能约束

1. **响应时间**: 生成周报 < 2 分钟
2. **内存占用**: CrewAI 服务 < 500MB
3. **并发**: 单用户应用，无需考虑高并发

### 安全约束

1. **本地服务**: 仅监听 localhost
2. **无认证**: 本地应用，无需 API 认证
3. **数据隐私**: 所有数据本地处理

---

## 🎯 最终共识

### 核心需求确认

✅ **功能范围**:
- 一键生成周报
- 包含工作统计、成就、时间分布
- Markdown 格式输出
- UI 集成和进度显示

✅ **技术方案**:
- CrewAI 独立 Python 服务 (FastAPI)
- 5 个 Agent 协作流程
- SiliconFlow Qwen2.5-7B-Instruct
- HTTP API 与 Electron 通信

✅ **数据来源**:
- Screenpipe (屏幕活动)
- MineContext (文档和对话)
- DatabaseService (本地记录)

✅ **性能目标**:
- 生成时间 < 2 分钟
- 实时进度反馈
- 优雅降级

✅ **边界明确**:
- 仅实现 Markdown 导出
- 不包含 PDF、Notion、自定义模板
- 默认 7 天周报，可自定义

---

## 📝 验收标准

### 功能验收

1. ✅ CrewAI 服务可以独立启动
2. ✅ MineDesk UI 可以调用周报生成 API
3. ✅ 周报包含所有必需章节
4. ✅ Markdown 格式正确，可直接预览
5. ✅ 进度回调正常工作
6. ✅ 错误处理和降级机制生效

### 质量验收

1. ✅ TypeScript 类型检查 0 错误
2. ✅ Python 代码符合 PEP 8
3. ✅ 所有 API 接口有完整文档
4. ✅ 关键功能有单元测试
5. ✅ 用户体验流畅，无卡顿

### 性能验收

1. ✅ 周报生成 < 2 分钟 (P95)
2. ✅ 服务启动 < 5 秒
3. ✅ 内存占用 < 500MB
4. ✅ CPU 占用 < 30% (生成期间)

---

## 🚀 下一步

**Align 阶段已完成** ✅

接下来进入 **Architect 阶段**，将创建：
- `DESIGN_CREWAI_INTEGRATION.md` - 系统架构设计
- 架构图、模块设计、接口规范、数据流

---

**文档状态**: ✅ 已确认  
**更新时间**: 2025-11-04  
**审核人**: AI Assistant  
**批准人**: 待用户确认

