# 🚀 MineDesk Project - AI-Powered Work Context Assistant

> **一个基于 Screenpipe + MineContext + CrewAI 的智能工作助手**
> 
> 捕获屏幕活动 → 构建知识库 → 生成周报 → 智能检索

[![Status](https://img.shields.io/badge/Status-Phase%202.2%20Complete-success)]()
[![Tech Stack](https://img.shields.io/badge/Stack-Electron%20%2B%20React%2019-blue)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## 📋 项目概述

**MineDesk** 是一个桌面级 AI 工作助手，通过以下方式提升工作效率：

1. **📹 Screenpipe** - 捕获屏幕活动和音频转录（记忆层）
2. **🧠 MineContext** - RAG 知识检索和语义搜索（智能层）
3. **🤖 CrewAI** - 多智能体协作生成周报（自动化层）
4. **💬 Electron UI** - 快捷键唤起的智能对话界面

### 核心功能

✅ **全局快捷键唤起** - `Cmd+Space` (macOS) / `Ctrl+Space` (Windows)  
✅ **智能 AI 对话** - 基于上下文的 RAG 检索  
✅ **实时活动展示** - 当前应用、窗口、活动统计  
✅ **自动周报生成** - CrewAI 多智能体协作（开发中）  
✅ **知识图谱** - 构建工作知识网络（规划中）

---

## 🗂️ 项目结构

```
killer app/
├── 📱 minedesk/                    # 主应用 - Electron 桌面客户端
│   ├── src/main/                  # Electron 主进程
│   ├── src/renderer/              # React UI
│   └── src/preload/               # API 桥接
│
├── 🔧 source-projects/            # 依赖的源项目
│   ├── MineContext-main/          # RAG 知识检索服务
│   ├── screenpipe-main/           # 屏幕活动捕获
│   └── AingDesk-main/             # 前端架构参考
│
├── 📜 scripts/                    # 实用脚本
│   ├── minecontext/               # MineContext 相关
│   ├── screenpipe/                # Screenpipe 相关
│   └── tests/                     # 测试脚本
│
├── 📚 docs/                       # 文档中心
│   ├── guides/                    # 使用指南
│   ├── reports/                   # 阶段报告
│   └── technical/                 # 技术文档
│
├── 🎯 demos/                      # 演示脚本
│
└── 📄 README.md                   # 你在这里 👈
```

---

## 🚀 快速开始

### 前置要求

- **Node.js** >= 20.x
- **pnpm** >= 9.x
- **Python** >= 3.11
- **Screenpipe** >= 0.2.74 (可选)

### 1️⃣ 克隆项目

```bash
cd "/Users/ruiwang/Desktop/killer app"
```

### 2️⃣ 安装 MineDesk

```bash
cd minedesk
pnpm install
```

### 3️⃣ 启动后端服务

#### 启动 Screenpipe（可选但推荐）

```bash
# Terminal 1
screenpipe --port 3030
```

#### 启动 MineContext（必需）

```bash
# Terminal 2
cd source-projects/MineContext-main
source .venv/bin/activate
python -m opencontext.cli server
```

### 4️⃣ 启动 MineDesk

```bash
# Terminal 3
cd minedesk
pnpm dev
```

🎉 应用会自动打开！按 **Cmd+Space** 唤起/隐藏窗口。

---

## 📚 文档导航

### 🎯 快速入门
- [**docs/INDEX.md**](./docs/INDEX.md) - 📖 文档中心索引（推荐）
- [**minedesk/README.md**](./minedesk/README.md) - MineDesk 应用说明
- [**minedesk/DEVELOPMENT.md**](./minedesk/DEVELOPMENT.md) - 开发指南
- [**docs/guides/QUICKSTART.md**](./docs/guides/QUICKSTART.md) - 5分钟快速教程

### 📊 项目报告
- [**docs/reports/PROJECT_STATUS.md**](./docs/reports/PROJECT_STATUS.md) - 项目整体状态
- [**docs/reports/ORGANIZATION_REPORT.md**](./docs/reports/ORGANIZATION_REPORT.md) - 项目整理报告
- [**docs/reports/SCREENPIPE_SUCCESS_REPORT.md**](./docs/reports/SCREENPIPE_SUCCESS_REPORT.md) - Screenpipe 集成报告
- [**docs/reports/FRONTEND_ARCHITECTURE_EVALUATION.md**](./docs/reports/FRONTEND_ARCHITECTURE_EVALUATION.md) - 前端架构评估
- [**minedesk/STATUS.md**](./minedesk/STATUS.md) - MineDesk 应用状态

### 🛠️ 技术文档
- [**docs/technical/**](./docs/technical/) - 技术文档目录
- [**docs/reports/FINAL_REPORT.md**](./docs/reports/FINAL_REPORT.md) - 综合技术报告
- [**docs/reports/DELIVERY_SUMMARY.md**](./docs/reports/DELIVERY_SUMMARY.md) - 交付总结

### 📖 使用指南
- [**docs/guides/**](./docs/guides/) - 各类操作指南
- [**docs/guides/SCREENPIPE_START_HERE.md**](./docs/guides/SCREENPIPE_START_HERE.md) - Screenpipe 快速入门
- [**source-projects/MineContext-main/README.md**](./source-projects/MineContext-main/README.md) - MineContext 文档
- [**source-projects/screenpipe-main/README.md**](./source-projects/screenpipe-main/README.md) - Screenpipe 文档

---

## 🎯 开发进度

### ✅ 已完成（Phase 1-2）

- ✅ **Phase 1.1** - MineContext RAG 验证
- ✅ **Phase 1.2** - Screenpipe 记忆层集成
- ✅ **Phase 2.1** - 前端架构评估
- ✅ **Phase 2.2** - 核心 UI 实现

**当前状态**：MineDesk 核心功能已就绪，可进行 AI 对话和上下文展示

### 🚧 进行中（Phase 3）

- ⬜ **Phase 3.1** - 集成 CrewAI（周报生成）
- ⬜ **Phase 3.2** - 知识图谱实现

### 📅 规划中（Phase 4）

- ⬜ **Phase 4.1** - MCP 平台适配器（Notion、GitHub）
- ⬜ **Phase 4.2** - 隐私与权限系统

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      MineDesk UI                            │
│              (Electron + React 19 + TypeScript)             │
│   - 全局快捷键唤起                                            │
│   - AI 对话界面                                              │
│   - 上下文展示面板                                            │
└────────────────────┬────────────────────────────────────────┘
                     │ IPC Communication
┌────────────────────┴────────────────────────────────────────┐
│                   Main Process                              │
│   - ScreenpipeService                                       │
│   - MineContextService                                      │
│   - CrewAIService (coming soon)                             │
└─────────┬─────────────────────┬─────────────────────────────┘
          │                     │
┌─────────▼─────────┐  ┌────────▼────────────────────────────┐
│   Screenpipe      │  │      MineContext                     │
│   (Port 3030)     │  │      (Port 8000)                     │
│                   │  │                                      │
│ - Screen OCR      │  │ - RAG Knowledge Base                 │
│ - Audio Transcript│  │ - Vector Search                      │
│ - Activity Track  │  │ - AI Chat                            │
└───────────────────┘  └──────────────────────────────────────┘
```

### 核心技术栈

- **前端**: React 19 + TypeScript + TailwindCSS 4
- **框架**: Electron 37 + Vite 7
- **后端**: Python 3.11 + FastAPI
- **AI**: OpenAI API / SiliconFlow
- **存储**: SQLite + ChromaDB
- **构建**: electron-builder

---

## 🎨 功能预览

### 主界面

```
┌──────────────────────────────────────────────────────────────┐
│  🧠 MineDesk                                    [−] [×]      │
├────────────────────────────────┬─────────────────────────────┤
│                                │  Context Panel              │
│  AI Assistant                  │  ┌─────────────────────┐   │
│                                │  │ Current │Timeline│Sum│   │
│  💬 User: What did I work on   │  ├─────────────────────┤   │
│     today?                     │  │ 💻 VSCode           │   │
│                                │  │ 📄 main.ts          │   │
│  🤖 Assistant: Based on your   │  │ ⏰ 10:30 AM         │   │
│     screen activity, you...    │  └─────────────────────┘   │
│                                │                             │
│  ┌───────────────────────────┐ │  Top Apps Today:           │
│  │ Ask a question...         │ │  • VSCode: 2h 30m          │
│  │                           │ │  • Chrome: 1h 15m          │
│  └───────────────────────────┘ │  • Terminal: 45m           │
└────────────────────────────────┴─────────────────────────────┘
```

### 主要特性

🎯 **快捷键唤起** - 全局快捷键，随时调出  
💬 **智能对话** - Markdown + 代码高亮 + 流式响应  
📊 **上下文展示** - 实时显示当前工作状态  
📈 **活动统计** - Top Apps、Timeline、Summary  
🎨 **现代 UI** - 深色主题、流畅动画、响应式设计

---

## 🔧 常用命令

### MineDesk 开发

```bash
cd minedesk
pnpm dev          # 开发模式
pnpm build        # 构建
pnpm build:mac    # 打包 macOS
pnpm lint         # 代码检查
pnpm format       # 格式化代码
```

### MineContext 服务

```bash
cd source-projects/MineContext-main

# 激活虚拟环境
source .venv/bin/activate

# 启动服务
python -m opencontext.cli server

# 导入文档
python -m opencontext.cli import /path/to/docs

# 测试查询
python -m opencontext.cli query "your question"
```

### Screenpipe 服务

```bash
# 启动服务
screenpipe --port 3030

# 检查状态
curl http://localhost:3030/health

# 查看活动
scripts/screenpipe/check-screenpipe-status.sh
```

---

## 🐛 常见问题

### 1. Screenpipe 服务连接失败

**问题**: MineDesk 显示 Screenpipe 不可用

**解决方案**:
```bash
# 检查 Screenpipe 是否运行
curl http://localhost:3030/health

# 如果未运行，启动服务
screenpipe --port 3030

# 检查权限设置（macOS）
# System Settings > Privacy & Security > Screen Recording
# System Settings > Privacy & Security > Microphone
```

### 2. MineContext 服务启动失败

**问题**: 端口 8000 被占用或虚拟环境问题

**解决方案**:
```bash
# 检查端口占用
lsof -i :8000

# 重新创建虚拟环境
cd source-projects/MineContext-main
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

### 3. 应用无法打包

**问题**: 缺少 native 模块或签名问题

**解决方案**:
```bash
cd minedesk
pnpm rebuild better-sqlite3
# macOS 签名：确保有 Apple Developer 账号或使用 ad-hoc 签名
```

---

## 📦 项目依赖

### 核心依赖
- [**Screenpipe**](https://github.com/mediar-ai/screenpipe) - 屏幕活动捕获
- [**MineContext**](https://github.com/volcengine/MineContext) - RAG 知识检索
- [**CrewAI**](https://github.com/joaomdmoura/crewAI) - 多智能体框架（规划中）

### 前端依赖
- [**Electron**](https://www.electronjs.org/) - 桌面应用框架
- [**React**](https://react.dev/) - UI 框架
- [**Vite**](https://vitejs.dev/) - 构建工具
- [**TailwindCSS**](https://tailwindcss.com/) - CSS 框架

---

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

---

## 🙏 致谢

- [Screenpipe](https://github.com/mediar-ai/screenpipe) - 提供屏幕捕获能力
- [MineContext](https://github.com/volcengine/MineContext) - 提供 RAG 检索能力
- [AingDesk](https://github.com/example/AingDesk) - 前端架构参考

---

## 📞 联系方式

- **项目维护者**: Rui Wang
- **开发时间**: 2025-11
- **当前版本**: v0.1.0-alpha

---

## 🔗 相关链接

- [文档中心](./docs/INDEX.md) - 📖 完整的文档索引和导航
- [开发指南](./minedesk/DEVELOPMENT.md) - 详细的开发文档
- [项目状态](./docs/reports/PROJECT_STATUS.md) - 当前项目进度和规划
- [架构评估](./docs/reports/FRONTEND_ARCHITECTURE_EVALUATION.md) - 前端技术选型报告

---

**⭐ 如果觉得有用，请给个 Star！**

**🚀 MineDesk - Your AI-Powered Work Context Assistant**

