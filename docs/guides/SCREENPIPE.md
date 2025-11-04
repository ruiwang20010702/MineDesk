# Screenpipe - AI 记忆集成

> 为你的 AI 应用提供 24/7 桌面上下文，让 AI 拥有真正的记忆。

## 🎯 这是什么？

Screenpipe 是一个本地运行的 24/7 屏幕和音频记录工具。它能够：

- 📹 **持续录制屏幕** - 通过 OCR 提取所有文本
- 🎤 **录制音频** - 通过 STT 转换为可搜索的文本
- 💾 **本地存储** - 100% 隐私，数据不离开你的电脑
- 🔍 **强大搜索** - FTS5 全文搜索，毫秒级响应
- 🤖 **AI 就绪** - REST API + JavaScript SDK

## ⚡ 30秒快速开始

```bash
# 1. 启动 Screenpipe
./start-screenpipe.sh

# 2. 运行演示
node demo.js
```

**就是这么简单！** 🎉

## 📚 文档导航

### 🏃‍♂️ 快速开始
- **[SCREENPIPE_START_HERE.md](SCREENPIPE_START_HERE.md)** ⭐ - 从这里开始！
- **[QUICKSTART.md](QUICKSTART.md)** - 5分钟教程

### 📖 深入学习
- **[SCREENPIPE_README.md](SCREENPIPE_README.md)** - 完整功能文档
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - 技术架构
- **[FINAL_REPORT.md](FINAL_REPORT.md)** - 项目报告

### 💻 代码示例
- **[screenpipe-integration.js](screenpipe-integration.js)** - 核心 SDK
- **[example-usage.js](example-usage.js)** - 使用示例
- **[demo.js](demo.js)** - 交互式演示

## 🎯 核心功能

### 1. 获取用户上下文

```javascript
const screenpipe = require('./screenpipe-integration');

// 获取最近3小时的活动
const activity = await screenpipe.getRecentActivity(3, 50);

// 了解用户在做什么
activity.forEach(item => {
  console.log(`${item.timestamp}: ${item.content.app_name}`);
});
```

### 2. 搜索历史记录

```javascript
// 搜索屏幕上的文本
const results = await screenpipe.searchOCRContent('API design', 24);

// 搜索会议记录
const audio = await screenpipe.searchAudioTranscripts('action items', 72);
```

### 3. AI 集成

```javascript
// 为 AI 构建上下文感知提示
const context = await buildContextAwarePrompt(userQuery);

// 发送给 OpenAI/Claude
const response = await callAI(context);
```

## 🚀 实际应用

### AI 编程助手
让 AI 知道你当前的代码、文档和错误信息：

```javascript
const context = await screenpipe.getRecentActivity(1, 30);
const prompt = `User is working on: ${extractProject(context)}
Recent code: ${extractCode(context)}
Question: ${userQuery}`;
```

### 自动会议纪要
会议结束后一键生成总结：

```javascript
const summary = await generateMeetingSummary(startTime, endTime);
// 包含：转录、关键决策、行动项
```

### 智能时间追踪
自动分析工作时间分配：

```javascript
const stats = await analyzeProductivity(new Date());
// 按应用、项目、时段统计
```

## 📊 技术规格

- **CPU 使用**: ~10% 平均
- **内存**: ~4 GB
- **存储**: ~15 GB/月
- **平台**: macOS, Windows, Linux
- **隐私**: 100% 本地，不上传云端

## 🔒 隐私和安全

✅ **完全本地** - 所有数据存储在你的电脑  
✅ **离线运行** - 不需要网络连接  
✅ **用户控制** - 可随时暂停、删除数据  
✅ **黑名单** - 排除敏感应用和窗口  

配置示例：

```json
{
  "ignored_apps": ["1Password", "Keychain Access"],
  "ignored_windows": ["*password*", "*bank*"]
}
```

## 🛠️ 命令速查

```bash
# 启动服务
./start-screenpipe.sh

# 验证安装
./verify-installation.sh

# 运行演示
node demo.js

# 生成总结
node example-usage.js summary 4

# 搜索内容
node example-usage.js search "项目"

# 查看日志
tail -f ~/.screenpipe/screenpipe.log

# 测试 API
curl http://localhost:3030/health
```

## 🎓 学习路径

**第 1 天**: 基础使用
1. 阅读 [SCREENPIPE_START_HERE.md](SCREENPIPE_START_HERE.md)
2. 运行 `./start-screenpipe.sh`
3. 尝试 `node demo.js`

**第 2 天**: 深入功能
1. 阅读 [SCREENPIPE_README.md](SCREENPIPE_README.md)
2. 研究 [example-usage.js](example-usage.js)
3. 修改示例代码

**第 3 天**: 实际集成
1. 集成到你的 AI 应用
2. 实现自定义功能
3. 优化和调试

## 🌟 项目亮点

1. **开箱即用** - 一键启动，立即可用
2. **完全本地** - 100% 隐私保护
3. **功能完整** - REST API + JavaScript SDK
4. **详尽文档** - 从入门到精通
5. **实战示例** - 可直接用于生产

## 📞 获取帮助

- 📖 查看文档: [SCREENPIPE_START_HERE.md](SCREENPIPE_START_HERE.md)
- 🔍 运行测试: `./verify-installation.sh`
- 💬 查看日志: `tail -f ~/.screenpipe/screenpipe.log`
- 🌐 官方文档: https://docs.screenpi.pe
- 💡 社区支持: https://discord.gg/dU9EBuw7Uq

## 📦 已安装组件

✅ Screenpipe CLI v0.2.74  
✅ Bun Runtime v1.3.1  
✅ FFmpeg (内置)  
✅ JavaScript SDK  
✅ 完整文档  

## 🎉 开始你的 AI 记忆之旅

```bash
./start-screenpipe.sh && node demo.js
```

---

**让 AI 拥有记忆，让工作更智能！** 🧠✨

[开始使用](SCREENPIPE_START_HERE.md) · [查看文档](SCREENPIPE_README.md) · [运行演示](demo.js)

