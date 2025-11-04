# Screenpipe 快速开始指南

## 🎯 什么是 Screenpipe？

Screenpipe 是一个 24/7 运行的屏幕和音频记录工具，它能够：

- 📹 持续录制你的屏幕活动（通过 OCR 提取文本）
- 🎤 录制麦克风音频（通过 STT 转换为文本）
- 💾 将所有数据存储在本地 SQLite 数据库
- 🔍 提供 REST API 进行搜索和查询

**核心价值**: 为 AI 应用提供完整的用户上下文，让 AI 真正"记住"你的工作历史。

## ⚡ 5 分钟快速开始

### 步骤 1: 安装 Screenpipe

Screenpipe 已经安装在 `~/.screenpipe/bin/screenpipe`。

验证安装：
```bash
~/.screenpipe/bin/screenpipe --version
# 应该显示: screenpipe 0.2.74
```

### 步骤 2: 启动 Screenpipe

```bash
./start-screenpipe.sh
```

**首次运行**: macOS 会要求授予屏幕录制和麦克风权限。

### 步骤 3: 测试 API

```bash
# 健康检查
curl http://localhost:3030/health

# 查看最近活动
curl "http://localhost:3030/search?limit=5" | python3 -m json.tool
```

### 步骤 4: 运行示例

```bash
# 查看使用帮助
node example-usage.js

# 获取工作总结
node example-usage.js summary 4

# 搜索内容
node example-usage.js search "code"
```

## 📖 核心 API 使用

### JavaScript 集成

```javascript
const screenpipe = require('./screenpipe-integration');

// 1. 检查服务状态
const isRunning = await screenpipe.isScreenpipeRunning();

// 2. 获取最近活动（最近3小时，最多50条）
const activity = await screenpipe.getRecentActivity(3, 50);

// 3. 搜索 OCR 文本
const results = await screenpipe.searchOCRContent('API', 24);

// 4. 搜索音频转录
const audio = await screenpipe.searchAudioTranscripts('meeting', 72);
```

### HTTP API 直接调用

```bash
# 获取最近活动
curl "http://localhost:3030/search?limit=10"

# 搜索 OCR 内容
curl "http://localhost:3030/search?q=python&content_type=ocr&limit=20"

# 搜索音频
curl "http://localhost:3030/search?q=discussion&content_type=audio&limit=20"

# 时间范围查询
START_TIME=$(date -u -v-3H +"%Y-%m-%dT%H:%M:%SZ")
END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
curl "http://localhost:3030/search?start_time=$START_TIME&end_time=$END_TIME"
```

## 🎯 实战场景

### 场景 1: AI 编程助手增强

在向 AI 提问前，自动添加项目上下文：

```javascript
const screenpipe = require('./screenpipe-integration');

async function askAIWithContext(userQuestion) {
  // 获取最近1小时的编程活动
  const activity = await screenpipe.getRecentActivity(1, 30);
  
  // 提取相关代码和文档
  const context = activity
    .filter(item => ['VS Code', 'Terminal', 'Browser'].includes(item.content?.app_name))
    .map(item => item.content?.text)
    .join('\n\n');
  
  // 构建增强提示
  const enhancedPrompt = `
User's Recent Activity:
${context}

User Question: ${userQuestion}
  `.trim();
  
  // 发送给 AI（OpenAI/Claude 等）
  return enhancedPrompt;
}

// 使用示例
const prompt = await askAIWithContext("How do I fix this error?");
console.log(prompt);
```

### 场景 2: 自动会议纪要

```javascript
async function generateMeetingNotes(startTime, endTime) {
  const audio = await screenpipe.queryScreenpipe(
    '/search',
    `?content_type=audio&start_time=${startTime}&end_time=${endTime}&limit=100`
  );
  
  const transcript = audio.data
    .map(item => item.content?.transcription)
    .filter(Boolean)
    .join(' ');
  
  // 使用 AI 提取关键点
  return {
    duration: (new Date(endTime) - new Date(startTime)) / 60000, // 分钟
    transcript,
    participants: extractSpeakers(audio.data),
    summary: await summarizeWithAI(transcript)
  };
}
```

### 场景 3: 智能工作统计

```javascript
async function analyzeProductivity(date = new Date()) {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  const activity = await screenpipe.queryScreenpipe(
    '/search',
    `?start_time=${startOfDay.toISOString()}&end_time=${endOfDay.toISOString()}&limit=1000`
  );
  
  const stats = {
    totalActivities: activity.data.length,
    byApp: {},
    byHour: Array(24).fill(0)
  };
  
  activity.data.forEach(item => {
    const app = item.content?.app_name || 'Unknown';
    const hour = new Date(item.timestamp).getHours();
    
    stats.byApp[app] = (stats.byApp[app] || 0) + 1;
    stats.byHour[hour]++;
  });
  
  return stats;
}
```

## 🗄️ 直接查询数据库

Screenpipe 使用 SQLite 存储所有数据，你可以直接查询：

```bash
# 数据库位置
DB="$HOME/.screenpipe/db.sqlite"

# 查看表结构
sqlite3 $DB ".tables"

# 查询最近的屏幕文本
sqlite3 $DB "
SELECT 
  f.timestamp,
  f.app_name,
  f.window_name,
  substr(o.text, 1, 100) as text_sample
FROM frames f
JOIN ocr_text o ON f.id = o.frame_id
WHERE datetime(f.timestamp) >= datetime('now', '-1 hour')
ORDER BY f.timestamp DESC
LIMIT 10;
"

# 统计应用使用时间
sqlite3 $DB "
SELECT 
  app_name,
  COUNT(*) as count,
  MIN(timestamp) as first_seen,
  MAX(timestamp) as last_seen
FROM frames
WHERE datetime(timestamp) >= datetime('now', '-8 hours')
GROUP BY app_name
ORDER BY count DESC;
"
```

## 🔧 常见问题

### Q: Screenpipe 占用多少资源？

- CPU: 平均 10%
- 内存: 约 4 GB
- 存储: 约 15 GB/月

### Q: 数据存储在哪里？

```
~/.screenpipe/
├── db.sqlite           # 主数据库
├── data/
│   ├── videos/        # 屏幕录制文件
│   └── audio/         # 音频录制文件
└── screenpipe.log     # 日志文件
```

### Q: 如何停止 Screenpipe？

```bash
# 查找进程
ps aux | grep screenpipe

# 停止进程
pkill screenpipe

# 或者使用 PID
kill <PID>
```

### Q: 如何配置隐私设置？

创建配置文件 `~/.screenpipe/config.json`:

```json
{
  "fps": 1,
  "audio_chunk_duration": 30,
  "ignored_windows": [
    "*password*",
    "*bank*"
  ],
  "ignored_apps": [
    "1Password",
    "Keychain Access"
  ],
  "ocr_engine": "apple"
}
```

### Q: OCR 不准确怎么办？

macOS 推荐使用原生 OCR:

```bash
screenpipe --ocr-engine apple
```

其他平台可以使用 Tesseract:

```bash
brew install tesseract  # macOS
screenpipe --ocr-engine tesseract
```

## 🚀 进阶使用

### 创建自定义 Pipe（插件）

```bash
# 安装 Bun（如果还没有）
curl -fsSL https://bun.sh/install | bash

# 创建新 pipe
bunx --bun @screenpipe/dev@latest pipe create

# 进入项目
cd my-awesome-pipe

# 开发
bun run dev

# 发布到 Screenpipe Store
bunx --bun @screenpipe/dev@latest pipe register --name my-pipe
bun run build
bunx --bun @screenpipe/dev@latest pipe publish --name my-pipe
```

### 集成到其他语言

Python 示例:

```python
import requests
import json

SCREENPIPE_API = "http://localhost:3030"

def get_recent_activity(hours=3, limit=50):
    response = requests.get(
        f"{SCREENPIPE_API}/search",
        params={"limit": limit}
    )
    return response.json()

def search_content(query, content_type="ocr", hours=24):
    response = requests.get(
        f"{SCREENPIPE_API}/search",
        params={
            "q": query,
            "content_type": content_type,
            "limit": 20
        }
    )
    return response.json()

# 使用
activity = get_recent_activity()
print(f"Found {len(activity.get('data', []))} activities")
```

## 📚 更多资源

- **详细文档**: `SCREENPIPE_README.md`
- **代码示例**: `example-usage.js`
- **API 集成**: `screenpipe-integration.js`
- **官方文档**: https://docs.screenpi.pe
- **GitHub**: https://github.com/mediar-ai/screenpipe
- **Discord 社区**: https://discord.gg/dU9EBuw7Uq

## 🎉 下一步

1. ✅ 启动 Screenpipe: `./start-screenpipe.sh`
2. 📝 运行示例: `node example-usage.js summary 4`
3. 🔍 搜索你的历史: `node example-usage.js search "project"`
4. 🤖 集成到你的 AI 应用中

**让 AI 拥有真正的记忆！** 🧠✨

