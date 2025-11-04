# Screenpipe Integration - 上下文感知 AI

这个项目展示了如何使用 Screenpipe 为 AI 应用提供完整的桌面上下文，实现真正的"AI 记忆"。

## 🎯 核心价值

Screenpipe 24/7 记录你的屏幕和音频，通过 OCR 和语音转文字技术创建一个可搜索的数据库。这让 AI 能够：

- 📊 **理解你当前的工作上下文** - 知道你正在使用什么应用、浏览什么网页
- 🔍 **回答关于过去活动的问题** - "我上周在哪个会议上讨论过这个？"
- 💡 **提供智能建议** - 基于你的工作模式和历史
- 📝 **自动生成工作总结** - 无需手动记录

## 🚀 快速开始

### 1. 安装 Screenpipe

```bash
# macOS/Linux
curl -fsSL get.screenpi.pe/cli | sh

# Windows
iwr get.screenpi.pe/cli.ps1 | iex
```

或者直接下载桌面应用：[screenpi.pe](https://screenpi.pe)

### 2. 启动 Screenpipe

```bash
screenpipe
```

第一次运行需要授予屏幕录制和麦克风权限（macOS）。

### 3. 测试集成

```bash
# 测试基础功能
node screenpipe-integration.js

# 查看使用示例
node example-usage.js
```

## 📖 功能演示

### 1. 构建上下文感知的 AI 提示

自动收集用户当前的工作上下文，增强 AI 提示：

```bash
node example-usage.js context "Help me write a project proposal"
```

输出示例：
```
User Query: Help me write a project proposal

## User Context (Last 1 Hour)

### Active Applications:
- Google Chrome
- VS Code
- Slack

### Visited URLs:
- https://github.com/your-org/project
- https://docs.google.com/document/...

### Recent Screen Text:
1. 14:23:15 (VS Code):
   // API endpoint implementation
   function handleRequest(req, res) { ... }
```

### 2. 生成工作总结

自动总结过去几小时的工作活动：

```bash
node example-usage.js summary 8
```

输出示例：
```
## Work Summary

Total activities tracked: 234

### Top Applications:
  - VS Code: 89 activities
  - Google Chrome: 67 activities
  - Terminal: 34 activities
  - Slack: 28 activities

### Websites Visited:
  - https://stackoverflow.com/questions/...
  - https://github.com/...
  - https://docs.openai.com/...

### Audio Transcripts: 12 segments captured
```

### 3. 搜索工作历史

在屏幕内容和音频转录中搜索特定主题：

```bash
node example-usage.js search "database migration"
```

## 🔧 API 使用

### 获取最近活动

```javascript
const screenpipe = require('./screenpipe-integration');

// 获取最近3小时的活动
const activity = await screenpipe.getRecentActivity(3, 50);

activity.forEach(item => {
  console.log(`${item.type} - ${item.timestamp}`);
  console.log(item.content.text);
});
```

### 搜索 OCR 内容

```javascript
// 搜索最近24小时内包含 "API" 的屏幕内容
const results = await screenpipe.searchOCRContent('API', 24);

results.forEach(result => {
  console.log(`Found in ${result.content.app_name}:`);
  console.log(result.content.text);
});
```

### 搜索音频转录

```javascript
// 搜索会议录音中的关键词
const audioResults = await screenpipe.searchAudioTranscripts('action items', 72);

audioResults.forEach(result => {
  console.log(`${new Date(result.timestamp).toLocaleString()}:`);
  console.log(result.content.transcription);
});
```

## 📊 数据库直接查询

Screenpipe 使用 SQLite 存储数据，你可以直接查询数据库：

```bash
# 数据库位置
~/.screenpipe/db.sqlite

# 使用 sqlite3 查询
sqlite3 ~/.screenpipe/db.sqlite "
SELECT timestamp, app_name, window_name
FROM frames
WHERE julianday(timestamp) >= julianday('now', '-3 hours')
ORDER BY timestamp DESC
LIMIT 10;
"
```

### 常用 SQL 查询

#### 查找最近的屏幕文本

```sql
SELECT f.timestamp, f.app_name, 
       substr(replace(o.text, char(10), ' '), 1, 200) AS text_sample
FROM ocr_text_fts ft
JOIN ocr_text o ON o.frame_id = ft.frame_id
JOIN frames f ON f.id = o.frame_id
WHERE julianday(f.timestamp) >= julianday('now', '-3 hours')
  AND ft MATCH 'error OR bug'
ORDER BY f.timestamp DESC
LIMIT 50;
```

#### 统计应用使用情况

```sql
SELECT app_name, COUNT(*) AS usage_count
FROM frames
WHERE julianday(timestamp) >= julianday('now', '-8 hours')
GROUP BY app_name
ORDER BY usage_count DESC
LIMIT 10;
```

#### 搜索音频转录

```sql
SELECT t.timestamp, t.transcription, t.speaker_id
FROM audio_transcriptions_fts ft
JOIN audio_transcriptions t ON t.audio_chunk_id = ft.audio_chunk_id
WHERE julianday(t.timestamp) >= julianday('now', '-24 hours')
  AND ft MATCH 'meeting OR discussion'
ORDER BY t.timestamp DESC
LIMIT 20;
```

## 🎨 实际应用场景

### 1. AI 编程助手

```javascript
// 在请求 AI 帮助时自动包含项目上下文
const context = await buildContextAwarePrompt(
  "How do I implement user authentication?"
);

// 发送给 OpenAI / Claude
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful coding assistant.' },
      { role: 'user', content: context }
    ]
  })
});
```

### 2. 自动会议记录

```javascript
// 在会议结束后自动生成总结
async function summarizeMeeting(meetingStart, meetingEnd) {
  const audioTranscripts = await screenpipe.queryScreenpipe(
    '/search',
    `?content_type=audio&start_time=${meetingStart}&end_time=${meetingEnd}`
  );

  const screenContent = await screenpipe.queryScreenpipe(
    '/search',
    `?content_type=ocr&start_time=${meetingStart}&end_time=${meetingEnd}`
  );

  // 将内容发送给 AI 进行总结
  const summary = await generateSummaryWithAI({
    audio: audioTranscripts,
    screen: screenContent
  });

  return summary;
}
```

### 3. 智能时间追踪

```javascript
// 自动分析工作时间分配
async function analyzeTimeSpent(date) {
  const activity = await screenpipe.getRecentActivity(24, 1000);

  const timeByProject = {};
  
  activity.forEach(item => {
    const project = detectProject(item.content); // 基于窗口标题、URL 等识别项目
    timeByProject[project] = (timeByProject[project] || 0) + 1;
  });

  return timeByProject;
}
```

## 🔒 隐私和安全

- ✅ **100% 本地运行** - 所有数据存储在本地，不上传到云端
- ✅ **完全可控** - 可以随时暂停录制、删除数据
- ✅ **选择性录制** - 可以配置排除特定应用或网站

### 推荐的隐私设置

编辑 `~/.screenpipe/config.json`：

```json
{
  "ignored_windows": [
    "*Password*",
    "*Banking*",
    "*Private*"
  ],
  "ignored_apps": [
    "Keychain Access",
    "1Password"
  ]
}
```

## 📦 系统要求

- **CPU**: 10% 平均使用率
- **内存**: 4 GB RAM
- **存储**: 约 15 GB/月（取决于使用量）
- **支持平台**: macOS, Windows, Linux

## 🛠️ 故障排查

### Screenpipe 无法启动

```bash
# 检查是否已授予权限（macOS）
# 系统设置 > 隐私与安全性 > 屏幕录制
# 系统设置 > 隐私与安全性 > 麦克风

# 检查端口是否被占用
lsof -i :3030

# 查看日志
screenpipe --debug
```

### API 连接失败

```bash
# 测试 API 是否响应
curl http://localhost:3030/health

# 检查防火墙设置
```

### OCR 质量问题

```bash
# macOS 使用原生 OCR（最佳）
screenpipe --ocr-engine apple

# 或使用 Tesseract
brew install tesseract
screenpipe --ocr-engine tesseract
```

## 🌟 进阶功能

### 1. 创建 Screenpipe 插件（Pipe）

```bash
bunx --bun @screenpipe/dev@latest pipe create
```

### 2. 集成到 Tauri 应用

参考：[screenpipe-tauri-template](https://github.com/LorenzoBloedow/screenpipe-tauri-template-dev)

### 3. 发布到 Screenpipe Store

```bash
cd your-pipe
bunx --bun @screenpipe/dev@latest pipe register --name your-pipe
bun run build
bunx --bun @screenpipe/dev@latest pipe publish --name your-pipe
```

## 🤝 贡献

Screenpipe 是开源项目：[github.com/mediar-ai/screenpipe](https://github.com/mediar-ai/screenpipe)

## 📚 更多资源

- [官方文档](https://docs.screenpi.pe)
- [API 参考](https://docs.screenpi.pe/api)
- [Discord 社区](https://discord.gg/dU9EBuw7Uq)
- [YouTube 教程](https://www.youtube.com/@mediar_ai)

## 📄 许可证

MIT OR Apache-2.0

---

**构建于 2025 年 - 让 AI 拥有真正的记忆** 🧠✨

