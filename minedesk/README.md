# 🚀 MineDesk

**AI-Powered Knowledge Mining Desktop Assistant**

MineDesk 是一个智能桌面助手，结合了屏幕活动捕获、RAG 知识检索和多智能体协作，帮助你挖掘工作记忆，生成智能洞察。

---

## ✨ 核心特性

### 🧠 智能对话
- 流式 AI 对话响应
- 上下文感知对话
- 代码高亮和 Markdown 渲染
- 引用来源追踪

### 📸 记忆捕获
- 基于 Screenpipe 的桌面活动记录
- 屏幕截图自动采集
- 应用使用时间追踪
- 智能上下文提取

### 📚 知识检索
- 基于 MineContext 的 RAG 系统
- 语义搜索和文档检索
- 向量数据库集成
- 智能文档分块

### 📝 周报生成
- CrewAI 多智能体协作
- 自动生成工作总结
- 结构化周报输出
- 可定制模板

### 🔒 隐私保护
- 红区遮罩（敏感区域保护）
- 本地数据存储
- 加密传输
- 权限精细控制

---

## 🏗️ 技术架构

### 前端技术栈
- **运行时**: Electron 37
- **框架**: React 19.1.0
- **语言**: TypeScript 5.8
- **构建**: Electron-Vite 4
- **样式**: TailwindCSS 4
- **状态**: Zustand
- **UI**: Radix UI + Lucide Icons
- **AI**: @ai-sdk/react

### 后端集成
- **RAG**: MineContext (Python FastAPI)
- **记忆层**: Screenpipe (Rust)
- **多智能体**: CrewAI (Python)
- **数据库**: SQLite (better-sqlite3)

---

## 🚀 快速开始

### 前置要求
- Node.js >= 20
- pnpm >= 9
- Python >= 3.11 (后端服务)
- Screenpipe >= 0.2.74

### 安装依赖
```bash
cd minedesk
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 构建应用
```bash
# macOS
pnpm build:mac

# Windows
pnpm build:win

# Linux
pnpm build:linux
```

---

## 📂 项目结构

```
minedesk/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.ts       # 主入口
│   │   ├── ipc/           # IPC 通信
│   │   ├── services/      # 核心服务
│   │   │   ├── ScreenpipeService.ts
│   │   │   ├── MineContextService.ts
│   │   │   ├── DatabaseService.ts
│   │   │   └── TrayService.ts
│   │   └── utils/         # 工具函数
│   │
│   ├── renderer/          # React 渲染进程
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── AIAssistant/
│   │   │   │   ├── ContextPanel/
│   │   │   │   ├── Timeline/
│   │   │   │   └── ui/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   └── utils/
│   │   └── index.html
│   │
│   └── preload/           # Preload 脚本
│       └── index.ts
│
├── resources/             # 应用资源
├── package.json
├── electron-builder.yml
└── README.md
```

---

## 🔑 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd+Space` / `Ctrl+Space` | 快速唤起 MineDesk |
| `Cmd+N` / `Ctrl+N` | 新建对话 |
| `Cmd+K` / `Ctrl+K` | 搜索上下文 |
| `Cmd+,` / `Ctrl+,` | 打开设置 |
| `Esc` | 隐藏窗口 |

---

## 🔧 配置

### 1. MineContext 配置
编辑 `config/minecontext.yaml`:
```yaml
server:
  host: localhost
  port: 8000

llm:
  provider: siliconflow
  api_key: YOUR_API_KEY
  model: deepseek-chat

rag:
  chunk_size: 1000
  chunk_overlap: 200
```

### 2. Screenpipe 配置
```bash
# 启动 Screenpipe
screenpipe --port 3030
```

### 3. CrewAI 配置
编辑 `config/crewai.yaml`:
```yaml
agents:
  - role: analyst
    goal: Analyze work activities
  - role: writer
    goal: Generate weekly report
```

---

## 📊 数据存储

### 应用数据目录
- **macOS**: `~/Library/Application Support/MineDesk`
- **Windows**: `%APPDATA%/MineDesk`
- **Linux**: `~/.config/MineDesk`

### 数据结构
```
MineDesk/
├── config.json          # 用户配置
├── conversations.db     # 对话记录
├── contexts.db          # 上下文数据
└── logs/                # 日志文件
```

---

## 🧪 测试

```bash
# 单元测试
pnpm test

# E2E 测试
pnpm test:e2e

# 类型检查
pnpm typecheck
```

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 许可证

MIT License

---

## 🙏 致谢

- [MineContext](https://github.com/volcengine/MineContext) - RAG 知识检索
- [Screenpipe](https://github.com/mediar-ai/screenpipe) - 屏幕活动捕获
- [CrewAI](https://github.com/joaomdmoura/crewAI) - 多智能体框架
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用
- [React](https://react.dev/) - UI 框架

---

**MineDesk** - 让你的工作记忆更智能 🧠✨

