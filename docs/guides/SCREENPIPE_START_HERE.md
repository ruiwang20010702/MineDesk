# 🚀 Screenpipe 集成 - 从这里开始！

## 欢迎！👋

这个项目为你的 AI 应用提供了完整的 **Screenpipe** 集成。Screenpipe 能够 24/7 记录你的屏幕和音频，让 AI 拥有真正的"记忆"。

## 🎯 30秒快速开始

```bash
# 1. 启动 Screenpipe
./start-screenpipe.sh

# 2. 运行交互式演示
node demo.js
```

就是这样！🎉

## 📚 文档指南

根据你的需求选择阅读：

### 🏃 我想快速上手
👉 **阅读**: `QUICKSTART.md` (5分钟快速指南)

包含：
- 基础安装验证
- 核心 API 使用
- 常见问题解答
- 实战代码示例

### 📖 我想深入了解
👉 **阅读**: `SCREENPIPE_README.md` (完整功能文档)

包含：
- 系统架构详解
- 完整 API 参考
- SQL 查询示例
- 隐私和安全指南
- 故障排查

### 🎓 我想看实际应用
👉 **运行**: `node demo.js` (交互式演示)

包含 4 个场景：
1. 🎯 上下文感知 AI 提示
2. 📝 智能工作总结
3. 🔍 搜索工作历史
4. 📊 系统状态查看

### 💻 我想直接看代码
👉 **查看**:
- `screenpipe-integration.js` - 核心 API 包装器
- `example-usage.js` - 实战使用示例
- `demo.js` - 交互式演示脚本

### 🎉 我想了解项目全貌
👉 **阅读**: `PROJECT_SUMMARY.md` (项目完成报告)

包含：
- 所有交付组件
- 技术栈说明
- 性能指标
- 后续扩展方向

## ⚡ 核心命令速查

```bash
# 启动 Screenpipe
./start-screenpipe.sh

# 测试集成
./test-screenpipe.sh

# 运行演示
node demo.js

# 使用示例（查看帮助）
node example-usage.js

# 生成工作总结
node example-usage.js summary 4

# 搜索内容
node example-usage.js search "API design"

# 构建上下文提示
node example-usage.js context "How do I fix this bug?"
```

## 🔍 API 快速参考

### JavaScript

```javascript
const screenpipe = require('./screenpipe-integration');

// 检查运行状态
const isRunning = await screenpipe.isScreenpipeRunning();

// 获取最近活动
const activity = await screenpipe.getRecentActivity(3, 50);

// 搜索屏幕内容
const results = await screenpipe.searchOCRContent('python', 24);

// 搜索音频
const audio = await screenpipe.searchAudioTranscripts('meeting', 72);
```

### HTTP API

```bash
# 健康检查
curl http://localhost:3030/health

# 获取数据
curl "http://localhost:3030/search?limit=10"

# 搜索
curl "http://localhost:3030/search?q=code&content_type=ocr"
```

### SQL 查询

```bash
# 直接查询数据库
sqlite3 ~/.screenpipe/db.sqlite "
SELECT timestamp, app_name, window_name
FROM frames
WHERE datetime(timestamp) >= datetime('now', '-3 hours')
ORDER BY timestamp DESC
LIMIT 10;
"
```

## 🎯 典型使用场景

### 1. AI 编程助手增强

让 AI 知道你当前的工作上下文：

```javascript
// 获取用户最近的编程活动
const context = await getRecentActivity(1, 30);

// 构建增强提示
const prompt = `
User is currently working on: ${extractProjectInfo(context)}
Recent code: ${extractCodeSnippets(context)}

User question: ${userQuery}
`;

// 发送给 AI
const response = await callOpenAI(prompt);
```

### 2. 自动会议纪要

会议结束后一键生成总结：

```javascript
const summary = await generateMeetingSummary({
  start: meetingStartTime,
  end: meetingEndTime
});

// 自动生成包含：
// - 完整转录
// - 关键决策
// - 行动项
// - 参会人员
```

### 3. 智能时间追踪

无需手动记录，自动分析工作时间：

```javascript
const stats = await analyzeProductivity(new Date());

// 按应用、项目、时间段统计
// 生成可视化报告
```

## 🛠️ 故障排查

### Screenpipe 无法启动？

```bash
# 检查权限（macOS）
# 系统设置 > 隐私与安全性 > 屏幕录制
# 系统设置 > 隐私与安全性 > 麦克风

# 查看日志
tail -f ~/.screenpipe/screenpipe.log

# 检查端口
lsof -i :3030
```

### API 无法连接？

```bash
# 验证服务
curl http://localhost:3030/health

# 应该返回: {"status":"ok"}
```

### 没有数据？

Screenpipe 需要运行一段时间来收集数据。首次运行请等待至少 5-10 分钟。

## 📊 系统要求

- ✅ **CPU**: 10% 平均使用
- ✅ **内存**: 4 GB RAM
- ✅ **存储**: ~15 GB/月
- ✅ **平台**: macOS, Windows, Linux

## 🔒 隐私说明

- ✅ **100% 本地** - 所有数据存储在你的电脑
- ✅ **完全离线** - 不需要网络连接
- ✅ **用户控制** - 可随时暂停/删除数据

## 📞 获取帮助

### 查看日志
```bash
tail -f ~/.screenpipe/screenpipe.log
```

### 运行测试
```bash
./test-screenpipe.sh
```

### 社区支持
- GitHub: [mediar-ai/screenpipe](https://github.com/mediar-ai/screenpipe)
- Discord: [Screenpipe 社区](https://discord.gg/dU9EBuw7Uq)

## 🎓 学习路径

**第 1 天**: 基础使用
1. ✅ 阅读 `QUICKSTART.md`
2. ✅ 运行 `./start-screenpipe.sh`
3. ✅ 尝试 `node demo.js`

**第 2 天**: 深入功能
1. 📖 阅读 `SCREENPIPE_README.md`
2. 💻 研究 `example-usage.js` 代码
3. 🔧 尝试修改示例代码

**第 3 天**: 实际集成
1. 🎯 将 Screenpipe 集成到你的 AI 应用
2. 🚀 实现自定义功能
3. 📊 优化和调试

## 🌟 下一步行动

选择一个开始：

- [ ] 🏃 运行 `./start-screenpipe.sh` 启动服务
- [ ] 🎬 运行 `node demo.js` 查看演示
- [ ] 📖 阅读 `QUICKSTART.md` 学习基础
- [ ] 💻 查看 `screenpipe-integration.js` 了解 API
- [ ] 🎯 开始集成到你的项目

## 💡 提示

> **首次使用**: 让 Screenpipe 运行几个小时收集数据，然后再尝试搜索和总结功能。

> **最佳实践**: 配置 `~/.screenpipe/config.json` 排除敏感应用（密码管理器、银行应用等）。

> **性能优化**: 如果系统较慢，可以降低 FPS 或禁用音频录制。

## 🎉 开始你的 AI 记忆之旅！

```bash
./start-screenpipe.sh && node demo.js
```

---

**有问题？** 查看 `SCREENPIPE_README.md` 的故障排查部分  
**想深入？** 阅读 `PROJECT_SUMMARY.md` 了解完整架构  
**准备开发？** 研究 `example-usage.js` 中的代码示例  

**让 AI 拥有记忆，让工作更智能！** 🧠✨

